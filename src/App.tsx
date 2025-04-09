
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Store from '@/pages/Store';
import Library from '@/pages/Library';
import News from '@/pages/News';
import Support from '@/pages/Support';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout'; 
import Profile from '@/pages/Profile';
import GameDetails from '@/pages/GameDetails';
import NotFound from '@/pages/NotFound';
import Wishlist from './pages/Wishlist';

// Components and Providers
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Routes>
              <Route path="/" element={<div className="page-content"><Index /></div>} />
              <Route path="/login" element={<div className="page-content"><Login /></div>} />
              <Route path="/signup" element={<div className="page-content"><Signup /></div>} />
              <Route path="/store" element={<div className="page-content"><Store /></div>} />
              <Route path="/game/:id" element={<div className="page-content"><GameDetails /></div>} />
              <Route path="/news" element={<div className="page-content"><News /></div>} />
              <Route path="/support" element={<div className="page-content"><Support /></div>} />
              
              {/* Protected Routes */}
              <Route path="/library" element={
                <ProtectedRoute>
                  <div className="page-content"><Library /></div>
                </ProtectedRoute>
              } />
              <Route path="/cart" element={
                <ProtectedRoute>
                  <div className="page-content"><Cart /></div>
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <div className="page-content"><Checkout /></div>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <div className="page-content"><Profile /></div>
                </ProtectedRoute>
              } />
              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <div className="page-content"><Wishlist /></div>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<div className="page-content"><NotFound /></div>} />
            </Routes>
            <Toaster />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
