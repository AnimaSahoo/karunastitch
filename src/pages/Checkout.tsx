import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, ArrowLeft, ShoppingBag, Loader2, MessageSquare } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { getCurrentOrder, getAllOrders, type OrderData } from "@/lib/orderUtils";

const Checkout = () => {
  const navigate = useNavigate();
  const [currentOrder, setCurrentOrder] = useState<OrderData | null>(null);
  const [allOrders, setAllOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      // Load current order from sessionStorage
      const order = getCurrentOrder();
      setCurrentOrder(order);

      // Load all orders from database
      const orders = await getAllOrders();
      setAllOrders(orders);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const orders = await getAllOrders();
      
      if (orders.length === 0) {
        toast.error("No orders to export");
        return;
      }

      // Prepare data for Excel
      const excelData = orders.map((order, index) => ({
        "Order #": index + 1,
        "Order ID": order.id,
        "Order Date": order.orderDate,
        "Customer Name": order.fullName,
        "Email": order.email,
        "Phone": order.phone,
        "Street": order.street,
        "City": order.city,
        "State": order.state,
        "ZIP": order.zip,
        "Country": order.country,
        "1. Blouse Back Length": order.blouseBackLength,
        "2. Full Shoulder": order.fullShoulder,
        "3. Shoulder Strap": order.shoulderStrap,
        "4. Back Neck Depth": order.backNeckDepth,
        "5. Front Neck Depth": order.frontNeckDepth,
        "6. Shoulder to Apex": order.shoulderToApex,
        "7. Front Length": order.frontLength,
        "8. Chest": order.chest,
        "9. Waist": order.waist,
        "10. Sleeve Length": order.sleeveLength,
        "11. Arm Round": order.armRound,
        "12. Sleeve Round": order.sleeveRound,
        "13. Arm Hole": order.armHole,
        "Blouse Type": order.blouseType,
        "Hook Position": order.hookPosition,
        "Delivery Date": order.deliveryDate,
        "Extra Cloths/Laces": order.extraClothsLaces || "No",
        "Selected Design": order.selectedDesign,
        "Design Description": order.designDescription,
        "Special Requests": order.specialRequests,
        "Measurement Help": order.wantMeasurementHelp ? "Yes" : "No",
        "Status": order.status,
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "All Orders");

      // Auto-size columns
      const maxWidth = 30;
      const colWidths = Object.keys(excelData[0] || {}).map((key) => ({
        wch: Math.min(key.length + 5, maxWidth),
      }));
      worksheet["!cols"] = colWidths;

      // Generate and download file
      const fileName = `KarunaStitch_AllOrders_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      toast.success("Excel file downloaded successfully!");
    } catch (error) {
      console.error("Error exporting orders:", error);
      toast.error("Failed to export orders");
    } finally {
      setIsExporting(false);
    }
  };

  const handleBackToHome = () => {
    sessionStorage.removeItem("currentOrder");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-gold">
          <CardContent className="p-8 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Order Found</h2>
            <p className="text-muted-foreground mb-6">
              It looks like you haven't placed an order yet.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Go Back to Order Form
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your order, {currentOrder.fullName}
          </p>
        </div>

        {/* Order Summary */}
        <Card className="shadow-gold mb-6">
          <CardHeader className="bg-gradient-elegant text-primary-foreground rounded-t-lg">
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Order ID</p>
                <p className="font-medium font-mono">{currentOrder.id.slice(0, 8)}...</p>
              </div>
              <div>
                <p className="text-muted-foreground">Order Date</p>
                <p className="font-medium">{formatDate(currentOrder.orderDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{currentOrder.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{currentOrder.email || "Not provided"}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-muted-foreground text-sm mb-1">Shipping Address</p>
              <p className="font-medium">
                {currentOrder.street}, {currentOrder.city}, {currentOrder.state} {currentOrder.zip}, {currentOrder.country}
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-muted-foreground text-sm mb-1">Design Details</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><span className="text-muted-foreground">Style:</span> {currentOrder.selectedDesign || "Custom"}</p>
                <p><span className="text-muted-foreground">Blouse Type:</span> {currentOrder.blouseType}</p>
                <p><span className="text-muted-foreground">Hook:</span> {currentOrder.hookPosition}</p>
                <p><span className="text-muted-foreground">Delivery:</span> {currentOrder.deliveryDate || "Not specified"}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">$20.00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="w-full"
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download All Orders as Excel ({allOrders.length} orders)
          </Button>

          <Button
            onClick={handleBackToHome}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Place Another Order
          </Button>
        </div>

        {/* Feedback Link */}
        <div className="mt-8 p-6 bg-muted/50 rounded-lg text-center">
          <p className="text-muted-foreground mb-3">
            Have you received your order? We'd love to hear your feedback!
          </p>
          <Link to="/feedback">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Share Your Feedback
            </Button>
          </Link>
        </div>

        {/* Note */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          We'll contact you shortly to confirm your order and arrange payment.
        </p>
      </div>
    </div>
  );
};

export default Checkout;
