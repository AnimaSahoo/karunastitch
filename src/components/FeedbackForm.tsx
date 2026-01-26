import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, MessageSquare, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface FeedbackFormProps {
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
  onSubmitSuccess?: () => void;
}

interface RatingFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const RatingField = ({ label, value, onChange }: RatingFieldProps) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                "h-8 w-8 transition-colors",
                (hovered || value) >= star
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {value === 0 && "Click to rate"}
        {value === 1 && "Poor"}
        {value === 2 && "Fair"}
        {value === 3 && "Good"}
        {value === 4 && "Very Good"}
        {value === 5 && "Excellent"}
      </p>
    </div>
  );
};

export const FeedbackForm = ({ 
  orderId, 
  customerName = "", 
  customerEmail = "",
  onSubmitSuccess 
}: FeedbackFormProps) => {
  const [overallExperience, setOverallExperience] = useState(0);
  const [fittingRating, setFittingRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [comments, setComments] = useState("");
  const [name, setName] = useState(customerName);
  const [email, setEmail] = useState(customerEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (overallExperience === 0 || fittingRating === 0 || qualityRating === 0) {
      toast.error("Please provide all ratings");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("feedback").insert({
        order_id: orderId || null,
        overall_experience: overallExperience,
        fitting_rating: fittingRating,
        quality_rating: qualityRating,
        comments: comments.trim() || null,
        customer_name: name.trim() || null,
        customer_email: email.trim() || null,
      });

      if (error) throw error;

      toast.success("Thank you for your feedback!");
      setIsSubmitted(true);
      onSubmitSuccess?.();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-lg mx-auto shadow-gold border-border">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-primary fill-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
          <p className="text-muted-foreground">
            Your feedback helps us improve our services and provide you with the best experience.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto shadow-gold border-border">
      <CardHeader className="bg-gradient-elegant text-primary-foreground rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Share Your Feedback
        </CardTitle>
        <CardDescription className="text-primary-foreground/80">
          We value your opinion! Help us serve you better.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Questions */}
          <div className="space-y-6">
            <RatingField
              label="1. How do you rate the overall experience?"
              value={overallExperience}
              onChange={setOverallExperience}
            />
            
            <RatingField
              label="2. How do you rate the fitting?"
              value={fittingRating}
              onChange={setFittingRating}
            />
            
            <RatingField
              label="3. How do you rate the quality of work?"
              value={qualityRating}
              onChange={setQualityRating}
            />
          </div>

          {/* Optional Fields */}
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label htmlFor="comments">Additional Comments (Optional)</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share any additional thoughts..."
                className="mt-1"
                rows={3}
              />
            </div>

            {!customerName && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Your Name (Optional)</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
