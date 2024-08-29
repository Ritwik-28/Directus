const fetchAllPages = async (token) => {
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
    allData = allData.concat(data.data);
    hasMore = data.meta.page < data.meta.pageCount; // Adjust depending on the metadata structure
    page += 1;
  }

  return allData;
};

module.exports = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const data = await fetchAllPages(token);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching content:', error.message);
    res.status(500).json({ error: error.message });
  }
};
