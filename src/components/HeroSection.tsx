import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, ClipboardList, Menu, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/blouse-beyond-logo.png";

interface HeroSectionProps {
  onDesignClick: () => void;
}

const navLinks = [
  { href: "#", label: "Home" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#order-form", label: "Place your order" },
  { href: "#design", label: "Design your blouse" },
  { href: "#impact", label: "Our Impact" },
];

export const HeroSection = ({ onDesignClick }: HeroSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex flex-col bg-gradient-to-br from-cream via-warm-white to-secondary overflow-hidden">
      {/* Header/Navigation */}
      <header 
        className={`fixed top-0 left-0 right-0 w-full py-4 px-6 flex items-center justify-between z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-background/95 backdrop-blur-md shadow-md py-3" 
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-3">
          <img src={logo} alt="Karuna Stitch" className="h-12 w-auto" />
          <span className="text-xl text-foreground hidden sm:inline" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-primary font-semibold">Karuna</span>
            <span className="text-accent"> </span>
            <span className="font-medium">Stitch</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 md:gap-6 text-sm font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <a 
              key={link.href} 
              href={link.href} 
              className="hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link 
            to="/admin" 
            className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
          >
            <ClipboardList className="h-4 w-4" />
            <span>Review orders</span>
          </Link>
          {isAdmin && (
            <Link 
              to="/admin/feedback" 
              className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>View Feedback</span>
            </Link>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <Link 
            to="/admin" 
            className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
          >
            <ClipboardList className="h-5 w-5" />
          </Link>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2 border-b border-border"
                  >
                    {link.label}
                  </a>
                ))}
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-lg font-medium text-primary hover:text-primary/80 transition-colors py-2"
                >
                  <ClipboardList className="h-5 w-5" />
                  Review orders
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/feedback"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-lg font-medium text-primary hover:text-primary/80 transition-colors py-2"
                  >
                    <MessageSquare className="h-5 w-5" />
                    View Feedback
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-16 relative z-10 flex-1 flex items-center">
        <div className="max-w-4xl mx-auto text-center">
          {/* Brand Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            Empowering Women Artisans in Odisha
          </div>

          {/* Logo in Hero */}
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Karuna Stitch" className="h-24 md:h-32 w-auto" />
          </div>
          
          {/* Brand Name */}
          <h1 className="text-5xl md:text-7xl mb-4 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-primary font-bold">Karuna</span>
            <span className="text-accent"> </span>
            <span className="text-foreground font-semibold">Stitch</span>
          </h1>
          
          {/* Tagline */}
          <p className="text-2xl md:text-3xl font-light text-muted-foreground mb-6">
            Custom saree blouses stitched with dignity & care
          </p>
          
          {/* Intro Text */}
          <div className="max-w-2xl mx-auto space-y-4 mb-10">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Beautiful custom blouses handcrafted by skilled artisans in Odisha, India. 
              Every stitch supports differently-abled women in building sustainable livelihoods.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-primary" />
                Social Impact
              </span>
              <span>•</span>
              <span>Premium Quality</span>
              <span>•</span>
              <span>Ships to USA</span>
            </div>
          </div>
          
          {/* CTA Button */}
          <Button 
            onClick={onDesignClick}
            size="lg"
            className="text-lg px-10 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-elegant transition-all hover:scale-105"
          >
            Design Your Blouse
            <Sparkles className="ml-2 h-5 w-5" />
          </Button>
          
          {/* Price Highlight */}
          <p className="mt-6 text-muted-foreground">
            Starting at <span className="font-semibold text-foreground">$20</span> per blouse
          </p>
        </div>
      </div>
    </section>
  );
};
