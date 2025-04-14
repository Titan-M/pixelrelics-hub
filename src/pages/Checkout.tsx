import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  CreditCard,
  Clock,
  Wallet,
  Smartphone,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState("creditcard");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [upiId, setUpiId] = useState("");
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
    navigate("/login");
    return null;
  }

  if (cartCount === 0) {
    navigate("/cart");
    return null;
  }

  const handleCheckout = async () => {
    if (!user) return;

    // Validate UPI ID if UPI payment method is selected
    if (paymentMethod === "upi" && !upiId.trim()) {
      toast.error("Please enter your UPI ID");
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setCurrentStep(2);

    try {
      // Fetch the user's profile to get the username
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw new Error(
          "Could not retrieve user profile: " + profileError.message
        );
      }

      if (!profileData || !profileData.username) {
        throw new Error("Username not found in user profile");
      }

      const username = profileData.username;

      // Create payment records for each game in the cart
      const paymentIds = [];

      for (const item of cartItems) {
        // Insert payment record for this game
        const { data: paymentData, error: paymentError } = await supabase
          .from("payments")
          .insert({
            payment_type: paymentMethod,
            username: username,
            status: "completed",
            user_id: user.id,
            game_id: item.game.id,
          })
          .select();

        if (paymentError) {
          throw paymentError;
        }

        // Get the payment ID from the insert
        const paymentId = paymentData[0].id;
        paymentIds.push({ paymentId, gameId: item.game.id });

        // Insert into the specific payment type table based on the selected method
        if (paymentMethod === "creditcard") {
          const { error: creditCardError } = await supabase
            .from("creditcard_payments")
            .insert({
              payment_id: paymentId,
              user_id: user.id,
              username: username,
            });

          if (creditCardError) throw creditCardError;
        } else if (paymentMethod === "debitcard") {
          const { error: debitCardError } = await supabase
            .from("debitcard_payments")
            .insert({
              payment_id: paymentId,
              user_id: user.id,
              username: username,
            });

          if (debitCardError) throw debitCardError;
        } else if (paymentMethod === "upi") {
          const { error: upiError } = await supabase
            .from("upi_payments")
            .insert({
              payment_id: paymentId,
              user_id: user.id,
              username: username,
            });

          if (upiError) throw upiError;
        }

        // Add the game to user library with payment ID reference
        const { error: libraryError } = await supabase
          .from("user_library")
          .insert({
            user_id: user.id,
            game_id: item.game.id,
            payment_id: paymentId,
          });

        if (libraryError) {
          // If it's a unique constraint error, it means the user already owns the game
          if (libraryError.code !== "23505") {
            // PostgreSQL unique violation code
            throw libraryError;
          }
        }
      }

      // Clear cart after successful purchase
      await clearCart();

      // Simulate final processing
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setCurrentStep(3);

      toast.success("Purchase complete!", {
        description: "Your games have been added to your library",
      });
    } catch (error: any) {
      toast.error("Error processing purchase", {
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
                    <div
                      className={`flex items-center space-x-3 rounded-lg border p-4 ${
                        paymentMethod === "creditcard" ? "border-primary" : ""
                      }`}
                    >
                      <RadioGroupItem value="creditcard" id="creditcard" />
                      <Label
                        htmlFor="creditcard"
                        className="flex items-center flex-1 cursor-pointer"
                      >
                        <CreditCard className="mr-3 h-5 w-5" />
                        Credit Card
                      </Label>
                    </div>

                    <div
                      className={`flex items-center space-x-3 rounded-lg border p-4 ${
                        paymentMethod === "debitcard" ? "border-primary" : ""
                      }`}
                    >
                      <RadioGroupItem value="debitcard" id="debitcard" />
                      <Label
                        htmlFor="debitcard"
                        className="flex items-center flex-1 cursor-pointer"
                      >
                        <CreditCard className="mr-3 h-5 w-5" />
                        Debit Card
                      </Label>
                    </div>

                    <div
                      className={`flex items-center space-x-3 rounded-lg border p-4 ${
                        paymentMethod === "upi" ? "border-primary" : ""
                      }`}
                    >
                      <RadioGroupItem value="upi" id="upi" />
                      <Label
                        htmlFor="upi"
                        className="flex items-center flex-1 cursor-pointer"
                      >
                        <Smartphone className="mr-3 h-5 w-5" />
                        UPI Payment
                      </Label>
                    </div>
                  </RadioGroup>

                  {(paymentMethod === "creditcard" ||
                    paymentMethod === "debitcard") && (
                    <div className="space-y-4">
                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="card-number">Card Number</Label>
                          <Input
                            id="card-number"
                            placeholder="1234 5678 9012 3456"
                          />
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
                          <Input
                            id="name"
                            placeholder="Name as it appears on your card"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "upi" && (
                    <div className="space-y-4">
                      <Separator />
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="upi-id">UPI ID</Label>
                          <Input
                            id="upi-id"
                            placeholder="username@upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                          />
                        </div>
                      </div>
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
                  <h3 className="text-lg font-medium mb-2">
                    Processing your order
                  </h3>
                  <p className="text-muted-foreground">
                    Please wait while we process your payment...
                  </p>
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
                  <h3 className="text-lg font-medium mb-2">
                    Thank you for your purchase
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Your games have been added to your library
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => navigate("/library")}>
                      Go to Library
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/store")}
                    >
                      Continue Shopping
                    </Button>
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
                        style={{
                          backgroundImage: `url(${item.game.image_url})`,
                        }}
                      ></div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm line-clamp-1">
                          {item.game.title}
                        </h3>
                      </div>
                      <div className="font-medium text-sm">
                        {item.game.is_free
                          ? "Free"
                          : `$${item.game.price.toFixed(2)}`}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600 dark:text-green-400">
                      -${discount.toFixed(2)}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
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
