import { useState, useEffect, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Loader2, Star, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { downloadCSV } from "@/lib/csvExport";
import { logger } from "@/lib/logger";

interface FeedbackData {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  order_id: string | null;
  overall_experience: number;
  fitting_rating: number;
  quality_rating: number;
  comments: string | null;
}

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFeedback = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setFeedback(data || []);
    } catch (error) {
      logger.error("AdminFeedback.loadFeedback", error);
      toast({
        title: "Error",
        description: "Failed to load feedback. Make sure you have admin access.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const handleExport = () => {
    if (feedback.length === 0) {
      toast({
        title: "No feedback to export",
        description: "There is no feedback in the database.",
        variant: "destructive",
      });
      return;
    }

    const exportData = feedback.map((item) => ({
      "Customer Name": item.customer_name || "Anonymous",
      "Customer Email": item.customer_email || "N/A",
      "Order ID": item.order_id ? item.order_id.slice(0, 8) : "N/A",
      "Overall Experience": item.overall_experience,
      "Fitting Rating": item.fitting_rating,
      "Quality Rating": item.quality_rating,
      "Comments": item.comments || "",
      "Submitted On": new Date(item.created_at).toLocaleDateString("en-IN"),
    }));

    const date = new Date().toISOString().split("T")[0];
    downloadCSV(exportData, `KarunaStitch_Feedback_${date}.csv`);

    toast({
      title: "Export successful",
      description: "Feedback has been exported to CSV.",
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">({rating})</span>
      </div>
    );
  };

  const getAverageRating = (type: "overall" | "fitting" | "quality") => {
    if (feedback.length === 0) return 0;
    const sum = feedback.reduce((acc, item) => {
      switch (type) {
        case "overall":
          return acc + item.overall_experience;
        case "fitting":
          return acc + item.fitting_rating;
        case "quality":
          return acc + item.quality_rating;
        default:
          return acc;
      }
    }, 0);
    return (sum / feedback.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Customer Feedback
              </h1>
              <p className="text-muted-foreground">
                View all customer reviews and ratings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {feedback.length} Reviews
            </Badge>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Overall Experience</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                {getAverageRating("overall")} / 5
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Fitting Rating</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                {getAverageRating("fitting")} / 5
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Quality Rating</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                {getAverageRating("quality")} / 5
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Feedback Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading feedback...</span>
              </div>
            ) : feedback.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-lg">No feedback yet</p>
                <p className="text-muted-foreground text-sm mt-2">
                  Customer reviews will appear here once submitted
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Overall</TableHead>
                      <TableHead>Fitting</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedback.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">
                              {item.customer_name || "Anonymous"}
                            </p>
                            <p className="text-muted-foreground">
                              {item.customer_email || "No email"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.order_id ? `${item.order_id.slice(0, 8)}...` : "N/A"}
                        </TableCell>
                        <TableCell>{renderStars(item.overall_experience)}</TableCell>
                        <TableCell>{renderStars(item.fitting_rating)}</TableCell>
                        <TableCell>{renderStars(item.quality_rating)}</TableCell>
                        <TableCell className="max-w-xs">
                          {item.comments ? (
                            <p className="text-sm truncate" title={item.comments}>
                              {item.comments}
                            </p>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              No comments
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(item.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminFeedback;
