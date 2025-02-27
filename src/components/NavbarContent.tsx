
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Library, Newspaper, LifeBuoy, User, LogOut, LogIn } from 'lucide-react';
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
      <div className="hidden md:flex items-center space-x-1">
        <Link to="/store" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10 transition-colors">
          Store
        </Link>
        <Link to="/library" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10 transition-colors">
          Library
        </Link>
        <Link to="/news" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10 transition-colors">
          News
        </Link>
        <Link to="/support" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10 transition-colors">
          Support
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {/* Cart button with counter */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => navigate('/cart')}
        >
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs">
              {cartCount}
            </span>
          )}
        </Button>

        {/* User menu */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full" size="icon">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/library')}>
                <Library className="mr-2 h-4 w-4" />
                <span>My Library</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="default" size="sm" onClick={() => navigate('/login')}>
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      <div className="md:hidden flex fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <Link to="/store" className="flex-1 flex flex-col items-center justify-center py-2">
          <ShoppingCart className="h-5 w-5" />
          <span className="text-xs mt-1">Store</span>
        </Link>
        <Link to="/library" className="flex-1 flex flex-col items-center justify-center py-2">
          <Library className="h-5 w-5" />
          <span className="text-xs mt-1">Library</span>
        </Link>
        <Link to="/news" className="flex-1 flex flex-col items-center justify-center py-2">
          <Newspaper className="h-5 w-5" />
          <span className="text-xs mt-1">News</span>
        </Link>
        <Link to="/support" className="flex-1 flex flex-col items-center justify-center py-2">
          <LifeBuoy className="h-5 w-5" />
          <span className="text-xs mt-1">Support</span>
        </Link>
      </div>
    </>
  );
}
