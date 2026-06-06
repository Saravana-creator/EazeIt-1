import React from 'react';
import AppRouter from './Router/AppRouter';
import { CartProvider } from './Context/CartContext';
import { ProductProvider } from './Context/ProductContext';

const App = () => {
  return (
    <ProductProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </ProductProvider>
  );
};

export default App;
