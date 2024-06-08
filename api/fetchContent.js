const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const apiEndpoint = process.env.DIRECTUS_API_ENDPOINT;
  const collectionName = 'success_stories';
  const token = req.query.token;

  const url = `${apiEndpoint}/items/${collectionName}?filter[status][_eq]=published`;

  const options = {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!data.data) {
      throw new Error('Failed to retrieve content data');
    }

    res.status(200).json(data.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};