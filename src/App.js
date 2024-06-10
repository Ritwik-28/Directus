import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import './App.css';
import { format } from 'date-fns';

const getItemsPerPage = () => {
  const itemHeight = 250; // Estimate height of each item in pixels
  const viewportHeight = window.innerHeight;
  return Math.floor(viewportHeight / itemHeight);
};

function App() {
  const [articles, setArticles] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [months, setMonths] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tokenRes = await fetch('/api/getAccessToken');
        if (!tokenRes.ok) {
          throw new Error('Failed to fetch access token');
        }
        const tokenData = await tokenRes.json();

        const contentRes = await fetch(`/api/fetchContent?token=${tokenData.token}`);
        if (!contentRes.ok) {
          throw new Error('Failed to fetch content');
        }
        const contentData = await contentRes.json();

        const articlesData = Array.isArray(contentData) ? contentData : [];
        setArticles(articlesData);
        setPrograms([...new Set(articlesData.map(article => article.program_detail))]);
        setCompanies([...new Set(articlesData.map(article => article.company_name))]);

        const monthsData = [...new Set(articlesData.map(article => format(new Date(article.month), 'MMMM yyyy')))];
        monthsData.sort((a, b) => new Date(b) - new Date(a));
        setMonths(monthsData);
        setFilteredArticles(articlesData);
        setDisplayedArticles(articlesData.slice(0, itemsPerPage));

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [itemsPerPage]);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const filterContent = (programFilter, companyFilter, monthFilter) => {
    const filtered = articles.filter(article => {
      const articleMonth = format(new Date(article.month), 'MMMM yyyy');
      return (!programFilter || article.program_detail === programFilter) &&
             (!companyFilter || article.company_name === companyFilter) &&
             (!monthFilter || articleMonth === monthFilter);
    });
    setFilteredArticles(filtered);
    setDisplayedArticles(filtered.slice(0, itemsPerPage));
    setPage(1);
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

  const loadMore = () => {
    const nextPage = page + 1;
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    setDisplayedArticles(prev => [...prev, ...filteredArticles.slice(start, end)]);
    setPage(nextPage);
  };

  const downloadImage = (url) => {
    const link = document.createElement('a');
    link.href = `${url}?download=true`;
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
          placeholder="Select Program Name..." 
          className="custom-select"
          classNamePrefix="custom-select"
        />

        <Select 
          id="companyFilter" 
          options={companyOptions} 
          onChange={handleCompanyChange} 
          isClearable 
          placeholder="Search Company Name..." 
          className="custom-select"
          classNamePrefix="custom-select"
        />

        <Select 
          id="monthFilter" 
          options={monthOptions} 
          onChange={handleMonthChange} 
          isClearable 
          placeholder="Select Placement Month..." 
          className="custom-select"
          classNamePrefix="custom-select"
        />
      </div>
      <div className="images-grid" id="imagesGrid">
        {displayedArticles.map((article, index) => {
          const imageUrl = `${process.env.REACT_APP_DIRECTUS_API_ENDPOINT}/assets/${article.learner_image}`;
          return (
            <div className="image-container" key={article.id}>
              <LazyLoadImage
                src={imageUrl}
                alt={article.program_detail || 'No Image'}
                effect="blur"
                style={{ maxWidth: '200px', height: 'auto', borderRadius: '8px' }}
                onError={(e) => { e.target.style.display = 'none'; }}
                onClick={() => downloadImage(imageUrl)}
              />
              <div className="tooltip">Click to download</div>
            </div>
          );
        })}
      </div>
      {displayedArticles.length < filteredArticles.length && (
        <button onClick={loadMore} className="load-more-button">
          Load More
        </button>
      )}
    </div>
  );
}

export default App;