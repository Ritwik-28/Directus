import React, { useState, useEffect } from 'react';

function App() {
  const [articles, setArticles] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tokenRes = await fetch('/api/getAccessToken');
        const tokenData = await tokenRes.json();

        const contentRes = await fetch(`/api/fetchContent?token=${tokenData.token}`);
        const contentData = await contentRes.json();

        setArticles(contentData);
        setPrograms([...new Set(contentData.map(article => article.program_detail))]);
        setCompanies([...new Set(contentData.map(article => article.company_name))]);
        setFilteredArticles(contentData);
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
          const imageUrl = `${process.env.DIRECTUS_API_ENDPOINT}/assets/${article.learner_image}`;
          console.log('Base API Endpoint:', process.env.DIRECTUS_API_ENDPOINT);
          console.log('Learner Image ID:', article.learner_image);
          console.log('Constructed Image URL:', imageUrl);
          return (
            <div key={article.id}>
              <a href={imageUrl} download>
                <img src={imageUrl} alt={article.program_detail || 'No Image'} style={{ maxWidth: '200px', height: 'auto' }} />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;