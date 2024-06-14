import React, { useState, useEffect, useMemo, useRef } from 'react';
import Select from 'react-select';
import './App.css';
import { format } from 'date-fns';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

function App() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [filters, setFilters] = useState({ program: '', company: '', month: '' });
  const [modalImage, setModalImage] = useState(null);
  const modalTooltipRef = useRef(null);

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
        setFilteredArticles(articlesData);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filterContent = () => {
      const filtered = articles.filter(article => {
        const articleMonth = format(new Date(article.month), 'MMMM yyyy');
        return (!filters.program || article.program_detail === filters.program) &&
               (!filters.company || article.company_name === filters.company) &&
               (!filters.month || articleMonth === filters.month);
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

  const downloadImage = (url) => {
    const link = document.createElement('a');
    link.href = `${url}?download=true`;
    link.download = url.substring(url.lastIndexOf('/') + 1);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const handleModalMouseMove = (e) => {
    if (modalTooltipRef.current) {
      modalTooltipRef.current.style.left = `${e.clientX - e.currentTarget.getBoundingClientRect().left}px`;
      modalTooltipRef.current.style.top = `${e.clientY - e.currentTarget.getBoundingClientRect().top}px`;
    }
  };

  const filteredPrograms = useMemo(() => {
    return [...new Set(filteredArticles.map(article => article.program_detail))];
  }, [filteredArticles]);

  const filteredCompanies = useMemo(() => {
    return [...new Set(filteredArticles.map(article => article.company_name))];
  }, [filteredArticles]);

  const filteredMonths = useMemo(() => {
    return [...new Set(filteredArticles.map(article => format(new Date(article.month), 'MMMM yyyy')))];
  }, [filteredArticles]);

  const programOptions = useMemo(() => filteredPrograms.map(program => ({
    value: program,
    label: program
  })), [filteredPrograms]);

  const companyOptions = useMemo(() => filteredCompanies.map(company => ({
    value: company,
    label: company
  })), [filteredCompanies]);

  const monthOptions = useMemo(() => filteredMonths.map(month => ({
    value: month,
    label: month
  })), [filteredMonths]);

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

        <Select 
          options={monthOptions} 
          onChange={selectedOption => handleFilterChange(selectedOption, 'month')} 
          isClearable 
          placeholder="Select Placement Month" 
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} onMouseMove={handleModalMouseMove}>
            <LazyLoadImage 
              src={modalImage} 
              alt="Modal" 
              effect="blur"
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
              onClick={() => downloadImage(modalImage)}
            />
            <div className="tooltip" ref={modalTooltipRef}>Click to Download</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;