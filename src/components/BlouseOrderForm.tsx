import { useState, useRef, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SketchCanvas } from "@/components/SketchCanvas";
import { 
  User, 
  MapPin, 
  Ruler, 
  Palette, 
  Image as ImageIcon,
  CheckCircle,
  X,
  CalendarIcon,
  Upload,
  Loader2,
  CreditCard
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  validateOrderForm, 
  checkRateLimit, 
  recordSubmission, 
  checkHoneypot,
  sanitizeInput 
} from "@/lib/orderValidation";
import { logger } from "@/lib/logger";

// Import sample blouse images
import blouseBoatNeck from "@/assets/blouse-boat-neck.jpg";
import blouseCollar from "@/assets/blouse-collar.jpg";
import blousePataDesign from "@/assets/blouse-pata-design.png";
import blouseWindowDesign from "@/assets/blouse-window-design.png";
import measurementGuide from "@/assets/measurement-guide-new.png";

interface BlouseOrderFormProps {
  onSubmit?: () => void;
}

interface FormData {
  // Customer Info
  fullName: string;
  email: string;
  phone: string;
  // Address
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  // Measurements (matching guide image 1-13)
  shoulder: string;              // 1
  shoulderFullLength: string;    // 2
  frontNeckDepth: string;        // 3
  chest: string;                 // 4
  waist: string;                 // 5
  backNeckDepth: string;         // 6
  blouseLength: string;          // 7
  sleeveLength: string;          // 8
  sleeveRound: string;           // 9
  armHole: string;               // 10
  // Options
  blouseType: "princess-cut" | "standard";
  hookPosition: "front-hook" | "back-hook";
  deliveryDate: Date | null;
  extraClothsLaces: "yes" | "no";
  wantMeasurementHelp: boolean;
  isCustomItem: boolean;
  specialRequests: string;
}

const sampleDesigns = [
  { id: "collar", name: "Collar Neck", image: blouseCollar, desc: "Shirt-style" },
  { id: "boat", name: "Boat Neck", image: blouseBoatNeck, desc: "Wide horizontal" },
  { id: "window", name: "Window Design", image: blouseWindowDesign, desc: "Elegant cutout" },
  { id: "pata", name: "PataSaree Blouse Design", image: blousePataDesign, desc: "Traditional Odia" },
];

export const BlouseOrderForm = ({ onSubmit }: BlouseOrderFormProps) => {
  const navigate = useNavigate();
  const { user, isFullyAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const formStartTime = useRef(Date.now());
  
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "USA",
    shoulder: "",
    shoulderFullLength: "",
    frontNeckDepth: "",
    chest: "",
    waist: "",
    backNeckDepth: "",
    blouseLength: "",
    sleeveLength: "",
    sleeveRound: "",
    armHole: "",
    blouseType: "standard",
    hookPosition: "back-hook",
    deliveryDate: null,
    extraClothsLaces: "no",
    wantMeasurementHelp: false,
    isCustomItem: true,
    specialRequests: "",
  });

  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [sketchData, setSketchData] = useState<string>("");
  const [designDescription, setDesignDescription] = useState("");
  const [activeDesignTab, setActiveDesignTab] = useState("sample");

  // Auth gate: show login prompt if not authenticated
  if (!user || !isFullyAuthenticated) {
    return (
      <section className="py-16 bg-background" id="order-form">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center">
            <Card className="shadow-gold border-border">
              <CardContent className="p-10 space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-2">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Sign In to Place Your Order
                </h2>
                <p className="text-muted-foreground">
                  Create an account or sign in to enter your measurements and design your custom blouse.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/login?redirect=/#order-form">
                    <Button size="lg" className="w-full sm:w-auto px-8">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/login?redirect=/#order-form&mode=signup">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceImage(file);
      toast.success("Reference image uploaded");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    // Anti-bot check 1: Honeypot field should be empty
    if (!checkHoneypot(honeypot)) {
      // Silently fail for bots - intentional security logging kept
      logger.warn("BlouseOrderForm", "Honeypot triggered - potential bot submission");
      toast.success("Order placed successfully!");
      return;
    }
    
    // Anti-bot check 2: Form filled too quickly (less than 5 seconds)
    const timeSpent = Date.now() - formStartTime.current;
    if (timeSpent < 5000) {
      // Intentional security logging kept
      logger.warn("BlouseOrderForm", "Form submitted too quickly - potential bot");
      toast.error("Please take your time to fill out the form carefully.");
      return;
    }
    
    // Rate limiting check
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      toast.error(rateCheck.message || "Please wait before submitting again.");
      return;
    }
    
    // Sanitize text inputs
    const sanitizedFormData = {
      ...formData,
      fullName: sanitizeInput(formData.fullName),
      email: sanitizeInput(formData.email),
      phone: sanitizeInput(formData.phone),
      street: sanitizeInput(formData.street),
      city: sanitizeInput(formData.city),
      state: sanitizeInput(formData.state),
      zip: sanitizeInput(formData.zip),
      country: sanitizeInput(formData.country),
      specialRequests: sanitizeInput(formData.specialRequests),
    };
    
    // Validate form with Zod
    const validation = validateOrderForm({
      ...sanitizedFormData,
      designDescription: sanitizeInput(designDescription),
    });
    
    if (!validation.success) {
      setFormErrors(validation.errors || {});
      const firstError = Object.values(validation.errors || {})[0];
      toast.error(firstError || "Please fix the errors in the form");
      return;
    }

    if (!selectedDesign && !referenceImage && !sketchData) {
      toast.error("Please select or create a design");
      return;
    }

    setIsSubmitting(true);

    // Create order object for database
    const orderData = {
      orderDate: new Date().toISOString(),
      ...sanitizedFormData,
      deliveryDate: formData.deliveryDate ? format(formData.deliveryDate, "PPP") : "",
      selectedDesign: selectedDesign || (referenceImage ? "Reference Image" : "Custom Sketch"),
      designDescription: sanitizeInput(designDescription),
    };

    try {
      // Save to database
      const { saveOrder, setCurrentOrder } = await import("@/lib/orderUtils");
      const { supabase } = await import("@/integrations/supabase/client");
      const savedOrder = await saveOrder(orderData);
      
      if (savedOrder) {
        // Record this submission for rate limiting
        recordSubmission();
        
        // Save current order to sessionStorage for checkout page
        setCurrentOrder(savedOrder);
        
        // Send order confirmation email to customer and admin notification
        if (savedOrder.email) {
          try {
            // Send customer confirmation email
            const { error: customerEmailError } = await supabase.functions.invoke("send-order-confirmation", {
              body: {
                orderId: savedOrder.id,
              },
            });
            
            if (customerEmailError) {
              logger.error("BlouseOrderForm.sendCustomerEmail", customerEmailError);
            }

            // Send admin notification email
            const { error: adminEmailError } = await supabase.functions.invoke("send-admin-notification", {
              body: {
                orderId: savedOrder.id,
              },
            });
            
            if (adminEmailError) {
              logger.error("BlouseOrderForm.sendAdminEmail", adminEmailError);
            }
          } catch (emailError) {
            logger.error("BlouseOrderForm.emailSending", emailError);
            // Don't block the order flow if email fails
          }
        }
        
        toast.success("Order placed successfully!");
        onSubmit?.();
        
        // Navigate to checkout page
        navigate("/checkout");
      } else {
        toast.error("Failed to save order. Please try again.");
      }
    } catch (error) {
      logger.error("BlouseOrderForm.submit", error);
      toast.error("Failed to save order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-background" id="order-form">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Start Your Order
          </h2>
          <p className="text-2xl font-light text-primary mb-4">
            Create Your Masterpiece
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fill in your details and choose your design
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {/* Customer Information */}
          <Card className="shadow-gold border-border">
            <CardHeader className="bg-gradient-elegant text-primary-foreground rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Honeypot field - hidden from real users, bots will fill this */}
                <div className="absolute opacity-0 pointer-events-none -z-10" aria-hidden="true">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    type="text"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className={cn("mt-1", formErrors.fullName && "border-destructive")}
                  />
                  {formErrors.fullName && (
                    <p className="text-sm text-destructive mt-1">{formErrors.fullName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    required
                    className={cn("mt-1", formErrors.phone && "border-destructive")}
                  />
                  {formErrors.phone && (
                    <p className="text-sm text-destructive mt-1">{formErrors.phone}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your@email.com"
                  className={cn("mt-1", formErrors.email && "border-destructive")}
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive mt-1">{formErrors.email}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="shadow-gold border-border">
            <CardHeader className="bg-gradient-gold">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="street">Street Address *</Label>
                <Textarea
                  id="street"
                  value={formData.street}
                  onChange={(e) => handleInputChange("street", e.target.value)}
                  placeholder="House/Apt number, Street name"
                  required
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="City"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="State"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code *</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => handleInputChange("zip", e.target.value)}
                    placeholder="00000"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Design Options */}
          <Card id="design" className="shadow-gold border-border scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Palette className="h-5 w-5" />
                Blouse Design
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={activeDesignTab} onValueChange={setActiveDesignTab}>
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-0 h-auto sm:h-10 mb-6">
                  <TabsTrigger value="sample" className="py-2 sm:py-1">Sample Designs</TabsTrigger>
                  <TabsTrigger value="sketch" className="py-2 sm:py-1">Sketch Design</TabsTrigger>
                  <TabsTrigger value="reference" className="py-2 sm:py-1">Upload Reference</TabsTrigger>
                </TabsList>

                <TabsContent value="sample">
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose from our popular blouse styles
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {sampleDesigns.map((design) => (
                      <button
                        key={design.id}
                        type="button"
                        onClick={() => setSelectedDesign(design.id)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          selectedDesign === design.id
                            ? "border-primary bg-primary/5 shadow-elegant"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="aspect-[3/4] mb-2 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                          {design.image ? (
                            <img 
                              src={design.image} 
                              alt={design.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="text-muted-foreground text-center p-4">
                              <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <span className="text-xs">Image coming soon</span>
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-sm block">{design.name}</span>
                        <span className="text-xs text-muted-foreground">{design.desc}</span>
                        {selectedDesign === design.id && (
                          <CheckCircle className="h-4 w-4 text-primary mx-auto mt-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="sketch">
                  <p className="text-sm text-muted-foreground mb-4">
                    Draw your custom blouse design on the canvas below
                  </p>
                  <div className="space-y-4">
                    <SketchCanvas 
                      customerName={formData.fullName}
                      onSave={(dataUrl, designName) => {
                        setSketchData(dataUrl);
                        if (designName) {
                          logger.info('BlouseOrderForm', `Design saved: ${designName}`);
                        }
                      }} 
                    />
                    <div>
                      <Label htmlFor="designDesc">Additional Notes (Optional)</Label>
                      <Textarea
                        id="designDesc"
                        value={designDescription}
                        onChange={(e) => setDesignDescription(e.target.value)}
                        placeholder="Add any details about neckline, sleeves, back design, embroidery patterns..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reference">
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload an inspiration image (Pinterest, Instagram or your own sketch)
                  </p>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReferenceUpload}
                      className="hidden"
                      id="reference-upload"
                    />
                    <label htmlFor="reference-upload" className="cursor-pointer">
                      <ImageIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="font-medium">Upload reference image</p>
                      <p className="text-sm text-muted-foreground">
                        Show us what style you're looking for
                      </p>
                    </label>
                  </div>
                  {referenceImage && (
                    <div className="mt-4">
                      <img
                        src={URL.createObjectURL(referenceImage)}
                        alt="Reference"
                        className="w-32 h-32 object-cover rounded-lg border border-border"
                      />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Measurements */}
          <Card className="shadow-gold border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Ruler className="h-5 w-5" />
                Measurements (in inches)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Blouse Options */}
              <div className="border-b pb-6">
                <h4 className="font-semibold text-foreground mb-4">Blouse Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Blouse Type */}
                  <div>
                    <Label className="mb-3 block">Blouse Type</Label>
                    <RadioGroup
                      value={formData.blouseType}
                      onValueChange={(value) => handleInputChange("blouseType", value)}
                      className="flex flex-col gap-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="princess-cut" id="princess-cut" />
                        <Label htmlFor="princess-cut" className="cursor-pointer">Princess Cut</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard" className="cursor-pointer">Standard</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Hook Position */}
                  <div>
                    <Label className="mb-3 block">Hook Position</Label>
                    <RadioGroup
                      value={formData.hookPosition}
                      onValueChange={(value) => handleInputChange("hookPosition", value)}
                      className="flex flex-col gap-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="front-hook" id="front-hook" />
                        <Label htmlFor="front-hook" className="cursor-pointer">Front Hook</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="back-hook" id="back-hook" />
                        <Label htmlFor="back-hook" className="cursor-pointer">Back Hook</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Delivery Date */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <Label>Delivery Date</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground text-[10px] font-bold cursor-help">?</span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[220px] text-center">
                          Select a date if you have a hard deadline for delivery (e.g. wedding, event).
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.deliveryDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.deliveryDate ? (
                            format(formData.deliveryDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.deliveryDate || undefined}
                          onSelect={(date) => handleInputChange("deliveryDate", date as any)}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Measurement Guide Image */}
              <div className="border-b pb-6">
                <h4 className="font-semibold text-foreground mb-3">Measurement Guide</h4>
                <div className="flex justify-center">
                  <img 
                    src={measurementGuide} 
                    alt="How to take blouse measurements" 
                    className="max-w-[80%] md:max-w-lg w-full rounded-lg border border-border shadow-sm"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center mt-3">
                  Use a soft measuring tape and measure in inches. Keep the tape snug but not tight.
                </p>
              </div>

              {/* All Measurements - matching guide image 1-10 */}
              <div>
                <h4 className="font-semibold text-foreground mb-2">Front Measurements</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                  <div>
                    <Label htmlFor="shoulder">1. Shoulder</Label>
                    <Input
                      id="shoulder"
                      value={formData.shoulder}
                      onChange={(e) => handleInputChange("shoulder", e.target.value)}
                      placeholder="inches"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shoulderFullLength">2. Shoulder Full Length</Label>
                    <Input
                      id="shoulderFullLength"
                      value={formData.shoulderFullLength}
                      onChange={(e) => handleInputChange("shoulderFullLength", e.target.value)}
                      placeholder="inches"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="frontNeckDepth">3. Front Neck Depth</Label>
                    <Input
                      id="frontNeckDepth"
                      value={formData.frontNeckDepth}
                      onChange={(e) => handleInputChange("frontNeckDepth", e.target.value)}
                      placeholder="inches"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chest">4. Chest (around)</Label>
                    <Input
                      id="chest"
                      value={formData.chest}
                      onChange={(e) => handleInputChange("chest", e.target.value)}
                      placeholder="inches"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="waist">5. Waist (around)</Label>
                    <Input
                      id="waist"
                      value={formData.waist}
                      onChange={(e) => handleInputChange("waist", e.target.value)}
                      placeholder="inches"
                      className="mt-1"
                    />
                  </div>
                </div>

                <h4 className="font-semibold text-foreground mb-2">Back Measurements</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="backNeckDepth">6. Back Neck Depth</Label>
                    <Input
                      id="backNeckDepth"
                      value={formData.backNeckDepth}
                      onChange={(e) => handleInputChange("backNeckDepth", e.target.value)}
                      placeholder="inches"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="blouseLength">7. Blouse Length</Label>
                    <Input
                      id="blouseLength"
                      value={formData.blouseLength}
                      onChange={(e) => handleInputChange("blouseLength", e.target.value)}
                      placeholder="inches"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sleeveLength">8. Sleeve Length</Label>
                    <Input
                      id="sleeveLength"
                      value={formData.sleeveLength}
                      onChange={(e) => handleInputChange("sleeveLength", e.target.value)}
                      placeholder="inches"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sleeveRound">9. Sleeve (around)</Label>
                    <Input
                      id="sleeveRound"
                      value={formData.sleeveRound}
                      onChange={(e) => handleInputChange("sleeveRound", e.target.value)}
                      placeholder="inches"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="armHole">10. Armhole (around)</Label>
                    <Input
                      id="armHole"
                      value={formData.armHole}
                      onChange={(e) => handleInputChange("armHole", e.target.value)}
                      placeholder="inches"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>


              <div className="flex items-center space-x-2 pt-4">
                <Checkbox
                  id="measurementHelp"
                  checked={formData.wantMeasurementHelp}
                  onCheckedChange={(checked) => 
                    handleInputChange("wantMeasurementHelp", checked as boolean)
                  }
                />
                <Label htmlFor="measurementHelp" className="text-sm cursor-pointer">
                  I want guided measurement help (we'll assist you via video call)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Extra Cloths/Laces Option */}
          <Card className="shadow-gold border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                Additional Materials
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Label className="mb-3 block font-semibold">Extra Cloths/Laces Needed?</Label>
              <RadioGroup
                value={formData.extraClothsLaces}
                onValueChange={(value) => handleInputChange("extraClothsLaces", value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="extra-yes" />
                  <Label htmlFor="extra-yes" className="cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="extra-no" />
                  <Label htmlFor="extra-no" className="cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Special Requests */}
          <Card className="shadow-gold border-border">
            <CardHeader>
              <CardTitle className="text-primary">Special Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea
                value={formData.specialRequests}
                onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                placeholder="Any special instructions, fabric handling notes, or additional requests..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Payment Option - Coming Soon */}
          <Card className="shadow-gold border-border">
            <CardHeader className="bg-muted/50">
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="bg-primary/10 rounded-full p-4 mb-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Online Payment Coming Soon</h3>
                <p className="text-muted-foreground max-w-md">
                  We're working on integrating secure online payment options. For now, payment details will be shared after order confirmation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Price & Submit */}
          <Card className="shadow-elegant border-primary">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-2xl font-bold text-primary">$20</p>
                  <p className="text-sm text-muted-foreground">per blouse</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="customItem"
                    checked={formData.isCustomItem}
                    onCheckedChange={(checked) => 
                      handleInputChange("isCustomItem", checked as boolean)
                    }
                  />
                  <Label htmlFor="customItem" className="text-sm cursor-pointer">
                    I understand this is a custom-made item
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  size="lg"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-10"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place My Order"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </section>
  );
};
