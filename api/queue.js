const BASE = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}`;
const TABLE = 'tblurl5fsAX6wZW1c';
const AT_HEADERS = { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` };

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };

  try {
    if (event.httpMethod === 'GET') {
      const filter = event.queryStringParameters?.filter
        ? `filterByFormula={Status}='${event.queryStringParameters.filter}'`
        : `filterByFormula=NOT({Status}='Archived')`;
      const r = await fetch(
        `${BASE}/${TABLE}?${filter}&sort[0][field]=Publish%20Date&sort[0][direction]=desc&maxRecords=50`,
        { headers: AT_HEADERS }
      );
      return { statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: await r.text() };
    }

    const body = JSON.parse(event.body || '{}');

    if (event.httpMethod === 'POST') {
      const r = await fetch(`${BASE}/${TABLE}`, {
        method: 'POST',
        headers: { ...AT_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: [{ fields: body }] })
      });
      return { statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: await r.text() };
    }

    if (event.httpMethod === 'PATCH') {
      const { id, fields } = body;
      const r = await fetch(`${BASE}/${TABLE}/${id}`, {
        method: 'PATCH',
        headers: { ...AT_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
      });
      return { statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: await r.text() };
    }

    return { statusCode: 405, headers: cors, body: 'Method not allowed' };
  } catch (e) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: e.message }) };
  }
};
