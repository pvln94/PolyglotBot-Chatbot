import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Paper, Tooltip, IconButton } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { handleTextToSpeech } from '../state/api';

interface MessageProps {
  message: { id: string; content: string; role: string; translated: string };
  canPlay: boolean;
  onPlayStateChange: (messageId: string, isPlaying: boolean) => void;
}

const Message: React.FC<MessageProps> = ({ message, canPlay, onPlayStateChange }) => {
  const isBot = message.role === 'assistant';
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    if (audioUrl && canPlay) {
      audio = new Audio(audioUrl);
      audio.play();
      setIsPlaying(true);
      onPlayStateChange(message.id, true);

      audio.onended = () => {
        setIsPlaying(false);
        setAudioUrl('');
        onPlayStateChange(message.id, false);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        onPlayStateChange(message.id, false);
      };
    }
    return () => {
      if (audio) audio.pause();
    };
  }, [audioUrl, canPlay, message.id, onPlayStateChange]);

  const handleClick = async () => {
    if (!isPlaying && canPlay) {
      setLoading(true);
      await handleTextToSpeech(message.content, setAudioUrl);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isBot ? 'flex-start' : 'flex-end', mb: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: isBot ? 'row' : 'row-reverse', alignItems: 'center' }}>
        <Avatar sx={{ bgcolor: isBot ? 'primary.main' : 'secondary.main' }}>
          {isBot ? 'B' : 'U'}
        </Avatar>
        <Tooltip title={<p style={{ color: 'white', fontSize: '15px' }}>{message.translated || ''}</p>} placement={isBot ? 'right' : 'left'}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              ml: isBot ? 1 : 0,
              mr: isBot ? 0 : 1,
              backgroundColor: isBot ? 'primary.light' : 'secondary.light',
              borderRadius: isBot ? '20px 20px 20px 5px' : '20px 20px 5px 20px',
              maxWidth: '60%',
            }}
          >
            <Typography variant="body1">{message.content}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton onClick={handleClick} disabled={loading || isPlaying}>
                <PlayCircleOutlineIcon />
              </IconButton>
            </Box>
          </Paper>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default Message;