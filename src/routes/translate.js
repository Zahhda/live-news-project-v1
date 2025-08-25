import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { texts, target } = req.body || {};
    const key = process.env.GOOGLE_TRANSLATE_KEY;
    if (!key) return res.status(500).json({ error: 'Server missing GOOGLE_TRANSLATE_KEY' });
    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: 'texts must be a non-empty array' });
    }
    const tgt = target || 'en';

    // Google Translate v2 REST
    const url = `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`;
    const body = {
      q: texts,
      target: tgt,
      format: 'text',
    };
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    if (!resp.ok) {
      return res.status(500).json({ error: data.error?.message || 'translate error' });
    }
    const translations = (data.data?.translations || []).map(t => t.translatedText || '');
    res.json({ translations });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
