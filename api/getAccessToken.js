const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const apiEndpoint = process.env.DIRECTUS_API_ENDPOINT;
  const username = process.env.DIRECTUS_USERNAME;
  const password = process.env.DIRECTUS_PASSWORD;

  const loginUrl = `${apiEndpoint}/auth/login`;
  const payload = {
    email: username,
    password: password,
  };

  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  };

  try {
    const response = await fetch(loginUrl, options);
    const data = await response.json();

    if (!data.data || !data.data.access_token) {
      throw new Error('Failed to retrieve access token');
    }

    res.status(200).json({ token: data.data.access_token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};