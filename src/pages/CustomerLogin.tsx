import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, Lock, Mail, UserPlus, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import PasswordStrengthIndicator, { isPasswordStrong } from "@/components/PasswordStrengthIndicator";
import OTPVerification from "@/components/OTPVerification";

type FormMode = "login" | "signup" | "forgot";

const CustomerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const { signIn, signUp, sendOTP, user, isFullyAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  // Set initial mode from query param
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") setFormMode("signup");
  }, [searchParams]);

  // Redirect if already fully authenticated
  useEffect(() => {
    if (user && isFullyAuthenticated) {
      navigate(redirectTo);
    }
  }, [user, isFullyAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formMode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          toast({
            title: "Error sending reset email",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Reset email sent!",
            description: "Check your inbox for a password reset link.",
          });
          setFormMode("login");
        }
      } else if (formMode === "signup") {
        if (!isPasswordStrong(password)) {
          toast({
            title: "Password too weak",
            description: "Please meet all password requirements before proceeding.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        if (!acceptedTerms) {
          toast({
            title: "Terms required",
            description: "Please accept the Terms & Conditions to create an account.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account before signing in.",
          });
          setFormMode("login");
          setPassword("");
          setFullName("");
          setAcceptedTerms(false);
        }
      } else {
        // Login
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Check if 2FA is enabled
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("two_fa_enabled")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (profile?.two_fa_enabled) {
            setLoginEmail(email);
            setShowOTP(true);
            const { error: otpError } = await sendOTP();
            if (otpError) {
              toast({
                title: "Failed to send verification code",
                description: otpError.message,
                variant: "destructive",
              });
            } else {
              toast({
                title: "Verification code sent",
                description: "Please check your email for the 6-digit code.",
              });
            }
          } else {
            toast({ title: "Welcome back!", description: "You've been signed in successfully." });
            navigate(redirectTo);
          }
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = () => {
    setShowOTP(false);
    toast({ title: "Welcome back!", description: "Your identity has been verified." });
    navigate(redirectTo);
  };

  const handleOTPClose = async () => {
    // Sign out if user cancels OTP
    setShowOTP(false);
    await supabase.auth.signOut();
    toast({
      title: "Verification cancelled",
      description: "You've been signed out. Please try again.",
      variant: "destructive",
    });
  };

  const getTitle = () => {
    switch (formMode) {
      case "forgot":
        return "Reset Password";
      case "signup":
        return "Create Account";
      default:
        return "Welcome Back";
    }
  };

  const getDescription = () => {
    switch (formMode) {
      case "forgot":
        return "Enter your email to receive a password reset link";
      case "signup":
        return "Join Karuna Stitch for a personalized experience";
      default:
        return "Sign in to your Karuna Stitch account";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-2">
            <ArrowLeft className="h-4 w-4 text-muted-foreground inline mr-1" />
            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Home
            </span>
          </Link>
          <h1 className="font-heading text-[32px] md:text-[36px] tracking-wide">
            <span className="font-semibold text-primary">Karuna</span>{" "}
            <span className="font-normal text-foreground">Stitch</span>
          </h1>
        </div>

        <Card className="shadow-lg border-border/60">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              {formMode === "signup" ? (
                <UserPlus className="h-5 w-5 text-primary" />
              ) : formMode === "forgot" ? (
                <Mail className="h-5 w-5 text-primary" />
              ) : (
                <Lock className="h-5 w-5 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl">{getTitle()}</CardTitle>
            <CardDescription className="mt-1">{getDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formMode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                    maxLength={100}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  maxLength={255}
                />
              </div>

              {formMode !== "forgot" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {formMode === "login" && (
                      <button
                        type="button"
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                        onClick={() => setFormMode("forgot")}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete={formMode === "signup" ? "new-password" : "current-password"}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {formMode === "signup" && <PasswordStrengthIndicator password={password} />}
                </div>
              )}

              {formMode === "signup" && (
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      target="_blank"
                      className="text-primary underline hover:text-primary/80"
                    >
                      Terms & Conditions
                    </Link>
                  </Label>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {formMode === "forgot"
                      ? "Sending..."
                      : formMode === "signup"
                        ? "Creating account..."
                        : "Signing in..."}
                  </>
                ) : formMode === "forgot" ? (
                  "Send Reset Link"
                ) : formMode === "signup" ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </Button>

              {formMode === "forgot" && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setFormMode("login")}
                >
                  Back to login
                </Button>
              )}
            </form>

            {/* Mode toggle */}
            {formMode !== "forgot" && (
              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  {formMode === "signup" ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="text-primary font-medium hover:text-primary/80 transition-colors"
                        onClick={() => { setFormMode("login"); setPassword(""); }}
                      >
                        Log in
                      </button>
                    </>
                  ) : (
                    <>
                      New here?{" "}
                      <button
                        type="button"
                        className="text-primary font-medium hover:text-primary/80 transition-colors"
                        onClick={() => { setFormMode("signup"); setPassword(""); }}
                      >
                        Create Account
                      </button>
                    </>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <OTPVerification
        open={showOTP}
        onClose={handleOTPClose}
        onVerified={handleOTPVerified}
        email={loginEmail}
      />
    </div>
  );
};

export default CustomerLogin;
