import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, User, MapPin } from "lucide-react";
import { toast } from "sonner";

interface OrderFormData {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  specialRequests: string;
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
    specialRequests: "",
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploadedFiles(files);
      toast.success(`${files.length} file(s) uploaded successfully`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.phone || !formData.address) {
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

          {/* Material Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-royal-red">
              <Upload className="h-5 w-5" />
              Upload Material Photos
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
                  <p className="text-base font-medium">Upload photos of your blouse material</p>
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

          <Button 
            type="submit" 
            variant="elegant" 
            size="lg" 
            className="w-full text-lg font-semibold"
          >
            Continue to Design Selection
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};