import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shirt, Check } from "lucide-react";

interface Design {
  id: string;
  name: string;
  image: string;
  style: string;
  difficulty: "Simple" | "Medium" | "Complex";
  description: string;
}

interface DesignGalleryProps {
  onSelectDesign: (design: Design) => void;
  selectedDesign: Design | null;
}

export const DesignGallery = ({ onSelectDesign, selectedDesign }: DesignGalleryProps) => {
  const designs: Design[] = [
    {
      id: "1",
      name: "Classic Paisley",
      image: "/placeholder.svg",
      style: "Traditional",
      difficulty: "Medium",
      description: "Timeless paisley motifs with golden thread work"
    },
    {
      id: "2", 
      name: "Floral Elegance",
      image: "/placeholder.svg",
      style: "Contemporary",
      difficulty: "Complex",
      description: "Delicate flower patterns with pearl embellishments"
    },
    {
      id: "3",
      name: "Geometric Modern",
      image: "/placeholder.svg", 
      style: "Modern",
      difficulty: "Simple",
      description: "Clean geometric patterns with minimal embroidery"
    },
    {
      id: "4",
      name: "Royal Zardozi",
      image: "/placeholder.svg",
      style: "Traditional",
      difficulty: "Complex", 
      description: "Luxurious gold and silver zardozi work"
    },
    {
      id: "5",
      name: "Mirror Work",
      image: "/placeholder.svg",
      style: "Rajasthani",
      difficulty: "Medium",
      description: "Traditional mirror work with colorful threads"
    },
    {
      id: "6",
      name: "Simple Elegance",
      image: "/placeholder.svg",
      style: "Minimalist", 
      difficulty: "Simple",
      description: "Clean lines with subtle embellishments"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Simple": return "bg-emerald text-white";
      case "Medium": return "bg-gold text-foreground";
      case "Complex": return "bg-royal-red text-white";
      default: return "bg-muted text-foreground";
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-elegant">
      <CardHeader className="bg-gradient-gold text-foreground">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Shirt className="h-6 w-6" />
          Blouse Design
        </CardTitle>
        <p className="text-base opacity-90">
          Select from our collection of beautiful blouse designs or continue to create your custom design
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <Card 
              key={design.id} 
              className={`cursor-pointer transition-all duration-300 hover:shadow-gold ${
                selectedDesign?.id === design.id 
                  ? "ring-2 ring-royal-red shadow-elegant" 
                  : "hover:shadow-lg"
              }`}
              onClick={() => onSelectDesign(design)}
            >
              <div className="relative">
                <img 
                  src={design.image} 
                  alt={design.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {selectedDesign?.id === design.id && (
                  <div className="absolute top-2 right-2 bg-royal-red text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <Badge 
                  className={`absolute top-2 left-2 ${getDifficultyColor(design.difficulty)}`}
                >
                  {design.difficulty}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg text-royal-red mb-1">
                  {design.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {design.style}
                </p>
                <p className="text-sm">
                  {design.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {selectedDesign && (
          <div className="mt-8 p-4 bg-cream rounded-lg border border-gold">
            <h3 className="font-semibold text-lg text-royal-red mb-2">Selected Design</h3>
            <div className="flex items-center gap-4">
              <span className="font-medium">{selectedDesign.name}</span>
              <Badge className={getDifficultyColor(selectedDesign.difficulty)}>
                {selectedDesign.difficulty}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {selectedDesign.style}
              </span>
            </div>
            <p className="text-sm mt-2">{selectedDesign.description}</p>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-muted-foreground mb-4">
            Can't find what you're looking for?
          </p>
          <Button variant="royal" size="lg">
            Create Custom Design
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};