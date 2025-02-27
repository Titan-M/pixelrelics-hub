
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

export default function Cart() {
  const { cartItems, removeFromCart, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Calculate total price
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.game.is_free ? 0 : item.game.price);
  }, 0);
  
  // Apply a fake discount (10%)
  const discount = subtotal > 0 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  if (!user) {
    navigate('/login');
    return null;
  }
  
  if (cartCount === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
          
          <div className="text-center py-16 bg-card rounded-lg border">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Looks like you haven't added any games to your cart yet</p>
            <Button onClick={() => navigate('/store')}>Browse Store</Button>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-card rounded-lg border">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">{cartCount} {cartCount === 1 ? 'Item' : 'Items'}</h2>
                
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded bg-cover bg-center" style={{ backgroundImage: `url(${item.game.image_url})` }}></div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium">{item.game.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.game.genre}</p>
                      </div>
                      
                      <div className="font-bold">
                        {item.game.is_free ? 'Free' : `$${item.game.price.toFixed(2)}`}
                      </div>
                      
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => removeFromCart(item.game.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-500">
                      <span>Discount (10%)</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <Separator className="my-3" />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/checkout')}
                >
                  Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
