// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Leaf } from 'lucide-react';

// const SignupPage = () => {

//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState<'farmer' | 'doctor'>('farmer');
//   const [village,setVillage] = useState('');
//   const [city,setCity] = useState('');  
//   const [district,setdistrict] = useState('');

//   const { signup } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     signup(name, email, password, role, city, district, village);
//     navigate(role === 'doctor' ? '/doctor-dashboard' : '/user-dashboard');
//   };

//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center px-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <Link to="/" className="flex items-center justify-center gap-2 mb-2">
//             <div className="bg-primary rounded-full p-1.5"><Leaf className="h-5 w-5 text-primary-foreground" /></div>
//             <span className="font-heading font-bold text-xl">AgriVet AI</span>
//           </Link>
//           <CardTitle className="font-heading text-2xl">Create Account</CardTitle>
//           <CardDescription>Sign up to get started</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">

//             <div className="space-y-2">
//               <Label htmlFor="name">Full Name</Label>
//               <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required />
//             </div>

//             <div className="space-y-2">
//               <Label>I am a</Label>
//               <Select value={role} onValueChange={(v) => setRole(v as 'farmer' | 'doctor')}>
//                 <SelectTrigger><SelectValue /></SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="farmer">Farmer / Animal Owner</SelectItem>
//                   <SelectItem value="doctor">Veterinary Doctor</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <Button type="submit" className="w-full">Sign Up</Button>
//           </form>
//           <div className="mt-4 text-center text-sm text-muted-foreground">
//             Already have an account? <Link to="/login" className="text-primary font-medium">Login</Link>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default SignupPage;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SignupPage = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'farmer' | 'doctor'>('farmer');
  const [village, setVillage] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    // Validation can be added here if needed


    setIsLoading(true);
    const result = await signup(name, email, password, role, village, city, district );
    setIsLoading(false);


    if (result.success) {
      toast({
        title: 'Account created!',
        description: 'Welcome to ExpenseFlow. Start tracking your expenses.',
      });
      const stored = JSON.parse(localStorage.getItem('userData')!);
      navigate(role === 'doctor' ? '/doctor-dashboard' : '/user-dashboard');
    } else {
      toast({
        title: 'Signup failed',
        description: result.error,
        variant: 'destructive',
      });
    }

  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-2">
            <div className="bg-primary rounded-full p-1.5">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl">AgriVet AI</span>
          </Link>
          <CardTitle className="font-heading text-2xl">Create Account</CardTitle>
          <CardDescription>Sign up to get started</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label>I am a</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as 'farmer' | 'doctor')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmer">Farmer / Animal Owner</SelectItem>
                  <SelectItem value="doctor">Veterinary Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Village */}
            <div className="space-y-2">
              <Label htmlFor="village">Village</Label>
              <Input
                id="village"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="Enter your village"
                required
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter your city"
                required
              />
            </div>

            {/* District */}
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Enter your district"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;