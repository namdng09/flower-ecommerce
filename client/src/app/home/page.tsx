import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import axios from 'axios';
import BestSellingProductsC from '../../components/BestSellingProductsC/BestSellingProductsC';
import CarouselC from '../../components/carousel/CarouselC';
import CategoryGridC from '../../components/CategoryGridC/CategoryGridC';
import FeaturedProductsC from '../../components/FeaturedProductsC/FeaturedProductsC';
import FeedbackC from '../../components/Feedback/FeedbackC';

function Homepage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
   
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
  }, [navigate]);

  return (
    <div>
      <CarouselC />
      <CategoryGridC />
      <FeaturedProductsC />
      <FeedbackC />
      <BestSellingProductsC />
    </div>
  );
}

export default Homepage;