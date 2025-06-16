import { Outlet } from 'react-router';
import { useState } from 'react';
import HeaderC from '../app/home/homepage/header/HeaderC';
import FooterC from '../app/home/homepage/footer/FooterC';

const HomepageLayout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [openCart, setOpenCart] = useState(false);

  const handleAddToCart = (product) => {
    console.log('Add:', product.id, product.name);

    setCartItems(prev => {
      const exist = prev.find(item =>
        item.id === product.id &&
        item.name === product.name &&
        item.price === product.price
      );

      if (exist) {
        return prev.map(item =>
          item.id === product.id &&
            item.name === product.name &&
            item.price === product.price
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });

    setOpenCart(true);
  };

  return (
    <div className='bg-white min-h-screen flex flex-col'>
      <HeaderC
        cartItems={cartItems}
        openCart={openCart}
        setOpenCart={setOpenCart}
      />
      <main className='flex justify-center items-center flex-1 w-full'>
        <Outlet context={{ onAddToCart: handleAddToCart }} />
      </main>
      <FooterC />
    </div>
  );
};

export default HomepageLayout;
