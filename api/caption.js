export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, format = 'Photo' } = req.body;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `Write an Instagram caption for bornfromgrace — a streetwear brand built on tattoo art, calligraphy, and raw authenticity. Dark, minimal, intentional. Not corporate, not forced.\n\nFormat: ${format}\nContext: ${prompt}\n\nRules:\n- Keep it short and punchy (1-3 sentences max)\n- End with 6-10 relevant hashtags on a new line\n- No emojis unless the context calls for it\n- Sound like the brand, not a marketer\n\nReturn ONLY the caption text. Nothing else.`
        }]
      })
    });
    const data = await r.json();
    const text = data.content?.[0]?.text || '';
    const lines = text.split('\n');
    const hashtagLine = lines.filter(l => l.trim().startsWith('#')).join('\n');
    const caption = lines.filter(l => !l.trim().startsWith('#')).join('\n').trim();
    res.json({ caption, hashtags: hashtagLine.trim() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
