exports.handler = async (event) => {
  const cors = { 'Access-Control-Allow-Origin': '*' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };

  const token = process.env.META_PAGE_TOKEN;
  const adAcct = process.env.META_AD_ACCOUNT_ID;
  const igId = process.env.META_IG_ACCOUNT_ID;
  const base = 'https://graph.facebook.com/v19.0';

  try {
    const [spendRes, postsRes, accountRes] = await Promise.all([
      fetch(`${base}/${adAcct}/insights?fields=spend,impressions,clicks,reach,cpm,cpc&date_preset=last_7d&access_token=${token}`),
      fetch(`${base}/${igId}/media?fields=id,caption,media_type,thumbnail_url,media_url,timestamp,like_count,comments_count&limit=8&access_token=${token}`),
      fetch(`${base}/${igId}?fields=followers_count,media_count,name&access_token=${token}`)
    ]);

    const [spend, posts, account] = await Promise.all([
      spendRes.json(), postsRes.json(), accountRes.json()
    ]);

    return {
      statusCode: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spend: spend.data?.[0] || {},
        posts: posts.data || [],
        account: {
          followers: account.followers_count || 0,
          media_count: account.media_count || 0,
          name: account.name || 'bornfromgrace'
        }
      })
    };
  } catch (e) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: e.message }) };
  }
};
