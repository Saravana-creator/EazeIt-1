import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiGetProducts, apiAddProduct, apiUpdateProduct, apiDeleteProduct } from '../Utils/api';
import { showToast } from '../Components/Toast';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  // Load products from MongoDB via API on mount
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const apiProds = await apiGetProducts();
        const mappedProds = apiProds.map((p) => ({
          ...p,
          id: p._id || p.id,
        }));
        setProducts(mappedProds);
      } catch (error) {
        console.error('Failed to load products from backend:', error.message);
        showToast('Failed to load products. Please check your connection.', true);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  /** Add a new product (Admin → Add Product) */
  const addProduct = useCallback(async (productData) => {
    const saved = await apiAddProduct({
      name:     productData.name,
      category: productData.category,
      brand:    productData.brand || 'Others',
      price:    parseFloat(productData.price),
      mrp:      parseFloat(productData.mrp) || 0,
      unit:     productData.unit || '',
      badge:    productData.badge || '',
      image:    productData.image || '',
    });
    const newProduct = { ...saved, id: saved._id || saved.id };
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  }, []);

  /** Update an existing product by id (Admin → Edit modal) */
  const updateProduct = useCallback(async (id, updates) => {
    const saved = await apiUpdateProduct(id, {
      name:     updates.name,
      category: updates.category,
      brand:    updates.brand,
      price:    parseFloat(updates.price),
      mrp:      parseFloat(updates.mrp) || 0,
      unit:     updates.unit,
      badge:    updates.badge,
      image:    updates.image,
    });
    const mappedSaved = { ...saved, id: saved._id || saved.id };
    setProducts((prev) => prev.map((p) => (p.id === id ? mappedSaved : p)));
    return mappedSaved;
  }, []);

  /** Delete a product by id (Admin → Manage Products) */
  const deleteProduct = useCallback(async (id) => {
    await apiDeleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  /** Reload products from MongoDB (e.g. after bulk operations) */
  const refreshProducts = useCallback(async () => {
    try {
      const apiProds = await apiGetProducts();
      setProducts(apiProds.map((p) => ({ ...p, id: p._id || p.id })));
    } catch (error) {
      showToast('Failed to refresh products.', true);
    }
  }, []);

  const value = {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within a ProductProvider');
  return ctx;
}
