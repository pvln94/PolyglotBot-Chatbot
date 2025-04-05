import React from "react";
import { Snackbar, SnackbarContent } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface SessionExpiredProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SessionExpired: React.FC<SessionExpiredProps> = ({ open, setOpen }) => {
  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const action = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleClose}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  return (
    <Snackbar
      open={open}
      autoHideDuration={10000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <SnackbarContent
        message="Session expired. Please log in again."
        action={action}
        sx={{ backgroundColor: 'white', color: 'black' }}
      />
    </Snackbar>
  );
};

export default SessionExpired;