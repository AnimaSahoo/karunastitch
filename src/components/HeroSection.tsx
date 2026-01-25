import { Button } from "@/components/ui/button";
import { Heart, Sparkles } from "lucide-react";
import logo from "@/assets/blouse-beyond-logo.png";

interface HeroSectionProps {
  onDesignClick: () => void;
}

export const HeroSection = ({ onDesignClick }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[90vh] flex flex-col bg-gradient-to-br from-cream via-warm-white to-secondary overflow-hidden">
      {/* Header/Navigation */}
      <header className="w-full py-4 px-6 flex items-center justify-between relative z-20">
         <div className="flex items-center gap-3">
           <div className="bg-warm-white px-3 py-1 rounded-lg">
             <img src={logo} alt="Karuna Stitch" className="h-12 w-auto" />
           </div>
          <span className="text-xl font-semibold text-foreground hidden sm:inline">
            <span className="text-primary">Karuna</span>
            <span className="text-accent"> </span>
            <span>Stitch</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
          <a href="#design" className="hover:text-primary transition-colors">Design</a>
          <a href="#impact" className="hover:text-primary transition-colors">Our Impact</a>
        </nav>
      </header>

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
          <div className="flex justify-center mb-6 bg-warm-white px-4 py-2 rounded-2xl">
            <img src={logo} alt="Karuna Stitch" className="h-24 md:h-32 w-auto" />
          </div>
          
          {/* Brand Name */}
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            <span className="text-primary">Karuna</span>
            <span className="text-accent"> </span>
            <span className="text-foreground">Stitch</span>
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
