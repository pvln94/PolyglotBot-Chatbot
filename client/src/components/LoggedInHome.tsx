import React, { useState, useRef, useEffect } from "react";
import { Box, TextField, Button, Grid } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Chats from "./Chats";
import Message from "./Message";
import { User } from 'firebase/auth';
import { onAuthStateChangedHelper, getUserChatsandMessages, getMessages, getChosenChatLanguages, addChat, deleteChat, addMessages } from "../firebase";
import ChatStarter from "./ChatStarter";
import LanguageDialog from "./LanguageDialog";
import Settings from "./Settings";
import { translatedText, handleTextToSpeech, chatCompletion } from "../state/api";

import SpeechToText from "./SpeechToText";

interface Chat {
  id: string;
  chat: string;
  messages: { id: string; content: string; role: string; translated: string }[];
}

interface LoggedInHomeProps {
  handleSubmit?: () => void;
}

const LoggedInHome: React.FC<LoggedInHomeProps> = ({ handleSubmit }) => {
  const [input, setInput] = useState<string>("");
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Record<string, Chat>>({});
  const [showLanguageDialog, setShowLanguageDialog] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [chatLanguage, setChatLanguage] = useState<string | null>(null);
  const [chatTranslatedLang, setChatTranslatedLang] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ content: string; role: string }[]>([{ content: "", role: 'system' }]);
  const [currentlyPlayingMessageId, setCurrentlyPlayingMessageId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((authUser) => {
      setUser(authUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const userChats = await getUserChatsandMessages(user);
        if (userChats) {
          setChats(userChats);
        }
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const loadMessages = async () => {
      if (user && currentChatId) {
        const fetchedMessages = await getMessages(user, currentChatId);
        if (fetchedMessages) setMessages(fetchedMessages);
      }
    };
    loadMessages();
  }, [user, currentChatId]);

  useEffect(() => {
    const fetchLanguages = async () => {
      if (user && currentChatId) {
        const languages = await getChosenChatLanguages(user, currentChatId);
        if (languages) {
          setChatLanguage(languages[0]);
          setChatTranslatedLang(languages[1]);
        }
      }
    };
    fetchLanguages();
  }, [user, currentChatId]);

  useEffect(() => {
    if (currentChatId && chats[currentChatId]?.messages.length) {
      chatBoxRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentChatId, chats]);

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().then(() => {
        setAudioUrl('');
      }).catch(error => {
        console.error("Error playing the audio", error);
      });
    }
  }, [audioUrl]);

  const deleteChatHandler = async (chatId: string) => {
    if (user) {
      const deleted = await deleteChat(user, chatId);
      if (deleted) {
        const updatedChats = { ...chats };
        delete updatedChats[chatId];
        setChats(updatedChats);

        if (currentChatId === chatId) {
          const remainingChatIds = Object.keys(updatedChats);
          setCurrentChatId(remainingChatIds.length > 0 ? remainingChatIds[0] : null);
        }
      } else {
        console.error("Error deleting chat.");
      }
    }
  };

  const handleSend = async () => {
    if (input.trim() && user && currentChatId) {
      const translatedUserText = await translatedText(input, chatLanguage || 'English', chatTranslatedLang || 'English');
      await addMessages(user, currentChatId, `${chats[currentChatId].messages.length + 1}`, "user", input, translatedUserText);
      const newMessage = {
        id: `${chats[currentChatId].messages.length + 1}`,
        content: input,
        role: "user",
        translated: translatedUserText,
      };

      const updatedChats = { ...chats };
      updatedChats[currentChatId].messages.push(newMessage);
      setChats(updatedChats);

      const message = { content: input, role: "user" };
      setMessages((prev) => [...prev, message]);
      setInput("");
      setLoading(true);

      const aiText = await chatCompletion(messages, chatLanguage || 'English');
      const translatedAIText = await translatedText(aiText, chatLanguage || 'English', chatTranslatedLang || 'English');
      await addMessages(user, currentChatId, `${chats[currentChatId].messages.length + 1}`, "assistant", aiText, translatedAIText);
      const newAIMessage = {
        id: `${chats[currentChatId].messages.length + 1}`,
        content: aiText,
        role: "assistant",
        translated: translatedAIText,
      };

      updatedChats[currentChatId].messages.push(newAIMessage);
      setChats(updatedChats);

      const message2 = { content: aiText, role: "assistant" };
      setMessages((prev) => [...prev, message2]);

      if (autoPlay) {
        handleTextToSpeech(aiText, setAudioUrl);
      }

      setLoading(false);
    }
  };

  const handleLanguageDialogSubmit = async (chatName: string, language: string, translatedLang: string) => {
    if (user) {
      const newChatId = await addChat(user, chatName, language, translatedLang);
      if (newChatId) {
        const newChat = {
          id: newChatId,
          chat: chatName,
          messages: [],
        };
        setChats((prev) => ({ ...prev, [newChatId]: newChat }));
        setCurrentChatId(newChatId);
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const keyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (handleSubmit) handleSubmit();
      if (sendButtonRef.current) sendButtonRef.current.click();
    }
  };

  const handleNewChatClick = () => {
    setShowLanguageDialog(true);
  };

  const switchChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleTranscriptChange = (newTranscript: string) => {
    setInput(newTranscript.trim());
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", margin: 1, padding: 0 }}>
      <Box sx={{
        height: "91vh",
        width: "16%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "grey.300",
        border: '2px solid #4682B4',
        overflow: 'auto',
      }}>
        <LanguageDialog open={showLanguageDialog} onClose={() => setShowLanguageDialog(false)} onSubmit={handleLanguageDialogSubmit} />
        <Chats chats={chats} deleteChatHandler={deleteChatHandler} switchChat={switchChat} handleNewChatClick={handleNewChatClick} currentChatId={currentChatId} />
      </Box>

      {currentChatId ? (
        <Box sx={{
          height: "91vh",
          width: "69%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "grey.300",
          border: '2px solid #4682B4',
        }}>
          <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
            {chats[currentChatId]?.messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                canPlay={currentlyPlayingMessageId === null || currentlyPlayingMessageId === message.id}
                onPlayStateChange={(messageId, isPlaying) => {
                  if (isPlaying) setCurrentlyPlayingMessageId(messageId);
                  else if (currentlyPlayingMessageId === messageId) setCurrentlyPlayingMessageId(null);
                }}
              />
            ))}
            <div ref={chatBoxRef} />
          </Box>

          <Box sx={{ p: 2, backgroundColor: "background.default", borderTop: '2px solid #4682B4' }}>
            <Grid container alignItems="center" spacing={1}>
              <Grid item xs={10}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Type a message"
                  variant="outlined"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={keyPress}
                />
              </Grid>
              <Grid item xs="auto">
                <SpeechToText onTranscriptChange={handleTranscriptChange} />
              </Grid>
              <Grid item xs>
                <Button
                  ref={sendButtonRef}
                  fullWidth
                  color="primary"
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={handleSend}
                  disabled={loading || !currentChatId}
                >
                  Send
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      ) : (
        <Box sx={{
          height: "91vh",
          width: "84%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "grey.300",
          border: '2px solid #4682B4',
        }}>
          <ChatStarter />
        </Box>
      )}
      <Settings autoPlay={autoPlay} setAutoPlay={setAutoPlay} />
    </div>
  );
};

export default LoggedInHome;