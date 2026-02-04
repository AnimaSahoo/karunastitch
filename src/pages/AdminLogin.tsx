import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Lock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

type FormMode = 'login' | 'signup' | 'forgot';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('login');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formMode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          toast({
            title: 'Error sending reset email',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Reset email sent!',
            description: 'Check your inbox for a password reset link.',
          });
          setFormMode('login');
        }
      } else if (formMode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: 'Sign up failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account created!',
            description: 'Your account has been created. Contact admin to get admin access, then sign in.',
          });
          setFormMode('login');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Login failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Login successful',
            description: 'Redirecting to admin panel...',
          });
          navigate('/admin');
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (formMode) {
      case 'forgot': return 'Reset Password';
      case 'signup': return 'Admin Sign Up';
      default: return 'Admin Login';
    }
  };

  const getDescription = () => {
    switch (formMode) {
      case 'forgot': return 'Enter your email to receive a password reset link';
      case 'signup': return 'Create an account to get started';
      default: return 'Enter your credentials to access the admin panel';
    }
  };

  const getIcon = () => {
    return formMode === 'forgot' ? <Mail className="h-5 w-5 text-primary" /> : <Lock className="h-5 w-5 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              {getIcon()}
              <CardTitle className="text-2xl">{getTitle()}</CardTitle>
            </div>
          </div>
          <CardDescription>
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {formMode !== 'forgot' && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {formMode === 'forgot' ? 'Sending...' : formMode === 'signup' ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                formMode === 'forgot' ? 'Send Reset Link' : formMode === 'signup' ? 'Create Account' : 'Sign In'
              )}
            </Button>
            
            {formMode === 'login' && (
              <Button
                type="button"
                variant="link"
                className="w-full text-muted-foreground"
                onClick={() => setFormMode('forgot')}
              >
                Forgot your password?
              </Button>
            )}
            
            {formMode === 'forgot' && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setFormMode('login')}
              >
                Back to login
              </Button>
            )}
            
            {formMode !== 'forgot' && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setFormMode(formMode === 'signup' ? 'login' : 'signup')}
              >
                {formMode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
