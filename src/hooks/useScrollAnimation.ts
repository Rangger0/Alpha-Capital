import { useEffect, useRef, useState, useCallback } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || isVisible) return;

    const initObserver = () => {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            requestAnimationFrame(() => {
              setIsVisible(true);
            });
            
            if (triggerOnce && observerRef.current) {
              observerRef.current.disconnect();
              observerRef.current = null;
            }
          }
        },
        { 
          threshold, 
          rootMargin,
        }
      );

      observerRef.current.observe(element);
    };

    initObserver();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [threshold, rootMargin, triggerOnce, isVisible]);

  return { ref, isVisible };
}

export function useScrollAnimationGroup(count: number, options: UseScrollAnimationOptions = {}) {
  const { ref, isVisible } = useScrollAnimation(options);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  
  useEffect(() => {
    if (!isVisible) return;
    
    let rafId: number;
    let currentIndex = 0;
    
    const animateNext = () => {
      if (currentIndex >= count) return;
      
      setVisibleItems(prev => new Set([...prev, currentIndex]));
      currentIndex++;
      
      rafId = requestAnimationFrame(() => {
        setTimeout(animateNext, 50);
      });
    };
    
    rafId = requestAnimationFrame(animateNext);
    
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isVisible, count]);

  const getDelay = useCallback((index: number) => {
    return visibleItems.has(index) ? index * 50 : 0;
  }, [visibleItems]);

  const isItemVisible = useCallback((index: number) => {
    return visibleItems.has(index);
  }, [visibleItems]);

  return { ref, isVisible, getDelay, isItemVisible };
}