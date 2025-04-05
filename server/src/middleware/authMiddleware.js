import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error('Missing Firebase environment variables. Check your .env file.');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

// Middleware to validate Firebase ID token
const validateFirebaseIdToken = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'Unauthorized: No token provided' });
  }

  const idToken = req.headers.authorization.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const maxAllowedSessionTimeInSeconds = 3540; // 1 hour

    if (currentTimeInSeconds - decodedToken.iat > maxAllowedSessionTimeInSeconds) {
      return res.status(403).json({ message: 'Token expired' });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    if (error.code === 'auth/id-token-expired') {
      return res.status(403).json({ message: 'Token expired' });
    }
    if (error.code === 'auth/argument-error') {
      return res.status(403).json({ message: 'Invalid token' });
    }
    return res.status(403).json({ message: 'Unauthorized access' });
  }
};

export default validateFirebaseIdToken;