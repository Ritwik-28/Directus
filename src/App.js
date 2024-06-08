import React, { useState, useEffect } from 'react';
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  const [articles, setArticles] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Environment Variable REACT_APP_DIRECTUS_API_ENDPOINT:', process.env.REACT_APP_DIRECTUS_API_ENDPOINT);

        const tokenRes = await fetch('/api/getAccessToken');
        if (!tokenRes.ok) {
          throw new Error('Failed to fetch access token');
        }
        const tokenData = await tokenRes.json();
        console.log('Access Token:', tokenData.token);

        const contentRes = await fetch(`/api/fetchContent?token=${tokenData.token}`);
        if (!contentRes.ok) {
          throw new Error('Failed to fetch content');
        }
        const contentData = await contentRes.json();
        console.log('Fetched Content:', contentData);

        setArticles(Array.isArray(contentData) ? contentData : []);
        setPrograms([...new Set(contentData.map(article => article.program_detail))]);
        setCompanies([...new Set(contentData.map(article => article.company_name))]);
        setFilteredArticles(Array.isArray(contentData) ? contentData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const filterContent = (programFilter, companyFilter) => {
    const filtered = articles.filter(article => {
      return (!programFilter || article.program_detail === programFilter) &&
             (!companyFilter || article.company_name === companyFilter);
    });
    setFilteredArticles(filtered);
  };

  return (
    <SpeedInsights>
      <div>
        <div>
          <label htmlFor="programFilter">Program:</label>
          <select id="programFilter" onChange={(e) => filterContent(e.target.value, document.getElementById('companyFilter').value)}>
            <option value="">All Programs</option>
            {programs.map(program => (
              <option key={program} value={program}>{program}</option>
            ))}
          </select>

          <label htmlFor="companyFilter">Company:</label>
          <select id="companyFilter" onChange={(e) => filterContent(document.getElementById('programFilter').value, e.target.value)}>
            <option value="">All Companies</option>
            {companies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        </div>
        <div id="content">
          {filteredArticles.map(article => {
            const imageUrl = `${process.env.REACT_APP_DIRECTUS_API_ENDPOINT}/assets/${article.learner_image}`;
            console.log('Image URL:', imageUrl);  // Log the image URL for debugging
            return (
              <div key={article.id}>
                <a href={imageUrl} download>
                  <img src={imageUrl} alt={article.program_detail || 'No Image'} style={{ maxWidth: '200px', height: 'auto' }} onError={(e) => { e.target.style.display = 'none'; console.log('Error loading image:', imageUrl); }} />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </SpeedInsights>
  );
}

export default App;