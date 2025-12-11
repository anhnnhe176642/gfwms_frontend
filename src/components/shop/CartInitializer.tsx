'use client';

import React, { useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';

export function CartInitializer() {
  const user = useAuthStore((state) => state.user);
  const cart = useCartStore((state) => state.cart);
  const initCart = useCartStore((state) => state.initCart);

  useEffect(() => {
    if (user?.id && !cart) {
      initCart(user.id);
    }
  }, [user?.id, cart, initCart]);

  return null;
}
