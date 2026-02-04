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
import { Search, Eye, Trash2, ArrowLeft, Download, Loader2, LogOut, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAllOrders,
  searchOrders,
  getOrdersByName,
  getOrdersByEmail,
  getOrdersByPhone,
  deleteOrderById,
  updateOrderStatus,
  getOrderCount,
  getOrdersByStatus,
  type OrderData,
  type OrderStatus,
} from "@/lib/orderUtils";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import * as XLSX from "xlsx";
import { logger } from "@/lib/logger";

type SearchType = "all" | "name" | "email" | "phone" | "orderId" | "blouseType";

const Admin = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  // Load orders from database
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
      toast({
        title: "Error",
        description: "Failed to load orders.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  // Initial load
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadOrders();
      return;
    }

    setIsSearching(true);
    try {
      let results: OrderData[];
      const query = searchQuery.toLowerCase();

      switch (searchType) {
        case "name":
          results = await getOrdersByName(query);
          break;
        case "email":
          results = await getOrdersByEmail(query);
          break;
        case "phone":
          results = await getOrdersByPhone(query);
          break;
        case "orderId":
          results = await searchOrders(query);
          results = results.filter((order) =>
            order.id.toLowerCase().includes(query)
          );
          break;
        case "blouseType":
          results = await searchOrders(query);
          results = results.filter((order) =>
            order.blouseType.toLowerCase().includes(query)
          );
          break;
        case "all":
        default:
          results = await searchOrders(query);
      }

      // Apply status filter to search results
      if (statusFilter !== "all") {
        results = results.filter((order) => order.status === statusFilter);
      }

      setOrders(results);
    } catch (error) {
      logger.error("Admin.handleSearch", error);
      toast({
        title: "Error",
        description: "Failed to search orders.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Enter key for search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      const success = await deleteOrderById(orderId);
      if (success) {
        toast({
          title: "Order deleted",
          description: "The order has been successfully deleted.",
        });
        loadOrders();
        setSelectedOrder(null);
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the order.",
          variant: "destructive",
        });
      }
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      toast({
        title: "Status updated",
        description: `Order status changed to ${newStatus}.`,
      });
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "in-progress":
        return "default";
      case "completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const handleExport = async () => {
    const allOrders = await getAllOrders();
    if (allOrders.length === 0) {
      toast({
        title: "No orders to export",
        description: "There are no orders in the database.",
        variant: "destructive",
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(allOrders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `KarunaStitch_AllOrders_${date}.xlsx`);

    toast({
      title: "Export successful",
      description: "Orders have been exported to Excel.",
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
            <Link to="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Order Management
              </h1>
              <p className="text-muted-foreground">
                View and manage all customer orders
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {orderCount} Orders
            </Badge>
            <Link to="/admin/feedback">
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                View Feedback
              </Button>
            </Link>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter Orders</CardTitle>
            <CardDescription>
              Find orders by customer details, order ID, blouse type, location, or design
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={searchType}
                onValueChange={(value: SearchType) => setSearchType(value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Search by..." />
                </SelectTrigger>
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
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="default" 
                className="shrink-0"
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>
            
            {/* Status Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Filter by status:</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    if (!searchQuery) loadOrders();
                  }}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter("pending");
                    if (!searchQuery) loadOrders();
                  }}
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === "in-progress" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter("in-progress");
                    if (!searchQuery) loadOrders();
                  }}
                >
                  In Progress
                </Button>
                <Button
                  variant={statusFilter === "completed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter("completed");
                    if (!searchQuery) loadOrders();
                  }}
                >
                  Completed
                </Button>
              </div>
              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="ml-auto text-muted-foreground"
                >
                  Clear filters
                </Button>
              )}
            </div>

            {/* Results count */}
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
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : "Orders will appear here once customers place them"}
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
                        <TableCell className="font-mono text-sm">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.fullName}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{order.email}</p>
                            <p className="text-muted-foreground">
                              {order.phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.blouseType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status || "pending"}
                            onValueChange={(value: OrderStatus) =>
                              handleStatusChange(order.id, value)
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <Badge variant={getStatusBadgeVariant(order.status || "pending")}>
                                {getStatusLabel(order.status || "pending")}
                              </Badge>
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(order.id)}
                              className="text-destructive hover:text-destructive"
                            >
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
        <Dialog
          open={!!selectedOrder}
          onOpenChange={() => setSelectedOrder(null)}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Order ID: {selectedOrder?.id}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedOrder.fullName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedOrder.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedOrder.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">
                    Shipping Address
                  </h3>
                  <p className="text-sm">
                    {selectedOrder.street}, {selectedOrder.city},{" "}
                    {selectedOrder.state} {selectedOrder.zip},{" "}
                    {selectedOrder.country}
                  </p>
                </div>

                {/* Measurements */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Measurements</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Blouse Back Length</p>
                      <p className="font-medium">{selectedOrder.blouseBackLength || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Full Shoulder</p>
                      <p className="font-medium">{selectedOrder.fullShoulder || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Shoulder Strap</p>
                      <p className="font-medium">{selectedOrder.shoulderStrap || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Back Neck Depth</p>
                      <p className="font-medium">{selectedOrder.backNeckDepth || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Front Neck Depth</p>
                      <p className="font-medium">{selectedOrder.frontNeckDepth || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Shoulder to Apex</p>
                      <p className="font-medium">{selectedOrder.shoulderToApex || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Front Length</p>
                      <p className="font-medium">{selectedOrder.frontLength || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Chest</p>
                      <p className="font-medium">{selectedOrder.chest || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Waist</p>
                      <p className="font-medium">{selectedOrder.waist || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sleeve Length</p>
                      <p className="font-medium">{selectedOrder.sleeveLength || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Arm Round</p>
                      <p className="font-medium">{selectedOrder.armRound || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sleeve Round</p>
                      <p className="font-medium">{selectedOrder.sleeveRound || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Arm Hole</p>
                      <p className="font-medium">{selectedOrder.armHole || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Design Details */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Design Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Blouse Type</p>
                      <p className="font-medium">{selectedOrder.blouseType || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Hook Position</p>
                      <p className="font-medium">{selectedOrder.hookPosition || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Selected Design</p>
                      <p className="font-medium">{selectedOrder.selectedDesign || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Extra Cloths/Laces</p>
                      <p className="font-medium">{selectedOrder.extraClothsLaces || "No"}</p>
                    </div>
                  </div>
                  {selectedOrder.designDescription && (
                    <div className="mt-4">
                      <p className="text-muted-foreground">Design Description</p>
                      <p className="font-medium">{selectedOrder.designDescription}</p>
                    </div>
                  )}
                  {selectedOrder.specialRequests && (
                    <div className="mt-4">
                      <p className="text-muted-foreground">Special Requests</p>
                      <p className="font-medium">{selectedOrder.specialRequests}</p>
                    </div>
                  )}
                </div>

                {/* Order Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Order Date</p>
                      <p className="font-medium">{formatDate(selectedOrder.orderDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Delivery Date</p>
                      <p className="font-medium">{formatDate(selectedOrder.deliveryDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant={getStatusBadgeVariant(selectedOrder.status || "pending")}>
                        {getStatusLabel(selectedOrder.status || "pending")}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Measurement Help</p>
                      <p className="font-medium">{selectedOrder.wantMeasurementHelp ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Select
                    value={selectedOrder.status || "pending"}
                    onValueChange={(value: OrderStatus) =>
                      handleStatusChange(selectedOrder.id, value)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedOrder.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Order
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
