import { Mail, Phone, Instagram, Heart, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-primary-foreground">Karuna</span>
              <span className="text-accent"> </span>
              <span>Stitch</span>
            </h3>
            <p className="text-muted opacity-80 text-sm leading-relaxed">
              Custom saree blouses stitched with dignity & care. 
              Empowering differently-abled women artisans in Odisha, India.
            </p>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <a 
                href="mailto:hello@karunastitch.com" 
                className="flex items-center gap-2 hover:text-accent transition-colors"
              >
                <Mail className="h-4 w-4" />
                hello@karunastitch.com
              </a>
              <a 
                href="tel:+15103810843" 
                className="flex items-center gap-2 hover:text-accent transition-colors"
              >
                <Phone className="h-4 w-4" />
                +1 (510) 381-0843
              </a>
              <a 
                href="https://instagram.com/karunastitch" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-accent transition-colors"
              >
                <Instagram className="h-4 w-4" />
                @karunastitch
              </a>
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Policies</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block hover:text-accent transition-colors">
                Shipping Policy
              </a>
              <a href="#" className="block hover:text-accent transition-colors">
                Custom Orders
              </a>
              <a href="#" className="block hover:text-accent transition-colors">
                Returns & Exchanges
              </a>
              <a href="#" className="block hover:text-accent transition-colors">
                Privacy Policy
              </a>
              <Link 
                to="/admin" 
                className="flex items-center gap-2 hover:text-accent transition-colors mt-4 pt-2 border-t border-muted/20"
              >
                <ClipboardList className="h-4 w-4" />
                Order Management
              </Link>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-muted/20 pt-8 text-center text-sm text-muted">
          <p className="flex items-center justify-center gap-1">
            Made with <Heart className="h-4 w-4 text-primary" /> in India & USA
          </p>
          <p className="mt-2 opacity-60">
            © {new Date().getFullYear()} Karuna Stitch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
