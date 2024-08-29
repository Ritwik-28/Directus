const fetch = require('node-fetch');

const directusApiEndpoint = process.env.REACT_APP_DIRECTUS_API_ENDPOINT;

module.exports = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  if (typeof token !== 'string' || token.trim() === '') {
    return res.status(400).json({ error: 'Invalid token format' });
  }

  try {
    const response = await fetch(`${directusApiEndpoint}/items/success_stories?filter[status][_eq]=published`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      timeout: 5000, // optional timeout in milliseconds
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json(data.data);
  } catch (error) {
    console.error('Error fetching content:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
