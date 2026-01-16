import { Upload, Palette, Ruler, Package } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Fabric Photos",
    description: "Share clear photos of your blouse fabric material",
    step: 1,
  },
  {
    icon: Palette,
    title: "Choose or Design",
    description: "Pick from sample designs or create your own style",
    step: 2,
  },
  {
    icon: Ruler,
    title: "Submit Measurements",
    description: "Provide your measurements and shipping address",
    step: 3,
  },
  {
    icon: Package,
    title: "Receive at Home",
    description: "Your custom blouse delivered to your doorstep",
    step: 4,
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-card" id="how-it-works">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting your perfect custom blouse is simple
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              {/* Connector Line - Hidden on mobile */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-accent/50" />
              )}
              
              <div className="relative bg-background rounded-2xl p-6 text-center shadow-gold hover:shadow-elegant transition-all duration-300 border border-border">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-4 mt-2 bg-gradient-elegant rounded-full flex items-center justify-center">
                  <step.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
