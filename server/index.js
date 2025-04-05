import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import openAiRoutes from './src/routes/openai.js';
import elevenlabs from './src/routes/elevenlabs.js';
import validateFirebaseIdToken from './src/middleware/authMiddleware.js';

/* CONFIGURATIONS */
dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(bodyParser.json({ limit: '30mb' }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cors());

/* ROUTES */
app.get('/', (req, res) => {
  res.send('Welcome to the Language ChatBot API!');
});

app.use('/api/openai', validateFirebaseIdToken, openAiRoutes);
app.use('/api/elevenlabs', validateFirebaseIdToken, elevenlabs);

/* SERVER SETUP */
const PORT = process.env.PORT || 9000;
app.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Error starting server:', err);
  } else {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  }
});