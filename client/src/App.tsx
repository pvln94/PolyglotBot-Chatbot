// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import LoggedInHome from './components/LoggedInHome';
import { onAuthStateChangedHelper } from './firebase'; // Ensure this matches your file name (firebase.ts)
import SessionExpired from './components/SessionExpired';
import { Box } from '@mui/material';
import './App.css';
import { User } from 'firebase/auth';

// Define a type for LoggedInHome props if needed
interface LoggedInHomeProps {
  handleSubmit?: (data: any) => void; // Adjust based on actual usage
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((authUser: User | null) => {
      setUser(authUser);
    });

    const handleSessionExpiredEvent = () => {
      setSessionExpiredOpen(true);
      setTimeout(() => setSessionExpiredOpen(false), 5000); // Auto-close after 5s
    };

    window.addEventListener('session-expired', handleSessionExpiredEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('session-expired', handleSessionExpiredEvent);
    };
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <Box width="100%" height="100%" padding="4rem 0rem 0rem 0rem">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/loggedin"
            element={user ? <LoggedInHome /> : <Home />} // Removed undefined prop
          />
        </Routes>
      </Box>
      <SessionExpired open={sessionExpiredOpen} setOpen={setSessionExpiredOpen} />
    </BrowserRouter>
  );
}