const fetch = require('node-fetch');

const directusApiEndpoint = process.env.REACT_APP_DIRECTUS_API_ENDPOINT;
const directusUsername = process.env.DIRECTUS_USERNAME;
const directusPassword = process.env.DIRECTUS_PASSWORD;

module.exports = async (req, res) => {
  try {
    const response = await fetch(`${directusApiEndpoint}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: directusUsername,
        password: directusPassword,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to login: ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json({ token: data.data.access_token });
  } catch (error) {
    console.error('Error fetching access token:', error);
    res.status(500).json({ error: error.message });
  }
};