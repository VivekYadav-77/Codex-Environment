export default async function handler(req, res) {
  const { endpoint } = req.query;

  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint parameter' });
  }

  try {
    const renderUrl = `${process.env.VITE_API_URL}${endpoint}`;

    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.VITE_REQUESTAPISECRET 
      }
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const renderResponse = await fetch(renderUrl, fetchOptions);
    
    const data = await renderResponse.json();
    return res.status(renderResponse.status).json(data);

  } catch (error) {
    console.error("Proxy Error:", error);
    return res.status(500).json({ error: 'Proxy server error' });
  }
}