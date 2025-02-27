
import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // This would be replaced with actual Supabase auth
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      
      // Reset form
      setEmail("");
      setPassword("");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>
          
          <div className="space-y-6 bg-card p-6 sm:p-8 rounded-lg border shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full aspect-square"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember-me" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label 
                  htmlFor="remember-me" 
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <Button variant="outline" className="w-full">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </Button>
              <Button variant="outline" className="w-full">
                <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
                </svg>
              </Button>
              <Button variant="outline" className="w-full">
                <svg className="h-5 w-5 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.318 13.715c.607-.309 1.212-.94 1.296-2.005.027-.341-.076-.634-.23-.878-.19-.311-.548-.571-1.047-.762C15.318 9.76 14.232 9.784 13 10c-1.225-.204-2.232-.22-3.257-.042-.656.117-1.695.5-1.976 1.42-.125.409-.111.748.039 1.062.105.22.269.359.542.49.29.14.662.255 1.012.34.193.048.399.094.574.13.173.04.336.07.403.08l.011.001c.507.113.867.191 1.081.3.175.084.32.183.398.356.062.145.065.3.022.439-.085.257-.286.375-.571.382a1.38 1.38 0 0 1-.282-.027c-.129-.027-.251-.082-.36-.152a1.686 1.686 0 0 1-.195-.174l-.027-.03c-.056-.061-.128-.139-.318-.214-.473-.187-1.18-.088-1.528.248-.295.283-.503.852-.095 1.353.407.498 1.144.72 1.93.613.384-.053.715-.228.982-.445.044-.036.087-.073.128-.11l.106-.097c.071-.067.137-.13.208-.178a.627.627 0 0 1 .208-.114.425.425 0 0 1 .118-.017c.12 0 .194.056.24.131.052.084.06.186.038.286-.029.135-.088.299-.153.446-.14.32-.367.637-.683.879-.307.237-.78.464-1.5.464h-.002c-.614 0-1.13-.2-1.517-.566-.317-.3-.538-.71-.63-1.21-.053-.289-.05-.574.013-.85.074-.337.235-.648.466-.916-.039-.055-.074-.113-.106-.172-.36-.66-.145-1.37.356-1.982a2.25 2.25 0 0 1-.148-.92c.013-.353.113-.703.29-.996.275-.462.693-.786 1.106-.984a2.968 2.968 0 0 0-.887-.226c-.592-.08-1.233-.054-1.917-.192-.693-.14-1.463-.622-1.555-1.356-.045-.354.054-.703.206-.981.172-.314.495-.586.944-.788.946-.423 2.205-.491 3.455-.414.67.039 1.333.113 1.942.232.608.12 1.174.289 1.516.52a5.1 5.1 0 0 1 1.486-.22c.642-.013 1.268.07 1.845.214.573.144 1.112.35 1.57.615.456.264.818.599 1.071.99.254.392.396.905.396 1.274 0 .362-.087.7-.233.993-.17.337-.348.609-.547.836a4.088 4.088 0 0 1-1.015.789c.136.208.235.44.295.7.06.261.08.549.045.847-.071.583-.331 1.116-.712 1.516-.384.401-.87.675-1.393.833-.262.08-.53.127-.796.152a4.776 4.776 0 0 1-.626.019c-.652-.014-1.307-.154-1.828-.431z" />
                </svg>
              </Button>
            </div>
            
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account?</span>{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up now
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
