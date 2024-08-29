const fetch = require('node-fetch');

const directusApiEndpoint = process.env.REACT_APP_DIRECTUS_API_ENDPOINT;

module.exports = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    let allData = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(`${directusApiEndpoint}/items/success_stories?filter[status][_eq]=published&limit=100&page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.statusText}`);
      }

      const data = await response.json();

      // Accumulate the fetched data
      allData = allData.concat(data.data);

      // Check if there's more data to fetch
      if (data.data.length < 100) {
        hasMore = false;
      } else {
        page += 1; // Move to the next page
      }
    }

    res.status(200).json(allData);
  } catch (error) {
    console.error('Error fetching content:', error.message);
    res.status(500).json({ error: error.message });
  }
};
