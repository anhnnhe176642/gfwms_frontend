import { useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';

export function useCartInitialization() {
  const user = useAuthStore((state) => state.user);
  const cart = useCartStore((state) => state.cart);
  const initCart = useCartStore((state) => state.initCart);
  const isInitialized = useCartStore((state) => state.isInitialized);

  useEffect(() => {
    if (user?.id && !isInitialized) {
      initCart(user.id);
    }
  }, [user?.id, isInitialized, initCart]);
}
