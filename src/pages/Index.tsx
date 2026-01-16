import { useRef } from "react";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { BlouseOrderForm } from "@/components/BlouseOrderForm";
import { ImpactSection } from "@/components/ImpactSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  const orderFormRef = useRef<HTMLDivElement>(null);

  const scrollToOrderForm = () => {
    orderFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onDesignClick={scrollToOrderForm} />
      <HowItWorksSection />
      <div ref={orderFormRef}>
        <BlouseOrderForm />
      </div>
      <ImpactSection />
      <Footer />
    </div>
  );
};

export default Index;
