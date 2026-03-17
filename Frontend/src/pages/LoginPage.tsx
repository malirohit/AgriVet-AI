import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf , Wallet, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login ,  isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

   if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);

    console.log("Login Result:", result); // Debug log

    setIsLoading(false);

    if (result.success) {

      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
     
      const stored = JSON.parse(localStorage.getItem('userData')!);
      navigate(stored.role === 'doctor' ? '/doctor-dashboard' : '/user-dashboard');
    } else {

      toast({ 
        title: 'Login failed', 
        description: 'Invalid email or password.', variant: 'destructive' 
      });

    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-2">
            <div className="bg-primary rounded-full p-1.5"><Leaf className="h-5 w-5 text-primary-foreground" /></div>
            <span className="font-heading font-bold text-xl">AgriVet AI</span>
          </Link>
          <CardTitle className="font-heading text-2xl">Welcome Back</CardTitle>
          <CardDescription>Login to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
     
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="farmer@demo.com" required />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="123456" required />
            </div>

            <Button type="submit" className="w-full">Login</Button>

          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account? <Link to="/signup" className="text-primary font-medium">Sign Up</Link>
          </div>

          {/* Temperoray Credentials */}
          <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
            <p className="font-medium mb-1">Demo Credentials:</p>
            <p>Farmer: farmer@demo.com / 123456</p>
            <p>Doctor: doctor@demo.com / 123456</p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
