import { useState } from "react";
import { OrderForm } from "@/components/OrderForm";
import { DesignGallery } from "@/components/DesignGallery";
import { CustomDesignCanvas } from "@/components/CustomDesignCanvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, Star, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-blouse.jpg";
import { toast } from "sonner";

type Step = "hero" | "order" | "design" | "custom" | "confirmation";

interface OrderData {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  specialRequests: string;
}

interface Design {
  id: string;
  name: string;
  image: string;
  style: string;
  difficulty: "Simple" | "Medium" | "Complex";
  description: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>("hero");
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [customDesign, setCustomDesign] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);

  const handleOrderSubmit = (data: OrderData, files: FileList | null) => {
    setOrderData(data);
    setUploadedFiles(files);
    setCurrentStep("design");
  };

  const handleDesignSelect = (design: Design) => {
    setSelectedDesign(design);
  };

  const handleCustomDesignSave = (designData: string) => {
    setCustomDesign(designData);
    setCurrentStep("confirmation");
  };

  const handleConfirmOrder = () => {
    toast.success("Order confirmed! We'll contact you soon with measurements and timeline.");
    // Reset form
    setCurrentStep("hero");
    setOrderData(null);
    setSelectedDesign(null);
    setCustomDesign(null);
    setUploadedFiles(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case "hero":
        return (
          <div className="min-h-screen bg-gradient-to-br from-cream via-warm-white to-gold-light">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-elegant opacity-10"></div>
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 bg-royal-red text-white px-4 py-2 rounded-full text-sm font-medium">
                      <Sparkles className="h-4 w-4" />
                      Custom Tailoring Excellence
                    </div>
                    
                    <h1 className="text-5xl lg:text-6xl font-bold text-royal-red leading-tight">
                      Exquisite Indian
                      <span className="bg-gradient-elegant bg-clip-text text-transparent"> Blouse </span>
                      Designs
                    </h1>
                    
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      Create your perfect saree blouse with our master craftsmen. Upload your materials, 
                      choose from stunning designs, or sketch your custom vision.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        variant="elegant" 
                        size="lg" 
                        className="text-lg px-8 py-4"
                        onClick={() => setCurrentStep("order")}
                      >
                        Start Your Order
                        <Heart className="ml-2 h-5 w-5" />
                      </Button>
                      <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                        View Portfolio
                        <Star className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 pt-8">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-royal-red">500+</div>
                        <div className="text-sm text-muted-foreground">Happy Customers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-royal-red">50+</div>
                        <div className="text-sm text-muted-foreground">Design Patterns</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-royal-red">25+</div>
                        <div className="text-sm text-muted-foreground">Years Experience</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-royal rounded-2xl transform rotate-3 opacity-20"></div>
                    <img 
                      src={heroImage} 
                      alt="Beautiful Indian blouse with intricate embroidery"
                      className="relative rounded-2xl shadow-elegant w-full h-[600px] object-cover"
                    />
                    <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-gold">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-royal rounded-full flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-royal-red">Premium Quality</div>
                          <div className="text-sm text-muted-foreground">Handcrafted with love</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-royal-red mb-4">Why Choose Our Service?</h2>
                <p className="text-xl text-muted-foreground">Experience the perfect blend of tradition and innovation</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="text-center p-8 shadow-gold hover:shadow-elegant transition-all duration-300">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-royal rounded-full mx-auto flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-royal-red">Custom Designs</h3>
                    <p className="text-muted-foreground">Choose from our collection or create your unique design</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center p-8 shadow-gold hover:shadow-elegant transition-all duration-300">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-gold rounded-full mx-auto flex items-center justify-center">
                      <Heart className="h-8 w-8 text-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-royal-red">Expert Craftsmanship</h3>
                    <p className="text-muted-foreground">25+ years of traditional tailoring expertise</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center p-8 shadow-gold hover:shadow-elegant transition-all duration-300">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-elegant rounded-full mx-auto flex items-center justify-center">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-royal-red">Premium Materials</h3>
                    <p className="text-muted-foreground">Work with your finest fabrics with utmost care</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case "order":
        return (
          <div className="min-h-screen bg-gradient-to-br from-cream to-warm-white py-12">
            <div className="max-w-4xl mx-auto px-4">
              <div className="text-center mb-8">
                <Badge className="bg-royal-red text-white mb-4">Step 1 of 3</Badge>
                <h1 className="text-4xl font-bold text-royal-red mb-4">Order Information</h1>
                <p className="text-lg text-muted-foreground">Please provide your details and upload material photos</p>
              </div>
              <OrderForm onSubmit={handleOrderSubmit} />
            </div>
          </div>
        );

      case "design":
        return (
          <div className="min-h-screen bg-gradient-to-br from-cream to-warm-white py-12">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-8">
                <Badge className="bg-royal-red text-white mb-4">Step 2 of 3</Badge>
                <h1 className="text-4xl font-bold text-royal-red mb-4">Design Selection</h1>
                <p className="text-lg text-muted-foreground">Choose a design or create your custom pattern</p>
              </div>
              <DesignGallery 
                onSelectDesign={handleDesignSelect}
                selectedDesign={selectedDesign}
              />
              {selectedDesign && (
                <div className="text-center mt-8">
                  <Button 
                    variant="elegant" 
                    size="lg"
                    onClick={() => setCurrentStep("confirmation")}
                  >
                    Confirm Design Selection
                  </Button>
                </div>
              )}
              <div className="text-center mt-6">
                <Button 
                  variant="royal"
                  onClick={() => setCurrentStep("custom")}
                >
                  Create Custom Design Instead
                </Button>
              </div>
            </div>
          </div>
        );

      case "custom":
        return (
          <div className="min-h-screen bg-gradient-to-br from-cream to-warm-white py-12">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-8">
                <Badge className="bg-royal-red text-white mb-4">Step 2 of 3 - Custom Design</Badge>
                <h1 className="text-4xl font-bold text-royal-red mb-4">Custom Design Canvas</h1>
                <p className="text-lg text-muted-foreground">Sketch your unique blouse design</p>
              </div>
              <CustomDesignCanvas onSaveDesign={handleCustomDesignSave} />
              <div className="text-center mt-6">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentStep("design")}
                >
                  Back to Design Gallery
                </Button>
              </div>
            </div>
          </div>
        );

      case "confirmation":
        return (
          <div className="min-h-screen bg-gradient-to-br from-cream to-warm-white py-12">
            <div className="max-w-4xl mx-auto px-4">
              <div className="text-center mb-8">
                <Badge className="bg-emerald text-white mb-4">Step 3 of 3</Badge>
                <h1 className="text-4xl font-bold text-royal-red mb-4">Order Confirmation</h1>
                <p className="text-lg text-muted-foreground">Review your order details</p>
              </div>
              
              <Card className="shadow-elegant">
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold text-royal-red mb-4">Customer Details</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {orderData?.customerName}</p>
                        <p><strong>Phone:</strong> {orderData?.phone}</p>
                        <p><strong>Email:</strong> {orderData?.email}</p>
                        <p><strong>Address:</strong> {orderData?.address}, {orderData?.city} - {orderData?.pincode}</p>
                        {orderData?.specialRequests && (
                          <p><strong>Special Requests:</strong> {orderData.specialRequests}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-royal-red mb-4">Design Details</h3>
                      {selectedDesign ? (
                        <div className="space-y-2 text-sm">
                          <p><strong>Design:</strong> {selectedDesign.name}</p>
                          <p><strong>Style:</strong> {selectedDesign.style}</p>
                          <p><strong>Complexity:</strong> {selectedDesign.difficulty}</p>
                        </div>
                      ) : customDesign ? (
                        <div className="space-y-2 text-sm">
                          <p><strong>Design:</strong> Custom Design</p>
                          <p><strong>Type:</strong> Hand-sketched pattern</p>
                        </div>
                      ) : null}
                      
                      {uploadedFiles && (
                        <div className="mt-4">
                          <p className="text-sm"><strong>Material Photos:</strong> {uploadedFiles.length} file(s) uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t pt-6 text-center">
                    <p className="text-muted-foreground mb-6">
                      Our team will contact you within 24 hours to discuss measurements, timeline, and pricing.
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button 
                        variant="elegant" 
                        size="lg"
                        onClick={handleConfirmOrder}
                      >
                        Confirm Order
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setCurrentStep("design")}
                      >
                        Back to Design
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderStep();
};

export default Index;
