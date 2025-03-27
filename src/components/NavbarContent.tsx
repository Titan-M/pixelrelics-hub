
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Library, Newspaper, LifeBuoy, User, LogOut, LogIn, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function NavbarContent() {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  return (
    <>
      <div className="hidden md:flex items-center space-x-2">
        <Link to="/store" className="px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/10 transition-all">
          Store
        </Link>
        <Link to="/library" className="px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/10 transition-all">
          Library
        </Link>
        <Link to="/news" className="px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/10 transition-all">
          News
        </Link>
        <Link to="/support" className="px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/10 transition-all">
          Support
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {/* Wishlist button */}
        <Button
          variant="ghost"
          size="icon"
          className="relative transition-all hover:scale-105"
          onClick={() => navigate('/wishlist')}
          aria-label="Wishlist"
        >
          <Heart className="h-5 w-5" />
        </Button>
        
        {/* Cart button with counter */}
        <Button
          variant="ghost"
          size="icon"
          className="relative transition-all hover:scale-105"
          onClick={() => navigate('/cart')}
          aria-label="Cart"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs animate-scale-in">
              {cartCount}
            </span>
          )}
        </Button>

        {/* User menu */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full transition-all hover:scale-105" size="icon">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 animate-fade-in">
              <DropdownMenuItem onClick={() => navigate('/profile')} className="transition-all">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/library')} className="transition-all">
                <Library className="mr-2 h-4 w-4" />
                <span>My Library</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/wishlist')} className="transition-all">
                <Heart className="mr-2 h-4 w-4" />
                <span>Wishlist</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="transition-all">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="default" size="sm" onClick={() => navigate('/login')} className="transition-all hover:scale-105">
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      <div className="md:hidden flex fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <Link to="/store" className="flex-1 flex flex-col items-center justify-center py-3 transition-all hover:bg-secondary/50">
          <ShoppingCart className="h-5 w-5 mb-1" />
          <span className="text-xs">Store</span>
        </Link>
        <Link to="/library" className="flex-1 flex flex-col items-center justify-center py-3 transition-all hover:bg-secondary/50">
          <Library className="h-5 w-5 mb-1" />
          <span className="text-xs">Library</span>
        </Link>
        <Link to="/wishlist" className="flex-1 flex flex-col items-center justify-center py-3 transition-all hover:bg-secondary/50">
          <Heart className="h-5 w-5 mb-1" />
          <span className="text-xs">Wishlist</span>
        </Link>
        <Link to="/news" className="flex-1 flex flex-col items-center justify-center py-3 transition-all hover:bg-secondary/50">
          <Newspaper className="h-5 w-5 mb-1" />
          <span className="text-xs">News</span>
        </Link>
      </div>
    </>
  );
}
