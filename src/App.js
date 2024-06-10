import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './App.css';
import { format } from 'date-fns';

function App() {
  const [articles, setArticles] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [months, setMonths] = useState([]);
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

        const articlesData = Array.isArray(contentData) ? contentData : [];
        setArticles(articlesData);
        setPrograms([...new Set(articlesData.map(article => article.program_detail))]);
        setCompanies([...new Set(articlesData.map(article => article.company_name))]);

        // Extract and format the months
        const monthsData = [...new Set(articlesData.map(article => format(new Date(article.date_created), 'MMMM yyyy')))];
        setMonths(monthsData);
        setFilteredArticles(articlesData);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const filterContent = (programFilter, companyFilter, monthFilter) => {
    const filtered = articles.filter(article => {
      const articleMonth = format(new Date(article.date_created), 'MMMM yyyy');
      return (!programFilter || article.program_detail === programFilter) &&
             (!companyFilter || article.company_name === companyFilter) &&
             (!monthFilter || articleMonth === monthFilter);
    });
    setFilteredArticles(filtered);
  };

  const handleProgramChange = (selectedOption) => {
    const programFilter = selectedOption ? selectedOption.value : '';
    filterContent(programFilter, document.getElementById('companyFilter').value, document.getElementById('monthFilter').value);
  };

  const handleCompanyChange = (selectedOption) => {
    const companyFilter = selectedOption ? selectedOption.value : '';
    filterContent(document.getElementById('programFilter').value, companyFilter, document.getElementById('monthFilter').value);
  };

  const handleMonthChange = (selectedOption) => {
    const monthFilter = selectedOption ? selectedOption.value : '';
    filterContent(document.getElementById('programFilter').value, document.getElementById('companyFilter').value, monthFilter);
  };

  const downloadImage = (url) => {
    const link = document.createElement('a');
    link.href = `${url}?download=true`; // Assuming Directus supports this
    link.download = url.substring(url.lastIndexOf('/') + 1);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const programOptions = programs.map(program => ({
    value: program,
    label: program
  }));

  const companyOptions = companies.map(company => ({
    value: company,
    label: company
  }));

  const monthOptions = months.map(month => ({
    value: month,
    label: month
  }));

  return (
    <div className="container">
      <div className="filters">
        <Select 
          id="programFilter" 
          options={programOptions} 
          onChange={handleProgramChange}
          isClearable 
          placeholder="Select program..." 
          className="custom-select"
        />

        <Select 
          id="companyFilter" 
          options={companyOptions} 
          onChange={handleCompanyChange} 
          isClearable 
          placeholder="Search company..." 
          className="custom-select"
        />

        <Select 
          id="monthFilter" 
          options={monthOptions} 
          onChange={handleMonthChange} 
          isClearable 
          placeholder="Select month..." 
          className="custom-select"
        />
      </div>
      <div className="images-grid" id="imagesGrid">
        {filteredArticles.map(article => {
          const imageUrl = `${process.env.REACT_APP_DIRECTUS_API_ENDPOINT}/assets/${article.learner_image}`;
          console.log('Image URL:', imageUrl);  // Log the image URL for debugging
          return (
            <div className="image-container" key={article.id}>
              <a href={imageUrl} download>
                <img 
                  src={imageUrl} 
                  alt={article.program_detail || 'No Image'} 
                  style={{ maxWidth: '200px', height: 'auto', borderRadius: '8px' }} 
                  onError={(e) => { e.target.style.display = 'none'; console.log('Error loading image:', imageUrl); }} 
                  onClick={() => downloadImage(imageUrl)}
                />
              </a>
              <div className="tooltip">Click to download</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;