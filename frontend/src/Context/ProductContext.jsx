import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getJSON, setJSON, STORAGE_KEYS } from '../Utils/storage';
import { SEED_PRODUCTS } from '../Assets';
import { apiGetProducts, apiAddProduct, apiUpdateProduct, apiDeleteProduct } from '../Utils/api';
import { showToast } from '../Components/Toast';

const ProductContext = createContext(null);

const SEEDED_KEY = 'eazeit_products_seeded';

function seedIfNeeded() {
  const alreadySeeded = localStorage.getItem(SEEDED_KEY);
  if (!alreadySeeded) {
    setJSON(STORAGE_KEYS.ADMIN_PRODUCTS, SEED_PRODUCTS);
    localStorage.setItem(SEEDED_KEY, 'true');
  }
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => {
    seedIfNeeded();
    return getJSON(STORAGE_KEYS.ADMIN_PRODUCTS, []);
  });

  // Load products from API on mount, fallback to localStorage
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const apiProds = await apiGetProducts();
        const mappedProds = apiProds.map(p => ({
          ...p,
          id: p._id || p.id,
        }));
        setProducts(mappedProds);
      } catch (error) {
        console.warn('Backend server offline. Loaded local products instead.');
      }
    };
    loadProducts();
  }, []);

  // Persist whenever products change
  useEffect(() => {
    setJSON(STORAGE_KEYS.ADMIN_PRODUCTS, products);
  }, [products]);

  /** Add a new product (called from Admin → Add Product form) */
  const addProduct = useCallback(async (productData) => {
    try {
      const saved = await apiAddProduct({
        name: productData.name,
        category: productData.category,
        brand: productData.brand || 'Others',
        price: parseFloat(productData.price),
        mrp: parseFloat(productData.mrp) || 0,
        unit: productData.unit || '',
        badge: productData.badge || '',
        image: productData.image || '',
      });
      const newProduct = {
        ...saved,
        id: saved._id || saved.id,
      };
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (error) {
      const isNetworkError = error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch');
      if (!isNetworkError) {
        showToast(error.message, true);
        throw error;
      }
      
      console.warn('Backend offline. Adding product locally.');
      const newProduct = {
        ...productData,
        id: `prod-${Date.now()}`,
        price: parseFloat(productData.price),
        mrp: parseFloat(productData.mrp) || 0,
        addedAt: new Date().toISOString(),
      };
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    }
  }, []);

  /** Update an existing product by id (called from Admin → Edit modal) */
  const updateProduct = useCallback(async (id, updates) => {
    try {
      const saved = await apiUpdateProduct(id, {
        name: updates.name,
        category: updates.category,
        brand: updates.brand,
        price: parseFloat(updates.price),
        mrp: parseFloat(updates.mrp) || 0,
        unit: updates.unit,
        badge: updates.badge,
        image: updates.image,
      });
      const mappedSaved = {
        ...saved,
        id: saved._id || saved.id,
      };
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? mappedSaved : p))
      );
      return mappedSaved;
    } catch (error) {
      const isNetworkError = error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch');
      if (!isNetworkError) {
        showToast(error.message, true);
        throw error;
      }
      
      console.warn('Backend offline. Updating product locally.');
      const updatedProduct = {
        id,
        ...updates,
        price: parseFloat(updates.price),
        mrp: parseFloat(updates.mrp) || 0,
      };
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? updatedProduct : p))
      );
      return updatedProduct;
    }
  }, []);

  /** Delete a product by id (called from Admin → Manage Products) */
  const deleteProduct = useCallback(async (id) => {
    try {
      await apiDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      const isNetworkError = error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch');
      if (!isNetworkError) {
        showToast(error.message, true);
        throw error;
      }
      console.warn('Backend offline. Deleting product locally.');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  }, []);

  const resetToSeed = useCallback(() => {
    setProducts(SEED_PRODUCTS);
  }, []);

  const value = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToSeed,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within a ProductProvider');
  return ctx;
}
