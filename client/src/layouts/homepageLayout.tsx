import { Outlet } from 'react-router';
import { useState } from 'react';
import HeaderC from '../app/home/homepage/header/HeaderC';
import FooterC from '../app/home/homepage/footer/FooterC';
import type { CartItem } from '../../src/app/home/homepage/Cart/Cart';

export default function HomepageLayout() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [openCart, setOpenCart] = useState(false);

  const handleAddToCart = (product: CartItem) => {
    setCartItems(prev => {
      const exist = prev.find(item => item.id === product.id);
      if (exist) {
        return prev.map(item =>
          item.id === product.id
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
      <main className='flex-1'>
        <Outlet
          context={{ cartItems, setCartItems, onAddToCart: handleAddToCart }}
        />
      </main>
      <FooterC />
    </div>
  );
}
