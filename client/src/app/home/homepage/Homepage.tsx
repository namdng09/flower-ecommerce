import BestSellingProductsC from './BestSellingProductsC/BestSellingProductsC';
import CarouselC from './carousel/CarouselC';
import CategoryGridC from './CategoryGridC/CategoryGridC';
import FeaturedProductsC from './FeaturedProductsC/FeaturedProductsC';
import FeedbackC from './Feedback/FeedbackC';

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
