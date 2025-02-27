
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowRight, Check, CreditCard, Clock, Wallet } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { cartItems, clearCart, cartCount } = useCart();
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
    navigate('/cart');
    return null;
  }

  const handleCheckout = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCurrentStep(2);
    
    try {
      // Add games to user library
      for (const item of cartItems) {
        const { error } = await supabase
          .from('user_library')
          .insert({
            user_id: user.id,
            game_id: item.game.id,
          });
          
        if (error) {
          // If it's a unique constraint error, it means the user already owns the game
          if (error.code !== '23505') { // PostgreSQL unique violation code
            throw error;
          }
        }
      }
      
      // Clear cart after successful purchase
      await clearCart();
      
      // Simulate final processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStep(3);
      
      toast.success('Purchase complete!', {
        description: 'Your games have been added to your library',
      });
    } catch (error: any) {
      toast.error('Error processing purchase', {
        description: error.message,
      });
      setIsProcessing(false);
      setCurrentStep(1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup 
                    defaultValue={paymentMethod} 
                    onValueChange={setPaymentMethod}
                    className="space-y-4"
                  >
                    <div className={`flex items-center space-x-3 rounded-lg border p-4 ${paymentMethod === 'credit-card' ? 'border-primary' : ''}`}>
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <Label htmlFor="credit-card" className="flex items-center flex-1 cursor-pointer">
                        <CreditCard className="mr-3 h-5 w-5" />
                        Credit / Debit Card
                      </Label>
                    </div>
                    
                    <div className={`flex items-center space-x-3 rounded-lg border p-4 ${paymentMethod === 'paypal' ? 'border-primary' : ''}`}>
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="flex items-center flex-1 cursor-pointer">
                        <Wallet className="mr-3 h-5 w-5" />
                        PayPal
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {paymentMethod === 'credit-card' && (
                    <div className="space-y-4">
                      <Separator />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="card-number">Card Number</Label>
                          <Input id="card-number" placeholder="1234 5678 9012 3456" />
                        </div>
                        
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" />
                        </div>
                        
                        <div className="col-span-2">
                          <Label htmlFor="name">Name on Card</Label>
                          <Input id="name" placeholder="Name as it appears on your card" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {paymentMethod === 'paypal' && (
                    <div className="space-y-4">
                      <Separator />
                      <p className="text-muted-foreground">You will be redirected to PayPal to complete your purchase.</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>Processing</>
                    ) : (
                      <>
                        Complete Purchase
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Processing Payment</CardTitle>
                </CardHeader>
                <CardContent className="py-12 text-center">
                  <div className="mb-6">
                    <Clock className="h-12 w-12 animate-pulse mx-auto text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Processing your order</h3>
                  <p className="text-muted-foreground">Please wait while we process your payment...</p>
                </CardContent>
              </Card>
            )}
            
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Complete!</CardTitle>
                </CardHeader>
                <CardContent className="py-12 text-center">
                  <div className="mb-6 bg-green-100 dark:bg-green-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                    <Check className="h-10 w-10 text-green-600 dark:text-green-300" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Thank you for your purchase</h3>
                  <p className="text-muted-foreground mb-6">Your games have been added to your library</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => navigate('/library')}>Go to Library</Button>
                    <Button variant="outline" onClick={() => navigate('/store')}>Continue Shopping</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded bg-cover bg-center" 
                        style={{ backgroundImage: `url(${item.game.image_url})` }}
                      ></div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm line-clamp-1">{item.game.title}</h3>
                      </div>
                      <div className="font-medium text-sm">
                        {item.game.is_free ? 'Free' : `$${item.game.price.toFixed(2)}`}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
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
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
