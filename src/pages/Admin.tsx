import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Search, Eye, Trash2, ArrowLeft, Download, Loader2, LogOut, MessageSquare, Pencil, Save, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAllOrders,
  searchOrders,
  getOrdersByName,
  getOrdersByEmail,
  getOrdersByPhone,
  deleteOrderById,
  updateOrderStatus,
  updateOrderMeasurements,
  getOrderCount,
  getOrdersByStatus,
  type OrderData,
  type OrderStatus,
} from "@/lib/orderUtils";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { downloadCSV } from "@/lib/csvExport";
import { logger } from "@/lib/logger";

type SearchType = "all" | "name" | "email" | "phone" | "orderId" | "blouseType";

const MEASUREMENT_FIELDS: { key: keyof OrderData; label: string }[] = [
  { key: "shoulder", label: "1. Shoulder" },
  { key: "shoulderFullLength", label: "2. Shoulder Full Length" },
  { key: "frontNeckDepth", label: "3. Front Neck Depth" },
  { key: "chest", label: "4. Chest (around)" },
  { key: "waist", label: "5. Waist (around)" },
  { key: "backNeckDepth", label: "6. Back Neck Depth" },
  { key: "blouseLength", label: "7. Blouse Length" },
  { key: "sleeveLength", label: "8. Sleeve Length" },
  { key: "sleeveRound", label: "9. Sleeve (around)" },
  { key: "armHole", label: "10. Armhole (around)" },
];

const Admin = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isEditingMeasurements, setIsEditingMeasurements] = useState(false);
  const [editedMeasurements, setEditedMeasurements] = useState<Partial<OrderData>>({});
  const [isSavingMeasurements, setIsSavingMeasurements] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    toast({ title: "Logged out", description: "You have been successfully logged out." });
  };

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      let fetchedOrders: OrderData[];
      if (statusFilter !== "all") {
        fetchedOrders = await getOrdersByStatus(statusFilter);
      } else {
        fetchedOrders = await getAllOrders();
      }
      setOrders(fetchedOrders);
      const count = await getOrderCount();
      setOrderCount(count);
    } catch (error) {
      logger.error("Admin.loadOrders", error);
      toast({ title: "Error", description: "Failed to load orders.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) { loadOrders(); return; }
    setIsSearching(true);
    try {
      let results: OrderData[];
      const query = searchQuery.toLowerCase();
      switch (searchType) {
        case "name": results = await getOrdersByName(query); break;
        case "email": results = await getOrdersByEmail(query); break;
        case "phone": results = await getOrdersByPhone(query); break;
        case "orderId":
          results = await searchOrders(query);
          results = results.filter((o) => o.id.toLowerCase().includes(query));
          break;
        case "blouseType":
          results = await searchOrders(query);
          results = results.filter((o) => o.blouseType.toLowerCase().includes(query));
          break;
        default: results = await searchOrders(query);
      }
      if (statusFilter !== "all") results = results.filter((o) => o.status === statusFilter);
      setOrders(results);
    } catch (error) {
      logger.error("Admin.handleSearch", error);
      toast({ title: "Error", description: "Failed to search orders.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      const success = await deleteOrderById(orderId);
      if (success) {
        toast({ title: "Order deleted", description: "The order has been successfully deleted." });
        loadOrders();
        setSelectedOrder(null);
      } else {
        toast({ title: "Error", description: "Failed to delete the order.", variant: "destructive" });
      }
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      toast({ title: "Status updated", description: `Order status changed to ${newStatus}.` });
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } else {
      toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" });
    }
  };

  const handleStartEditMeasurements = () => {
    if (!selectedOrder) return;
    setEditedMeasurements({
      shoulder: selectedOrder.shoulder,
      shoulderFullLength: selectedOrder.shoulderFullLength,
      frontNeckDepth: selectedOrder.frontNeckDepth,
      chest: selectedOrder.chest,
      waist: selectedOrder.waist,
      backNeckDepth: selectedOrder.backNeckDepth,
      blouseLength: selectedOrder.blouseLength,
      sleeveLength: selectedOrder.sleeveLength,
      sleeveRound: selectedOrder.sleeveRound,
      armHole: selectedOrder.armHole,
      specialRequests: selectedOrder.specialRequests,
    });
    setIsEditingMeasurements(true);
  };

  const handleCancelEditMeasurements = () => {
    setIsEditingMeasurements(false);
    setEditedMeasurements({});
  };

  const handleSaveMeasurements = async () => {
    if (!selectedOrder) return;
    setIsSavingMeasurements(true);
    try {
      const success = await updateOrderMeasurements(selectedOrder.id, {
        shoulder: editedMeasurements.shoulder,
        shoulderFullLength: editedMeasurements.shoulderFullLength,
        frontNeckDepth: editedMeasurements.frontNeckDepth,
        chest: editedMeasurements.chest,
        waist: editedMeasurements.waist,
        backNeckDepth: editedMeasurements.backNeckDepth,
        blouseLength: editedMeasurements.blouseLength,
        sleeveLength: editedMeasurements.sleeveLength,
        sleeveRound: editedMeasurements.sleeveRound,
        armHole: editedMeasurements.armHole,
        specialRequests: editedMeasurements.specialRequests,
      });

      if (success) {
        const updatedOrder = { ...selectedOrder, ...editedMeasurements };
        setSelectedOrder(updatedOrder as OrderData);
        setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? { ...o, ...editedMeasurements } as OrderData : o)));
        setIsEditingMeasurements(false);
        setEditedMeasurements({});
        toast({ title: "Measurements saved", description: "The measurements have been updated successfully." });
      } else {
        toast({ title: "Error", description: "Failed to save measurements.", variant: "destructive" });
      }
    } catch (error) {
      logger.error("Admin.handleSaveMeasurements", error);
      toast({ title: "Error", description: "Failed to save measurements.", variant: "destructive" });
    } finally {
      setIsSavingMeasurements(false);
    }
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "secondary";
      case "in-progress": return "default";
      case "completed": return "outline";
      default: return "secondary";
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "Pending";
      case "in-progress": return "In Progress";
      case "completed": return "Completed";
      default: return status;
    }
  };

  const handleExport = async () => {
    const allOrders = await getAllOrders();
    if (allOrders.length === 0) {
      toast({ title: "No orders to export", description: "There are no orders in the database.", variant: "destructive" });
      return;
    }
    const date = new Date().toISOString().split("T")[0];
    downloadCSV(allOrders as unknown as Record<string, unknown>[], `KarunaStitch_AllOrders_${date}.csv`);
    toast({ title: "Export successful", description: "Orders have been exported to CSV." });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    loadOrders();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
              <p className="text-muted-foreground">View and manage all customer orders</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">{orderCount} Orders</Badge>
            <Link to="/admin/feedback"><Button variant="outline"><MessageSquare className="h-4 w-4 mr-2" />View Feedback</Button></Link>
            <Button onClick={handleExport} variant="outline"><Download className="h-4 w-4 mr-2" />Export All</Button>
            <Button onClick={handleLogout} variant="ghost" size="sm"><LogOut className="h-4 w-4 mr-2" />Logout</Button>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter Orders</CardTitle>
            <CardDescription>Find orders by customer details, order ID, blouse type, location, or design</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={searchType} onValueChange={(value: SearchType) => setSearchType(value)}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Search by..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  <SelectItem value="name">Customer Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="orderId">Order ID</SelectItem>
                  <SelectItem value="blouseType">Blouse Type</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown} className="pl-10" />
              </div>
              <Button variant="default" className="shrink-0" onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Search
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Filter by status:</span>
              <div className="flex flex-wrap gap-2">
                {(["all", "pending", "in-progress", "completed"] as const).map((s) => (
                  <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm"
                    onClick={() => { setStatusFilter(s); if (!searchQuery) loadOrders(); }}>
                    {s === "all" ? "All" : getStatusLabel(s as OrderStatus)}
                  </Button>
                ))}
              </div>
              {(searchQuery || statusFilter !== "all") && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="ml-auto text-muted-foreground">Clear filters</Button>
              )}
            </div>
            {(searchQuery || statusFilter !== "all") && (
              <p className="text-sm text-muted-foreground">
                Showing {orders.length} {orders.length === 1 ? "order" : "orders"}
                {statusFilter !== "all" && ` with status "${getStatusLabel(statusFilter as OrderStatus)}"`}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading orders...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No orders found</p>
                <p className="text-muted-foreground text-sm mt-2">
                  {searchQuery ? "Try adjusting your search criteria" : "Orders will appear here once customers place them"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Blouse Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                        <TableCell className="font-medium">{order.fullName}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{order.email}</p>
                            <p className="text-muted-foreground">{order.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{order.blouseType}</Badge></TableCell>
                        <TableCell>
                          <Select value={order.status || "pending"} onValueChange={(value: OrderStatus) => handleStatusChange(order.id, value)}>
                            <SelectTrigger className="w-[130px]">
                              <Badge variant={getStatusBadgeVariant(order.status || "pending")}>{getStatusLabel(order.status || "pending")}</Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{formatDate(order.orderDate)}</TableCell>
                        <TableCell>{formatDate(order.deliveryDate)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedOrder(order); setIsEditingMeasurements(false); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => { setSelectedOrder(null); setIsEditingMeasurements(false); setEditedMeasurements({}); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>Order ID: {selectedOrder?.id}</DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">

                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-muted-foreground">Name</p><p className="font-medium">{selectedOrder.fullName}</p></div>
                    <div><p className="text-muted-foreground">Email</p><p className="font-medium">{selectedOrder.email}</p></div>
                    <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{selectedOrder.phone}</p></div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Shipping Address</h3>
                  <p className="text-sm">{selectedOrder.street}, {selectedOrder.city}, {selectedOrder.state} {selectedOrder.zip}, {selectedOrder.country}</p>
                </div>

                {/* Measurements — Editable */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">Measurements</h3>
                    {!isEditingMeasurements ? (
                      <Button variant="outline" size="sm" onClick={handleStartEditMeasurements}>
                        <Pencil className="h-3 w-3 mr-2" />Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCancelEditMeasurements}>
                          <X className="h-3 w-3 mr-2" />Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveMeasurements} disabled={isSavingMeasurements}>
                          {isSavingMeasurements ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Save className="h-3 w-3 mr-2" />}
                          Save
                        </Button>
                      </div>
                    )}
                  </div>

                  {!isEditingMeasurements ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                      {MEASUREMENT_FIELDS.map(({ key, label }) => (
                        <div key={key}>
                          <p className="text-muted-foreground">{label}</p>
                          <p className="font-medium">{(selectedOrder[key] as string) || "N/A"}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {MEASUREMENT_FIELDS.map(({ key, label }) => (
                        <div key={key}>
                          <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
                          <Input
                            value={(editedMeasurements[key] as string) || ""}
                            onChange={(e) => setEditedMeasurements((prev) => ({ ...prev, [key]: e.target.value }))}
                            placeholder={`e.g. 36"`}
                            className="h-8 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special Requests — editable too */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-muted-foreground">Special Requests</p>
                    </div>
                    {!isEditingMeasurements ? (
                      <p className="text-sm">{selectedOrder.specialRequests || "None"}</p>
                    ) : (
                      <Textarea
                        value={(editedMeasurements.specialRequests as string) || ""}
                        onChange={(e) => setEditedMeasurements((prev) => ({ ...prev, specialRequests: e.target.value }))}
                        placeholder="Any special instructions..."
                        rows={3}
                        className="text-sm"
                      />
                    )}
                  </div>
                </div>

                {/* Design Details */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Design Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-muted-foreground">Blouse Type</p><p className="font-medium">{selectedOrder.blouseType || "N/A"}</p></div>
                    <div><p className="text-muted-foreground">Hook Position</p><p className="font-medium">{selectedOrder.hookPosition || "N/A"}</p></div>
                    <div><p className="text-muted-foreground">Selected Design</p><p className="font-medium">{selectedOrder.selectedDesign || "N/A"}</p></div>
                    <div><p className="text-muted-foreground">Extra Cloths/Laces</p><p className="font-medium">{selectedOrder.extraClothsLaces || "No"}</p></div>
                  </div>
                  {selectedOrder.designDescription && (() => {
                    const desc = selectedOrder.designDescription;
                    const refImageMatch = desc.match(/Reference Image: (https?:\/\/[^\s
]+)/);
                    const sketchMatch = desc.match(/Sketch: (https?:\/\/[^\s
]+)/);
                    const cleanDesc = desc
                      .replace(/\n\nReference Image: https?:\/\/[^\s
]+/, "")
                      .replace(/\n\nSketch: https?:\/\/[^\s
]+/, "")
                      .trim();
                    return (
                      <div className="mt-4 space-y-3">
                        {cleanDesc && (
                          <div>
                            <p className="text-muted-foreground text-sm">Design Description</p>
                            <p className="font-medium text-sm">{cleanDesc}</p>
                          </div>
                        )}
                        {refImageMatch && (
                          <div>
                            <p className="text-muted-foreground text-sm mb-2">Reference Image</p>
                            <img
                              src={refImageMatch[1]}
                              alt="Reference design"
                              className="rounded-lg border max-h-64 object-contain w-full"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                            <a href={refImageMatch[1]} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline mt-1 inline-block">Open full image ↗</a>
                          </div>
                        )}
                        {sketchMatch && (
                          <div>
                            <p className="text-muted-foreground text-sm mb-2">Customer Sketch</p>
                            <img
                              src={sketchMatch[1]}
                              alt="Customer sketch"
                              className="rounded-lg border max-h-64 object-contain w-full"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                            <a href={sketchMatch[1]} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline mt-1 inline-block">Open full image ↗</a>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Order Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-muted-foreground">Order Date</p><p className="font-medium">{formatDate(selectedOrder.orderDate)}</p></div>
                    <div><p className="text-muted-foreground">Delivery Date</p><p className="font-medium">{formatDate(selectedOrder.deliveryDate)}</p></div>
                    <div><p className="text-muted-foreground">Status</p><Badge variant={getStatusBadgeVariant(selectedOrder.status || "pending")}>{getStatusLabel(selectedOrder.status || "pending")}</Badge></div>
                    <div><p className="text-muted-foreground">Measurement Help</p><p className="font-medium">{selectedOrder.wantMeasurementHelp ? "Yes" : "No"}</p></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Select value={selectedOrder.status || "pending"} onValueChange={(value: OrderStatus) => handleStatusChange(selectedOrder.id, value)}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Update status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="destructive" onClick={() => handleDelete(selectedOrder.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />Delete Order
                  </Button>
                </div>

              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;
