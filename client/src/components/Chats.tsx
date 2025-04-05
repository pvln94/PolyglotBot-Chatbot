import React from "react";
import { List, ListItem, ListItemButton, IconButton, ListItemText, Button } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

interface Chat {
  id: string;
  chat: string;
  messages: any[];
}

interface ChatsProps {
  chats: Record<string, Chat>;
  deleteChatHandler: (chatId: string) => void;
  switchChat: (chatId: string) => void;
  handleNewChatClick: () => void;
  currentChatId: string | null;
}

const Chats: React.FC<ChatsProps> = ({ chats, deleteChatHandler, switchChat, handleNewChatClick, currentChatId }) => {
  return (
    <>
      <Button variant="contained" onClick={handleNewChatClick} sx={{ m: 1 }}>
        New Chat
      </Button>
      <List>
        {Object.values(chats).length > 0 ? (
          Object.values(chats).reverse().map((chat) => (
            <ListItem key={chat.id} disablePadding>
              <ListItemButton
                onClick={() => switchChat(chat.id)}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  height: '69px',
                  backgroundColor: chat.id === currentChatId ? '#d3d3d3' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#d3d3d3',
                  },
                }}
              >
                <ListItemText primary={chat.chat} />
                <IconButton
                  aria-label="delete"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChatHandler(chat.id);
                  }}
                >
                  <DeleteIcon fontSize="small" style={{ color: "red" }} />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No chats available" />
          </ListItem>
        )}
      </List>
    </>
  );
};

export default Chats;