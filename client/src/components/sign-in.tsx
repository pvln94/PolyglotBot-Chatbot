'use client';

import React from 'react';
import { Fragment } from 'react';
import { signInWithGoogle, signOutFirebase } from '../firebase';
import { User } from 'firebase/auth';
import { Box, Button } from "@mui/material";
import styles from './styles/sign-in.module.css';
import { useNavigate } from 'react-router-dom';

interface SignInProps {
  user: User | null;
}

const SignIn: React.FC<SignInProps> = ({ user }) => {
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/loggedin');
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  return (
    <Fragment>
      {user ? (
        <Button className={styles.signin} variant="contained" onClick={signOutFirebase}>
          Logout
        </Button>
      ) : (
        <Button className={styles.signin} onClick={handleSignIn} variant="contained">
          Login
        </Button>
      )}
    </Fragment>
  );
};

export default SignIn;