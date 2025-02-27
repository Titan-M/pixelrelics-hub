
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, GitHub } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="font-bold text-xl">
              Epic<span className="text-primary">Hub</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              The ultimate destination for gamers to discover, purchase, and play their favorite games.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <GitHub className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/careers" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link>
              </li>
              <li>
                <Link to="/news" className="text-muted-foreground hover:text-primary transition-colors">News</Link>
              </li>
              <li>
                <Link to="/partners" className="text-muted-foreground hover:text-primary transition-colors">Partners</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Help & Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/support" className="text-muted-foreground hover:text-primary transition-colors">Support</Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/legal/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/legal/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Download</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/download/windows" className="text-muted-foreground hover:text-primary transition-colors">Windows</Link>
              </li>
              <li>
                <Link to="/download/mac" className="text-muted-foreground hover:text-primary transition-colors">macOS</Link>
              </li>
              <li>
                <Link to="/download/linux" className="text-muted-foreground hover:text-primary transition-colors">Linux</Link>
              </li>
              <li>
                <Link to="/download/mobile" className="text-muted-foreground hover:text-primary transition-colors">Mobile</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} EpicHub. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/legal/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms
              </Link>
              <Link to="/legal/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link to="/legal/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                Cookies
              </Link>
              <Link to="/legal/licenses" className="text-muted-foreground hover:text-primary transition-colors">
                Licenses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
