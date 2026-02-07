import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, User, MapPin, Ruler, Shirt, Calendar, Download } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/csvExport";
interface OrderFormData {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  deliveryDate: string;
  specialRequests: string;
  blouseType: "princess-cut" | "standard";
  hookPosition: "front-hook" | "back-hook";
  measurements: {
    blouseBackLength: string;
    fullShoulder: string;
    shoulderStrap: string;
    backNeckDepth: string;
    frontNeckDepth: string;
    shoulderToApex: string;
    frontLength: string;
    chest: string;
    waist: string;
    sleeveLength: string;
    armRound: string;
    sleeveRound: string;
    armHole: string;
  };
}

interface OrderFormProps {
  onSubmit: (data: OrderFormData, files: FileList | null) => void;
}

export const OrderForm = ({ onSubmit }: OrderFormProps) => {
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    deliveryDate: "",
    specialRequests: "",
    blouseType: "standard",
    hookPosition: "back-hook",
    measurements: {
      blouseBackLength: "",
      fullShoulder: "",
      shoulderStrap: "",
      backNeckDepth: "",
      frontNeckDepth: "",
      shoulderToApex: "",
      frontLength: "",
      chest: "",
      waist: "",
      sleeveLength: "",
      armRound: "",
      sleeveRound: "",
      armHole: "",
    },
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMeasurementChange = (field: keyof OrderFormData['measurements'], value: string) => {
    setFormData(prev => ({
      ...prev,
      measurements: { ...prev.measurements, [field]: value }
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploadedFiles(files);
      toast.success(`${files.length} file(s) uploaded successfully`);
    }
  };

  const handleExportToExcel = () => {
    const exportData = {
      "Customer Name": formData.customerName,
      "Email": formData.email,
      "Phone": formData.phone,
      "Address": formData.address,
      "City": formData.city,
      "Pincode": formData.pincode,
      "Delivery Date": formData.deliveryDate,
      "Blouse Type": formData.blouseType === "princess-cut" ? "Princess Cut" : "Standard",
      "Hook Position": formData.hookPosition === "front-hook" ? "Front Hook" : "Back Hook",
      "Blouse Back Length": formData.measurements.blouseBackLength,
      "Full Shoulder": formData.measurements.fullShoulder,
      "Shoulder Strap": formData.measurements.shoulderStrap,
      "Back Neck Depth": formData.measurements.backNeckDepth,
      "Front Neck Depth": formData.measurements.frontNeckDepth,
      "Shoulder to Apex": formData.measurements.shoulderToApex,
      "Front Length": formData.measurements.frontLength,
      "Chest": formData.measurements.chest,
      "Waist": formData.measurements.waist,
      "Sleeve Length": formData.measurements.sleeveLength,
      "Arm Round": formData.measurements.armRound,
      "Sleeve Round": formData.measurements.sleeveRound,
      "Arm Hole": formData.measurements.armHole,
      "Special Requests": formData.specialRequests,
    };

    downloadCSV([exportData], `order_${formData.customerName || "customer"}_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success("Order exported to CSV successfully!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.phone || !formData.address || !formData.deliveryDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    onSubmit(formData, uploadedFiles);
    toast.success("Order submitted successfully!");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-elegant">
      <CardHeader className="bg-gradient-royal text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <User className="h-6 w-6" />
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-base font-medium">
                Full Name *
              </Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleInputChange("customerName", e.target.value)}
                placeholder="Enter your full name"
                required
                className="border-2 border-border focus:border-royal-red"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-medium">
                Phone Number *
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                required
                className="border-2 border-border focus:border-royal-red"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="your.email@example.com"
              className="border-2 border-border focus:border-royal-red"
            />
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-royal-red">
              <MapPin className="h-5 w-5" />
              Delivery Address
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address" className="text-base font-medium">
                Complete Address *
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="House/Flat number, Street, Locality"
                required
                className="border-2 border-border focus:border-royal-red min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-base font-medium">
                  City *
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Your city"
                  required
                  className="border-2 border-border focus:border-royal-red"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode" className="text-base font-medium">
                  PIN Code *
                </Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                  placeholder="XXXXXX"
                  required
                  className="border-2 border-border focus:border-royal-red"
                />
              </div>
            </div>
          </div>

          {/* Delivery Date */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-royal-red">
              <Calendar className="h-5 w-5" />
              Delivery Date
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deliveryDate" className="text-base font-medium">
                Expected Delivery Date *
              </Label>
              <Input
                id="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => handleInputChange("deliveryDate", e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
                className="border-2 border-border focus:border-royal-red"
              />
            </div>
          </div>

          {/* Material Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-royal-red">
              <Upload className="h-5 w-5" />
              Upload Blouse Design
            </div>
            
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-royal-red transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="material-upload"
              />
              <label
                htmlFor="material-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-base font-medium">Upload blouse design (pls include pic of your materials & full design)</p>
                  <p className="text-sm text-muted-foreground">
                    Click to browse or drag and drop images (PNG, JPG, JPEG)
                  </p>
                </div>
              </label>
              {uploadedFiles && (
                <p className="text-sm text-emerald font-medium mt-2">
                  {uploadedFiles.length} file(s) selected
                </p>
              )}
            </div>
          </div>

          {/* Blouse Type */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-royal-red">
              <Shirt className="h-5 w-5" />
              Blouse Type
            </div>
            
            <RadioGroup
              value={formData.blouseType}
              onValueChange={(value: "princess-cut" | "standard") => handleInputChange("blouseType", value)}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex items-center space-x-3 border-2 border-border rounded-lg p-4 cursor-pointer hover:border-royal-red transition-colors">
                <RadioGroupItem value="princess-cut" id="princess-cut" />
                <Label htmlFor="princess-cut" className="cursor-pointer font-medium">
                  Princess Cut
                </Label>
              </div>
              <div className="flex items-center space-x-3 border-2 border-border rounded-lg p-4 cursor-pointer hover:border-royal-red transition-colors">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard" className="cursor-pointer font-medium">
                  Standard
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Hook Position */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-royal-red">
              <Shirt className="h-5 w-5" />
              Hook Position
            </div>
            
            <RadioGroup
              value={formData.hookPosition}
              onValueChange={(value: "front-hook" | "back-hook") => handleInputChange("hookPosition", value)}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex items-center space-x-3 border-2 border-border rounded-lg p-4 cursor-pointer hover:border-royal-red transition-colors">
                <RadioGroupItem value="front-hook" id="front-hook" />
                <Label htmlFor="front-hook" className="cursor-pointer font-medium">
                  Front Hook
                </Label>
              </div>
              <div className="flex items-center space-x-3 border-2 border-border rounded-lg p-4 cursor-pointer hover:border-royal-red transition-colors">
                <RadioGroupItem value="back-hook" id="back-hook" />
                <Label htmlFor="back-hook" className="cursor-pointer font-medium">
                  Back Hook
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Measurements */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-royal-red">
              <Ruler className="h-5 w-5" />
              Blouse Measurements (in inches)
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="blouseBackLength" className="text-sm font-medium">
                  1. Blouse Back Length
                </Label>
                <Input
                  id="blouseBackLength"
                  value={formData.measurements.blouseBackLength}
                  onChange={(e) => handleMeasurementChange("blouseBackLength", e.target.value)}
                  placeholder="inches"
                  className="border-2 border-border focus:border-royal-red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullShoulder" className="text-sm font-medium">
                  2. Full Shoulder
                </Label>
                <Input
                  id="fullShoulder"
                  value={formData.measurements.fullShoulder}
                  onChange={(e) => handleMeasurementChange("fullShoulder", e.target.value)}
                  placeholder="inches"
                  className="border-2 border-border focus:border-royal-red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shoulderStrap" className="text-sm font-medium">
                  3. Shoulder Strap
                </Label>
                <Input
                  id="shoulderStrap"
                  value={formData.measurements.shoulderStrap}
                  onChange={(e) => handleMeasurementChange("shoulderStrap", e.target.value)}
                  placeholder="inches"
                  className="border-2 border-border focus:border-royal-red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backNeckDepth" className="text-sm font-medium">
                  4. Back Neck Depth
                </Label>
                <Input
                  id="backNeckDepth"
                  value={formData.measurements.backNeckDepth}
                  onChange={(e) => handleMeasurementChange("backNeckDepth", e.target.value)}
                  placeholder="inches"
                  className="border-2 border-border focus:border-royal-red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frontNeckDepth" className="text-sm font-medium">
                  5. Front Neck Depth
                </Label>
                <Input
                  id="frontNeckDepth"
                  value={formData.measurements.frontNeckDepth}
                  onChange={(e) => handleMeasurementChange("frontNeckDepth", e.target.value)}
                  placeholder="inches"
                  className="border-2 border-border focus:border-royal-red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shoulderToApex" className="text-sm font-medium">
                  6. Shoulder to Apex
                </Label>
                <Input
                  id="shoulderToApex"
                  value={formData.measurements.shoulderToApex}
                  onChange={(e) => handleMeasurementChange("shoulderToApex", e.target.value)}
                  placeholder="inches"
                  className="border-2 border-border focus:border-royal-red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frontLength" className="text-sm font-medium">
                  7. Front Length
                </Label>
                <Input
                  id="frontLength"
                  value={formData.measurements.frontLength}
                  onChange={(e) => handleMeasurementChange("frontLength", e.target.value)}
                  placeholder="inches"
                  className="border-2 border-border focus:border-royal-red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chest" className="text-sm font-medium">
                  8. Chest (around)
                </Label>
                <Input
                  id="chest"
                  value={formData.measurements.chest}
                  onChange={(e) => handleMeasurementChange("chest", e.target.value)}
                  placeholder="inches"
                  className="border-2 border-border focus:border-royal-red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waist" className="text-sm font-medium">
                  9. Waist (around)
                </Label>
                <Input
                  id="waist"
                  value={formData.measurements.waist}
                  onChange={(e) => handleMeasurementChange("waist", e.target.value)}
                  placeholder="inches"
                  className="border-2 border-border focus:border-royal-red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sleeveLength" className="text-sm font-medium">
                  10. Sleeve Length
                </Label>
                <Input
                  id="sleeveLength"
                  value={formData.measurements.sleeveLength}
                  onChange={(e) => handleMeasurementChange("sleeveLength", e.target.value)}
                  placeholder="inches"
                  className="border-2 border-border focus:border-royal-red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="armRound" className="text-sm font-medium">
                  11. Arm Round
                </Label>
                <Input
                  id="armRound"
                  value={formData.measurements.armRound}
                  onChange={(e) => handleMeasurementChange("armRound", e.target.value)}
                  placeholder="inches"
                  className="border-2 border-border focus:border-royal-red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sleeveRound" className="text-sm font-medium">
                  12. Sleeve Round
                </Label>
                <Input
                  id="sleeveRound"
                  value={formData.measurements.sleeveRound}
                  onChange={(e) => handleMeasurementChange("sleeveRound", e.target.value)}
                  placeholder="inches"
                  className="border-2 border-border focus:border-royal-red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="armHole" className="text-sm font-medium">
                  13. Arm Hole
                </Label>
                <Input
                  id="armHole"
                  value={formData.measurements.armHole}
                  onChange={(e) => handleMeasurementChange("armHole", e.target.value)}
                  placeholder="inches"
                  className="border-2 border-border focus:border-royal-red"
                />
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="specialRequests" className="text-base font-medium">
              Special Requests or Notes
            </Label>
            <Textarea
              id="specialRequests"
              value={formData.specialRequests}
              onChange={(e) => handleInputChange("specialRequests", e.target.value)}
              placeholder="Any specific requirements, measurements, or design preferences..."
              className="border-2 border-border focus:border-royal-red min-h-[100px]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              type="button"
              variant="outline"
              size="lg"
              onClick={handleExportToExcel}
              className="flex-1 text-lg font-semibold gap-2"
            >
              <Download className="h-5 w-5" />
              Download as Excel
            </Button>
            <Button 
              type="submit" 
              variant="elegant" 
              size="lg" 
              className="flex-1 text-lg font-semibold"
            >
              Continue to Design Selection
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};