import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface OTPVerificationProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
  email: string;
}

const OTPVerification = ({ open, onClose, onVerified, email }: OTPVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const { verifyOTP, sendOTP } = useAuth();

  // Start countdown when dialog opens
  useEffect(() => {
    if (open) {
      setCountdown(60);
      setOtp("");
    }
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0 && open) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, open]);

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setIsVerifying(true);

    const { error } = await verifyOTP(otp);
    if (error) {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
      setOtp("");
    } else {
      toast({
        title: "Verified!",
        description: "Your identity has been confirmed.",
      });
      onVerified();
    }
    setIsVerifying(false);
  };

  const handleResend = async () => {
    setIsResending(true);
    const { error } = await sendOTP();
    if (error) {
      toast({
        title: "Failed to resend",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCountdown(60);
      setOtp("");
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your email.",
      });
    }
    setIsResending(false);
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 5)) + c)
    : "";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Two-Factor Verification</DialogTitle>
          <DialogDescription className="text-sm">
            Enter the 6-digit code sent to <strong>{maskedEmail}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <InputOTP
            value={otp}
            onChange={setOtp}
            maxLength={6}
            autoFocus
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button
            onClick={handleVerify}
            disabled={otp.length !== 6 || isVerifying}
            className="w-full"
            size="lg"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Code"
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Code expires in 10 minutes
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={countdown > 0 || isResending}
              className="text-xs"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend code in ${countdown}s`
              ) : (
                <>
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Resend code
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPVerification;
