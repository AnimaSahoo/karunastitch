import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { FeedbackForm } from "@/components/FeedbackForm";
import { getCurrentOrder } from "@/lib/orderUtils";

const Feedback = () => {
  const currentOrder = getCurrentOrder();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="text-xl font-semibold text-primary">Blouse & Beyond</span>
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            We'd Love Your Feedback
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Your feedback helps us create better blouses and improve our service for you and other customers.
          </p>
        </div>

        <FeedbackForm
          orderId={currentOrder?.id}
          customerName={currentOrder?.fullName}
          customerEmail={currentOrder?.email}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} Blouse & Beyond. Handcrafted with love.</p>
        </div>
      </footer>
    </div>
  );
};

export default Feedback;
