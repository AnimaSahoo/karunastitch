import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SketchCanvas } from "@/components/SketchCanvas";
import { 
  Upload, 
  User, 
  MapPin, 
  Ruler, 
  Palette, 
  Image as ImageIcon,
  CheckCircle,
  X,
  CalendarIcon
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Import sample blouse images
import blousePrincessCut from "@/assets/blouse-princess-cut.jpg";
import blouseBoatNeck from "@/assets/blouse-boat-neck.jpg";
import blouseSweetheart from "@/assets/blouse-sweetheart.jpg";
import blouseHalter from "@/assets/blouse-halter.jpg";
import blouseCollar from "@/assets/blouse-collar.jpg";
import blouseHighNeck from "@/assets/blouse-high-neck.jpg";
import blouseBackless from "@/assets/blouse-backless.jpg";
import blousePuffSleeve from "@/assets/blouse-puff-sleeve.jpg";
import measurementGuide from "@/assets/measurement-guide.jpg";

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
  // Measurements - Front
  shoulder: string;
  shoulderFullLength: string;
  frontNeckDepth: string;
  chest: string;
  waist: string;
  // Measurements - Back
  backNeckDepth: string;
  blouseLength: string;
  sleeveLength: string;
  sleeveAround: string;
  armhole: string;
  // Options
  blouseType: "princess-cut" | "standard";
  hookPosition: "front-hook" | "back-hook";
  deliveryDate: Date | null;
  wantMeasurementHelp: boolean;
  isCustomItem: boolean;
  specialRequests: string;
}

const sampleDesigns = [
  { id: "princess", name: "Princess Cut", image: blousePrincessCut, desc: "Deep V-neck" },
  { id: "boat", name: "Boat Neck", image: blouseBoatNeck, desc: "Wide horizontal" },
  { id: "sweetheart", name: "Sweetheart", image: blouseSweetheart, desc: "Heart-shaped" },
  { id: "halter", name: "Halter Neck", image: blouseHalter, desc: "Ties at neck" },
  { id: "collar", name: "Collar Neck", image: blouseCollar, desc: "Shirt-style" },
  { id: "high", name: "High Neck", image: blouseHighNeck, desc: "Full coverage" },
  { id: "backless", name: "Backless", image: blouseBackless, desc: "Open back" },
  { id: "puff", name: "Puff Sleeve", image: blousePuffSleeve, desc: "Voluminous" },
];

export const BlouseOrderForm = ({ onSubmit }: BlouseOrderFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "USA",
    // Front measurements
    shoulder: "",
    shoulderFullLength: "",
    frontNeckDepth: "",
    chest: "",
    waist: "",
    // Back measurements
    backNeckDepth: "",
    blouseLength: "",
    sleeveLength: "",
    sleeveAround: "",
    armhole: "",
    // Options
    blouseType: "standard",
    hookPosition: "back-hook",
    deliveryDate: null,
    wantMeasurementHelp: false,
    isCustomItem: true,
    specialRequests: "",
  });

  const [fabricPhotos, setFabricPhotos] = useState<File[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [sketchData, setSketchData] = useState<string>("");
  const [designDescription, setDesignDescription] = useState("");
  const [activeDesignTab, setActiveDesignTab] = useState("sample");

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFabricUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 3);
      setFabricPhotos(newFiles);
      toast.success(`${newFiles.length} fabric photo(s) uploaded`);
    }
  };

  const removeFabricPhoto = (index: number) => {
    setFabricPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceImage(file);
      toast.success("Reference image uploaded");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.phone || !formData.street) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (fabricPhotos.length === 0) {
      toast.error("Please upload at least one fabric photo");
      return;
    }

    if (!selectedDesign && !referenceImage && !sketchData) {
      toast.error("Please select or create a design");
      return;
    }

    toast.success("Order placed successfully! We'll contact you soon.");
    onSubmit?.();
  };

  return (
    <section className="py-16 bg-background" id="order-form">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Place Your Order
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fill in your details, upload your fabric, and choose your design
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
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    required
                    className="mt-1"
                  />
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
                  className="mt-1"
                />
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

          {/* Fabric Upload */}
          <Card className="shadow-gold border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Upload className="h-5 w-5" />
                Upload Fabric Photos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Upload 1-3 clear photos of your blouse fabric material
              </p>
              
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFabricUpload}
                  className="hidden"
                  id="fabric-upload"
                />
                <label htmlFor="fabric-upload" className="cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium">Click to upload fabric photos</p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG up to 10MB each (max 3 files)
                  </p>
                </label>
              </div>

              {/* Preview uploaded photos */}
              {fabricPhotos.length > 0 && (
                <div className="mt-4 flex gap-4 flex-wrap">
                  {fabricPhotos.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Fabric ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => removeFabricPhoto(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Design Options */}
          <Card className="shadow-gold border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Palette className="h-5 w-5" />
                Blouse Design
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={activeDesignTab} onValueChange={setActiveDesignTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="sample">Sample Designs</TabsTrigger>
                  <TabsTrigger value="sketch">Sketch Design</TabsTrigger>
                  <TabsTrigger value="reference">Upload Reference</TabsTrigger>
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
                        <div className="aspect-[3/4] mb-2 overflow-hidden rounded-lg">
                          <img 
                            src={design.image} 
                            alt={design.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
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
                          console.log(`Design saved: ${designName}`);
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
                    <Label className="mb-3 block">Delivery Date</Label>
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
                    className="max-w-md w-full rounded-lg border border-border shadow-sm"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center mt-3">
                  Use a soft measuring tape and measure in inches. Keep the tape snug but not tight.
                </p>
              </div>

              {/* Front Measurements */}
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">Front</span>
                  Blouse Front Measurements
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
              </div>

              {/* Back Measurements */}
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="bg-secondary/50 text-secondary-foreground px-2 py-1 rounded text-sm">Back</span>
                  Blouse Back Measurements
                </h4>
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
                    <Label htmlFor="sleeveAround">9. Sleeve (around)</Label>
                    <Input
                      id="sleeveAround"
                      value={formData.sleeveAround}
                      onChange={(e) => handleInputChange("sleeveAround", e.target.value)}
                      placeholder="inches"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="armhole">10. Armhole (around)</Label>
                    <Input
                      id="armhole"
                      value={formData.armhole}
                      onChange={(e) => handleInputChange("armhole", e.target.value)}
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
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-10"
                >
                  Place My Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </section>
  );
};
