
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X, ShoppingCart, Heart, User } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Store", path: "/store" },
    { name: "Library", path: "/library" },
    { name: "News", path: "/news" },
    { name: "Support", path: "/support" },
  ];

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen 
          ? "bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800" 
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex-shrink-0 font-bold text-xl tracking-tight hover:text-primary transition-colors"
            >
              Epic<span className="text-primary">Hub</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`text-sm transition-all duration-200 hover:text-primary ${
                      location.pathname === item.path 
                        ? "text-primary font-medium" 
                        : "text-foreground/80"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative hover:bg-primary/10">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                0
              </span>
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="default" asChild className="bg-primary hover:bg-primary/90">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
          <div className="md:hidden flex items-center">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="ml-1"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? "max-h-screen opacity-100 py-4" 
            : "max-h-0 opacity-0 py-0 overflow-hidden"
        }`}
      >
        <div className="px-6 space-y-4 pb-5">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`block text-base transition-all duration-200 hover:text-primary ${
                location.pathname === item.path 
                  ? "text-primary font-medium" 
                  : "text-foreground/80"
              }`}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-2 flex justify-between items-center">
            <Button asChild variant="default" className="w-full bg-primary hover:bg-primary/90">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
          <div className="flex justify-around pt-3">
            <Button variant="ghost" size="icon" className="relative hover:bg-primary/10">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                0
              </span>
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
