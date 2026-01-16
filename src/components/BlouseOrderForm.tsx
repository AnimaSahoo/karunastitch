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
  X
} from "lucide-react";
import { toast } from "sonner";

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
  // Measurements
  bust: string;
  blouseLength: string;
  shoulder: string;
  sleeveLength: string;
  neckDepth: string;
  // Options
  wantMeasurementHelp: boolean;
  isCustomItem: boolean;
  specialRequests: string;
}

const sampleDesigns = [
  { id: "princess", name: "Princess Cut", image: "👸", desc: "Deep V-neck" },
  { id: "boat", name: "Boat Neck", image: "⛵", desc: "Wide horizontal" },
  { id: "sweetheart", name: "Sweetheart", image: "💖", desc: "Heart-shaped" },
  { id: "halter", name: "Halter Neck", image: "🎀", desc: "Ties at neck" },
  { id: "collar", name: "Collar Neck", image: "👔", desc: "Shirt-style" },
  { id: "high", name: "High Neck", image: "🔝", desc: "Full coverage" },
  { id: "backless", name: "Backless", image: "✨", desc: "Open back" },
  { id: "puff", name: "Puff Sleeve", image: "🎈", desc: "Voluminous" },
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
    bust: "",
    blouseLength: "",
    shoulder: "",
    sleeveLength: "",
    neckDepth: "",
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
                  <TabsTrigger value="reference">Upload Reference</TabsTrigger>
                  <TabsTrigger value="sketch">Sketch Design</TabsTrigger>
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
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          selectedDesign === design.id
                            ? "border-primary bg-primary/5 shadow-elegant"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="text-3xl block mb-2">{design.image}</span>
                        <span className="font-medium text-sm block">{design.name}</span>
                        <span className="text-xs text-muted-foreground">{design.desc}</span>
                        {selectedDesign === design.id && (
                          <CheckCircle className="h-4 w-4 text-primary mx-auto mt-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reference">
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload an inspiration image (Pinterest, Instagram, etc.)
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
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bust">Bust</Label>
                  <Input
                    id="bust"
                    value={formData.bust}
                    onChange={(e) => handleInputChange("bust", e.target.value)}
                    placeholder="inches"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="blouseLength">Blouse Length</Label>
                  <Input
                    id="blouseLength"
                    value={formData.blouseLength}
                    onChange={(e) => handleInputChange("blouseLength", e.target.value)}
                    placeholder="inches"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="shoulder">Shoulder</Label>
                  <Input
                    id="shoulder"
                    value={formData.shoulder}
                    onChange={(e) => handleInputChange("shoulder", e.target.value)}
                    placeholder="inches"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="sleeveLength">Sleeve Length</Label>
                  <Input
                    id="sleeveLength"
                    value={formData.sleeveLength}
                    onChange={(e) => handleInputChange("sleeveLength", e.target.value)}
                    placeholder="inches"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="neckDepth">Neck Depth</Label>
                  <Input
                    id="neckDepth"
                    value={formData.neckDepth}
                    onChange={(e) => handleInputChange("neckDepth", e.target.value)}
                    placeholder="inches"
                    className="mt-1"
                  />
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
