import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, Shield, ShieldCheck, User, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AccountSettings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isToggling2FA, setIsToggling2FA] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("two_fa_enabled, full_name")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile) {
          setIs2FAEnabled(profile.two_fa_enabled || false);
          setProfileName(profile.full_name || "");
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleToggle2FA = async (enabled: boolean) => {
    if (!user) return;
    setIsToggling2FA(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ two_fa_enabled: enabled })
        .eq("user_id", user.id);

      if (error) {
        toast({
          title: "Failed to update 2FA",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setIs2FAEnabled(enabled);
        toast({
          title: enabled ? "2FA Enabled" : "2FA Disabled",
          description: enabled
            ? "Two-factor authentication is now active. You'll receive a verification code when signing in."
            : "Two-factor authentication has been disabled.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsToggling2FA(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast({ title: "Signed out", description: "You've been signed out successfully." });
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" aria-label="Back to home">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              Account Settings
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your account preferences
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Profile</CardTitle>
              </div>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Name</Label>
                <p className="text-foreground font-medium">{profileName || "Not set"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email</Label>
                <p className="text-foreground font-medium">{user?.email || "—"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Security - 2FA */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Security</CardTitle>
              </div>
              <CardDescription>
                Protect your account with additional security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <Label htmlFor="2fa-toggle" className="font-medium cursor-pointer">
                      Two-Factor Authentication (2FA)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receive a one-time code via email each time you sign in for added security.
                    </p>
                  </div>
                </div>
                <Switch
                  id="2fa-toggle"
                  checked={is2FAEnabled}
                  onCheckedChange={handleToggle2FA}
                  disabled={isToggling2FA}
                  aria-label="Toggle two-factor authentication"
                />
              </div>
              {is2FAEnabled && (
                <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-xs text-muted-foreground">
                    ✓ 2FA is active. A 6-digit verification code will be sent to{" "}
                    <strong>{user?.email}</strong> each time you sign in.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
