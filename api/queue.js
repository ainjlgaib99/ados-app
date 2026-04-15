const BASE = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}`;
const TABLE = 'tblurl5fsAX6wZW1c';
const AT_HEADERS = { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` };

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const filter = req.query.filter
        ? `filterByFormula={Status}='${req.query.filter}'`
        : `filterByFormula=NOT({Status}='Archived')`;
      const r = await fetch(
        `${BASE}/${TABLE}?${filter}&sort[0][field]=Publish%20Date&sort[0][direction]=desc&maxRecords=50`,
        { headers: AT_HEADERS }
      );
      return res.json(await r.json());
    }

    if (req.method === 'POST') {
      const r = await fetch(`${BASE}/${TABLE}`, {
        method: 'POST',
        headers: { ...AT_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: [{ fields: req.body }] })
      });
      return res.json(await r.json());
    }

    if (req.method === 'PATCH') {
      const { id, fields } = req.body;
      const r = await fetch(`${BASE}/${TABLE}/${id}`, {
        method: 'PATCH',
        headers: { ...AT_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
      });
      return res.json(await r.json());
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
