"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Product } from '@/lib/types';
import { useProductsData } from './use-products-data';
import { useDebounce } from './use-debounce';

const WINDOW_SIZE = 25;

// Fisher-Yates shuffle algorithm
const shuffle = (array: Product[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
};

// --- Session Storage Utilities ---
const getSessionItem = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) as T : null;
  } catch (error) {
    console.error(`Error reading sessionStorage key "${key}":`, error);
    return null;
  }
};

const setSessionItem = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting sessionStorage key "${key}":`, error);
  }
};


export function useWindowedProducts() {
  const { products: productsData, isLoading: isDataLoading } = useProductsData();
  const [shuffledProducts, setShuffledProducts] = useState<Product[]>([]);
  const [windows, setWindows] = useState<Product[][]>([[], [], []]);
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  // Debounce for load more clicks
  const [loadMoreClicks, setLoadMoreClicks] = useState(0);
  const debouncedLoadMore = useDebounce(loadMoreClicks, 200);

  // For "Load Previous" sticky bar
  const [isLoadPreviousVisible, setIsLoadPreviousVisible] = useState(false);
  const lastScrollY = useRef(0);

  // -- Initialization and State Restoration --
  useEffect(() => {
    if (isDataLoading || productsData.length === 0) return;

    const navigationEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0 && navigationEntries[0].type === 'reload') {
        sessionStorage.removeItem('featuredScrollY');
        sessionStorage.removeItem('featuredVisibleIds');
        sessionStorage.removeItem('featuredShuffledOrder');
    }

    const restoredScrollY = getSessionItem<number>('featuredScrollY');
    const restoredVisibleIds = getSessionItem<number[]>('featuredVisibleIds');
    const restoredShuffledOrder = getSessionItem<number[]>('featuredShuffledOrder');

    let initialShuffle: Product[];

    if (restoredShuffledOrder && restoredVisibleIds && restoredVisibleIds.length > 0) {
      const productMap = new Map(productsData.map(p => [p.id, p]));
      initialShuffle = restoredShuffledOrder.map(id => productMap.get(id)).filter(Boolean) as Product[];
      setShuffledProducts(initialShuffle);

      const restoredProducts = restoredVisibleIds.map(id => productMap.get(id)).filter(Boolean) as Product[];
      setVisibleProducts(restoredProducts);

      const firstVisibleId = restoredVisibleIds[0];
      const newStartIndex = initialShuffle.findIndex(p => p.id === firstVisibleId);
      setStartIndex(newStartIndex >= 0 ? newStartIndex : 0);

      setTimeout(() => {
        if (restoredScrollY) {
          window.scrollTo({ top: restoredScrollY, behavior: 'instant' });
        }
        setIsRestoring(false);
        setIsLoading(false);
      }, 0);

    } else {
      initialShuffle = shuffle([...productsData]);
      setShuffledProducts(initialShuffle);
      const initialWindow = initialShuffle.slice(0, WINDOW_SIZE);
      setWindows([initialWindow, [], []]);
      setVisibleProducts(initialWindow);
      setIsRestoring(false);
      setIsLoading(false);
    }
  }, [productsData, isDataLoading]);

  // -- Scroll Position Saving --
  useEffect(() => {
    const handleScroll = () => {
      if (canLoadPrevious) {
        const currentScrollY = window.scrollY;
        if (currentScrollY < lastScrollY.current) {
          setIsLoadPreviousVisible(true);
        }
        lastScrollY.current = currentScrollY;
      }
      const visibleIds = visibleProducts.map(p => p.id);
      if (visibleIds.length > 0) {
        setSessionItem('featuredScrollY', window.scrollY);
        setSessionItem('featuredVisibleIds', visibleIds);
        setSessionItem('featuredShuffledOrder', shuffledProducts.map(p => p.id));
      }
    };
    const throttledScroll = () => requestAnimationFrame(handleScroll);
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [visibleProducts, shuffledProducts]);


  const canLoadMore = startIndex + visibleProducts.length < shuffledProducts.length;
  const canLoadPrevious = startIndex > 0;

  const appendToGrid = (productsToAppend: Product[]) => {
    if (!gridRef.current) return;
    setVisibleProducts(prev => [...prev, ...productsToAppend]);
  };

  const prependToGrid = (productsToPrepend: Product[]) => {
     setVisibleProducts(prev => [...productsToPrepend, ...prev]);
  };

  const removeFromGrid = (count: number, from: 'top' | 'bottom') => {
    if (!gridRef.current) return;
    if (from === 'top') {
        setVisibleProducts(prev => prev.slice(count));
    } else {
        setVisibleProducts(prev => prev.slice(0, prev.length - count));
    }
  };

  const loadMore = useCallback(() => {
    if (!canLoadMore || isLoading) return;
    setIsLoading(true);

    const currentVisibleCount = visibleProducts.length;
    const isWindowed = currentVisibleCount >= WINDOW_SIZE * 3;

    if(isWindowed) {
      removeFromGrid(WINDOW_SIZE, 'top');
    }

    const newStartIndex = isWindowed ? startIndex + WINDOW_SIZE : startIndex;
    const nextWindowStart = newStartIndex + currentVisibleCount;
    const productsToAppend = shuffledProducts.slice(nextWindowStart, nextWindowStart + WINDOW_SIZE);

    appendToGrid(productsToAppend);
    setStartIndex(newStartIndex);

    setTimeout(() => setIsLoading(false), 100);

  }, [canLoadMore, isLoading, visibleProducts.length, shuffledProducts, startIndex]);

  // Handle debounced click
  useEffect(() => {
    if (loadMoreClicks > 0) {
      loadMore();
    }
  }, [debouncedLoadMore]);

  const loadPrevious = useCallback(() => {
    if (!canLoadPrevious || isLoading) return;
    setIsLoading(true);
    const prevHeight = gridRef.current?.scrollHeight || 0;

    removeFromGrid(WINDOW_SIZE, 'bottom');

    const newStartIndex = startIndex - WINDOW_SIZE;
    const productsToPrepend = shuffledProducts.slice(newStartIndex, newStartIndex + WINDOW_SIZE);

    prependToGrid(productsToPrepend);
    setStartIndex(newStartIndex);

    requestAnimationFrame(() => {
        const newHeight = gridRef.current?.scrollHeight || 0;
        window.scrollBy(0, newHeight - prevHeight);
        setIsLoading(false);
    });

  }, [canLoadPrevious, isLoading, startIndex, shuffledProducts]);

  return {
    products: visibleProducts,
    isLoading: isLoading && !isRestoring,
    isRestoring,
    loadMore: () => setLoadMoreClicks(c => c + 1),
    loadPrevious,
    canLoadMore,
    canLoadPrevious,
    gridRef,
    isLoadPreviousVisible,
    setIsLoadPreviousVisible
  };
}
