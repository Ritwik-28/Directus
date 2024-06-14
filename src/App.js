import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import './App.css';
import { format } from 'date-fns';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import InfiniteScroll from 'react-infinite-scroll-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

function App() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [filters, setFilters] = useState({ program: '', company: '', month: '' });
  const [modalImage, setModalImage] = useState(null);
  const batchSize = 20;
  const [currentBatch, setCurrentBatch] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const cachedArticles = JSON.parse(localStorage.getItem('articles'));
    const cacheTimestamp = localStorage.getItem('cacheTimestamp');
    const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

    if (cachedArticles && cacheTimestamp && (Date.now() - cacheTimestamp < cacheExpiry)) {
      setArticles(cachedArticles);
      setFilteredArticles(cachedArticles);
      setCurrentBatch(cachedArticles.slice(0, batchSize));
    } else {
      fetchData();
      localStorage.setItem('cacheTimestamp', Date.now());
    }
  }, []);

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
      setCurrentBatch(articlesData.slice(0, batchSize));
      
      const cachedArticles = JSON.parse(localStorage.getItem('articles'));
      if (JSON.stringify(cachedArticles) !== JSON.stringify(articlesData)) {
        localStorage.setItem('articles', JSON.stringify(articlesData));
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const filterContent = () => {
      const filtered = articles.filter(article => {
        const articleMonth = format(new Date(article.month), 'MMMM yyyy');
        return (!filters.program || article.program_detail === filters.program) &&
               (!filters.company || article.company_name === filters.company) &&
               (!filters.month || articleMonth === filters.month);
      });
      setFilteredArticles(filtered);
      setCurrentBatch(filtered.slice(0, batchSize));
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

  const loadMoreImages = () => {
    const nextBatch = filteredArticles.slice(currentBatch.length, currentBatch.length + batchSize);
    if (nextBatch.length === 0) {
      setHasMore(false);
      return;
    } else {
      setCurrentBatch((prevBatch) => [...prevBatch, ...nextBatch]);
    }
  };

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
      <InfiniteScroll
        dataLength={currentBatch.length}
        next={loadMoreImages}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={<p>No more images</p>}
      >
        <div className="images-grid" id="imagesGrid">
          {currentBatch.map(article => {
            const imageUrl = `${process.env.REACT_APP_DIRECTUS_API_ENDPOINT}/assets/${article.learner_image}`;
            return (
              <div className="image-container" key={article.id}>
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
      </InfiniteScroll>

      {modalImage && (
        <div className="modal" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <LazyLoadImage 
              src={modalImage} 
              alt="Modal" 
              effect="blur"
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
              onClick={() => downloadImage(modalImage)}
            />
            <div className="tooltip">Click to Download</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;