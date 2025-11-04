import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import axios from 'axios';
import BestSellingProductsC from '../../components/BestSellingProductsC/BestSellingProductsC';
import CarouselC from '../../components/carousel/CarouselC';
import CategoryGridC from '../../components/CategoryGridC/CategoryGridC';
import FeaturedProductsC from '../../components/FeaturedProductsC/FeaturedProductsC';
import FeedbackC from '../../components/Feedback/FeedbackC';
import Snowfall from '../../components/Snowfall/Snowfall'; // added

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
    <div className='relative'>
      <Snowfall count={110} size={[1.2, 4.2]} speed={[0.4, 1.1]} zIndex={40} />
      <CarouselC />
      <CategoryGridC />
      <FeaturedProductsC />
      <FeedbackC />
      <BestSellingProductsC />
    </div>
  );
}

export default Homepage;
