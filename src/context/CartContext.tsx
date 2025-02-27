
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

export type Game = {
  id: string;
  title: string;
  price: number;
  is_free: boolean;
  image_url: string;
  genre: string;
  description: string;
  rating: number;
};

export type CartItem = {
  id: string;
  game: Game;
};

type CartContextType = {
  cartItems: CartItem[];
  cartCount: number;
  loading: boolean;
  addToCart: (game: Game) => Promise<void>;
  removeFromCart: (gameId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (gameId: string) => boolean;
};

const CartContext = createContext<CartContextType>({
  cartItems: [],
  cartCount: 0,
  loading: false,
  addToCart: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  isInCart: () => false,
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart')
        .select('id, game_id, games(id, title, price, is_free, image_url, genre, description, rating)')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      const formattedItems = data.map(item => ({
        id: item.id,
        game: {
          id: item.games.id,
          title: item.games.title,
          price: item.games.price,
          is_free: item.games.is_free,
          image_url: item.games.image_url,
          genre: item.games.genre,
          description: item.games.description,
          rating: item.games.rating,
        },
      }));

      setCartItems(formattedItems);
    } catch (error: any) {
      toast({
        title: 'Error fetching cart',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (game: Game) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add items to your cart',
        variant: 'destructive',
      });
      return;
    }

    if (isInCart(game.id)) {
      toast({
        title: 'Already in cart',
        description: `${game.title} is already in your cart`,
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cart')
        .insert({
          user_id: user.id,
          game_id: game.id,
        });

      if (error) {
        throw error;
      }

      await fetchCart();
      toast({
        title: 'Added to cart',
        description: `${game.title} has been added to your cart`,
      });
    } catch (error: any) {
      toast({
        title: 'Error adding to cart',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (gameId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      // Find the cart item with this game
      const cartItem = cartItems.find(item => item.game.id === gameId);
      if (!cartItem) return;

      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartItem.id);

      if (error) {
        throw error;
      }

      await fetchCart();
      toast({
        title: 'Removed from cart',
        description: 'Item has been removed from your cart',
      });
    } catch (error: any) {
      toast({
        title: 'Error removing from cart',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setCartItems([]);
      toast({
        title: 'Cart cleared',
        description: 'Your cart has been cleared',
      });
    } catch (error: any) {
      toast({
        title: 'Error clearing cart',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isInCart = (gameId: string) => {
    return cartItems.some(item => item.game.id === gameId);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount: cartItems.length,
        loading,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
