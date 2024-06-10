import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './App.css';

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

  const handleSearch = (selectedOption) => {
    const searchTerm = selectedOption ? selectedOption.value.toLowerCase() : '';
    const filtered = articles.filter(article =>
      article.company_name.toLowerCase().includes(searchTerm)
    );
    setFilteredArticles(filtered);
  };

  const downloadImage = (url) => {
    const link = document.createElement('a');
    link.href = `${url}?download=true`; // Assuming Directus supports this
    link.download = url.substring(url.lastIndexOf('/') + 1);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const companyOptions = companies.map(company => ({
    value: company,
    label: company
  }));

  return (
    <div className="container">
      <div className="filters">
        <select 
          id="programFilter" 
          onChange={(e) => filterContent(e.target.value, document.getElementById('companyFilter').value)}
          className="custom-select"
        >
          <option value="">All Programs</option>
          {programs.map(program => (
            <option key={program} value={program}>{program}</option>
          ))}
        </select>

        <Select 
          id="companyFilter" 
          options={companyOptions} 
          onChange={handleSearch} 
          isClearable 
          placeholder="Search company..." 
          className="search-select"
        />
      </div>
      <div className="images-grid" id="imagesGrid">
        {filteredArticles.map(article => {
          const imageUrl = `${process.env.REACT_APP_DIRECTUS_API_ENDPOINT}/assets/${article.learner_image}`;
          console.log('Image URL:', imageUrl);  // Log the image URL for debugging
          return (
            <div className="image-container" key={article.id}>
              <img 
                src={imageUrl} 
                alt={article.program_detail || 'No Image'} 
                style={{ maxWidth: '200px', height: 'auto' }} 
                onError={(e) => { e.target.style.display = 'none'; console.log('Error loading image:', imageUrl); }}
                onClick={() => downloadImage(imageUrl)}
              />
              <div className="tooltip">Click to download</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;