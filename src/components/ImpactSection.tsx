import { Heart, Users, MapPin, Award } from "lucide-react";

const stats = [
  { icon: Users, value: "5+", label: "Artisans Employed" },
  { icon: Heart, value: "100%", label: "Women-Led" },
  { icon: MapPin, value: "Odisha", label: "Made in India" },
  { icon: Award, value: "5★", label: "Quality Rated" },
];

export const ImpactSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5" id="impact">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Making a Difference, One Stitch at a Time
            </h2>
            <p className="text-lg text-muted-foreground">
              Every blouse you order supports women artisans in Odisha
            </p>
          </div>
          
          {/* Story Section */}
          <div className="bg-card rounded-2xl p-8 md:p-12 shadow-elegant border border-border mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-primary mb-4">
                  Our Story
                </h3>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Karuna Stitch partners with skilled differently-abled women artisans 
                    in Odisha, India, providing them with dignified work and sustainable income.
                  </p>
                  <p>
                    Each blouse is crafted with care and precision, combining traditional 
                    Indian tailoring expertise with your unique design preferences.
                  </p>
                  <p>
                    When you choose us, you're not just getting a beautiful blouse – 
                    you're empowering women and supporting ethical fashion.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square bg-gradient-elegant rounded-2xl flex items-center justify-center">
                  <Heart className="h-24 w-24 text-primary-foreground opacity-50" />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-card rounded-xl p-4 shadow-gold border border-border">
                  <p className="text-sm font-medium text-foreground">
                    "Dignity through craft"
                  </p>
                  <p className="text-xs text-muted-foreground">
                    — Our Mission
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div 
                key={stat.label}
                className="bg-card rounded-xl p-6 text-center shadow-gold hover:shadow-elegant transition-shadow border border-border"
              >
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
