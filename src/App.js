import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import './App.css';
import { parseISO, compareDesc, subMonths, isAfter, startOfMonth } from 'date-fns';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

function App() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [filters, setFilters] = useState({ program: '', company: '' });
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tokenRes = await fetch('/api/getAccessToken');
        if (!tokenRes.ok) {
          throw new Error('Failed to fetch access token');
        }
        const tokenData = await tokenRes.json();

        // Assuming your backend is set up to handle no limits/offsets by fetching all data
        const contentRes = await fetch(`/api/fetchContent?token=${tokenData.token}&limit=0`);
        if (!contentRes.ok) {
          throw new Error('Failed to fetch content');
        }
        const contentData = await contentRes.json();

        const articlesData = Array.isArray(contentData) ? contentData : [];
        // Sort articles by date, latest first
        const sortedArticles = articlesData.sort((a, b) => 
          compareDesc(parseISO(a.month), parseISO(b.month))
        );
        setArticles(sortedArticles);
        setFilteredArticles(sortedArticles);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filterContent = () => {
      const currentDate = new Date();
      const fiveMonthsAgo = subMonths(startOfMonth(currentDate), 5);

      const filtered = articles.filter(article => {
        const articleMonth = parseISO(article.month);
        return (!filters.program || article.program_detail === filters.program) &&
               (!filters.company || article.company_name === filters.company) &&
               isAfter(articleMonth, fiveMonthsAgo) &&
               !isAfter(articleMonth, currentDate);
      });
      setFilteredArticles(filtered);
    };

    filterContent();
  }, [filters, articles]);

  const handleFilterChange = (selectedOption, filterType) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: selectedOption ? selectedOption.value : ''
    }));
  };

  const handleImageClick = (url) => {
    setModalImage(url);
  };

  const handleCloseModal = () => {
    setModalImage(null);
  };

  const handleMouseMove = (e, container) => {
    const tooltip = container.querySelector('.tooltip');
    if (tooltip) {
      tooltip.style.left = `${e.clientX - container.getBoundingClientRect().left}px`;
      tooltip.style.top = `${e.clientY - container.getBoundingClientRect().top}px`;
    }
  };

  const filteredPrograms = useMemo(() => {
    return [...new Set(filteredArticles.map(article => article.program_detail))];
  }, [filteredArticles]);

  const filteredCompanies = useMemo(() => {
    return [...new Set(filteredArticles.map(article => article.company_name))];
  }, [filteredArticles]);

  const programOptions = useMemo(() => filteredPrograms.map(program => ({
    value: program,
    label: program
  })), [filteredPrograms]);

  const companyOptions = useMemo(() => filteredCompanies.map(company => ({
    value: company,
    label: company
  })), [filteredCompanies]);

  return (
    <div className="container">
      <div className="filters">
        <Select 
          options={programOptions} 
          onChange={selectedOption => handleFilterChange(selectedOption, 'program')}
          isClearable 
          placeholder="Select Program Name" 
          className="custom-select"
          classNamePrefix="custom-select"
        />

        <Select 
          options={companyOptions} 
          onChange={selectedOption => handleFilterChange(selectedOption, 'company')} 
          isClearable 
          placeholder="Search Company Name" 
          className="custom-select"
          classNamePrefix="custom-select"
        />
      </div>
      <div className="images-grid" id="imagesGrid">
        {filteredArticles.map(article => {
          const imageUrl = `${process.env.REACT_APP_DIRECTUS_API_ENDPOINT}/assets/${article.learner_image}`;
          return (
            <div 
              className="image-container" 
              key={article.id} 
              onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
            >
              <LazyLoadImage 
                src={imageUrl} 
                alt={article.program_detail || 'No Image'} 
                effect="blur"
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
                onError={(e) => { e.target.style.display = 'none'; }} 
                onClick={() => handleImageClick(imageUrl)}
              />
              <div className="tooltip">Click to Open</div>
            </div>
          );
        })}
      </div>

      {modalImage && (
        <div className="modal" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <LazyLoadImage 
              src={modalImage} 
              alt="Modal" 
              effect="blur"
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
