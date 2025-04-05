import fetch from 'node-fetch';
import express from 'express';

const router = express.Router();

router.post('/text-to-speech', async (req, res) => {
  const textToConvert = req.body.text;

  if (!textToConvert) {
    return res.status(400).json({ message: 'Text is required' });
  }

  if (!process.env.ELEVEN_LABS_API_KEY) {
    return res.status(500).json({ message: 'ElevenLabs API key is missing' });
  }

  const options = {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVEN_LABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model_id: 'eleven_monolingual_v1',
      text: textToConvert,
      voice_settings: {
        similarity_boost: 1,
        stability: 1,
        style: 1,
        use_speaker_boost: true,
      },
    }),
  };

  try {
    const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', options);
    if (!elevenLabsResponse.ok) {
      throw new Error(`HTTP error! Status: ${elevenLabsResponse.status}`);
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    elevenLabsResponse.body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving audio file', error: err.message });
  }
});

export default router; 