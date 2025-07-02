import BestSellingProductsC from '../../components/BestSellingProductsC/BestSellingProductsC';
import CarouselC from '../../components/carousel/CarouselC';
import CategoryGridC from '../../components/CategoryGridC/CategoryGridC';
import FeaturedProductsC from '../../components/FeaturedProductsC/FeaturedProductsC';
import FeedbackC from '../../components/Feedback/FeedbackC';

function Homepage() {
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
