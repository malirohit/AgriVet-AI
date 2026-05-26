
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


  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'farmer' | 'doctor'>('farmer');

  const [doctorAvailability, setDoctorAvailability] = useState({
    monday: { enabled: false, start: "", end: "" },
    tuesday: { enabled: false, start: "", end: "" },
    wednesday: { enabled: false, start: "", end: "" },
    thursday: { enabled: false, start: "", end: "" },
    friday: { enabled: false, start: "", end: "" },
    saturday: { enabled: false, start: "", end: "" },
    sunday: { enabled: false, start: "", end: "" },
  });

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

    const result = await signup(

      profilePicture,
      name,
      email,
      contactNumber,
      password,
      role,
      village,
      city,
      district,
      doctorAvailability,

    );
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-2xl shadow-2xl border border-border/50 rounded-2xl">

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

        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Profile Picture */}
            {/* <div className="space-y-2">

              <Label htmlFor="profile">Profile Picture</Label>

              <Input
                id="profile"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setProfilePicture(e.target.files?.[0] || null)
                }
              />

            </div> */}
            {/* Profile Picture */}
            <div className="space-y-3">

              <Label htmlFor="profile">Profile Picture</Label>

              {/* Preview */}
              {previewUrl && (
                <div className="flex items-center gap-4">

                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-24 w-24 rounded-full object-cover border-2 border-border shadow"
                  />

                  <div className="flex flex-col gap-2">

                    {/* Change Image */}
                    <Label
                      htmlFor="profile"
                      className="cursor-pointer text-sm font-medium text-primary hover:underline"
                    >
                      Change Image
                    </Label>

                    {/* Remove Image */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfilePicture(null);
                        setPreviewUrl(null);
                      }}
                      className="text-sm text-red-500 text-left hover:underline"
                    >
                      Remove Image
                    </button>

                  </div>
                </div>
              )}

              {/* Upload Input */}
              {!previewUrl && (
                <Input
                  id="profile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {

                    const file = e.target.files?.[0] || null;

                    setProfilePicture(file);

                    if (file) {
                      setPreviewUrl(URL.createObjectURL(file));
                    }

                  }}
                />
              )}

              {/* Hidden Input for Changing */}
              {previewUrl && (
                <Input
                  id="profile"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {

                    const file = e.target.files?.[0] || null;

                    setProfilePicture(file);

                    if (file) {
                      setPreviewUrl(URL.createObjectURL(file));
                    }

                  }}
                />
              )}

            </div>

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

            {/* Contact Number */}
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>

              <Input
                id="contactNumber"
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Enter contact number"
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

            {role === "doctor" && (
              <div className="space-y-4">

                <Label className="text-lg font-medium">
                  Doctor Availability
                </Label>

                {Object.entries(doctorAvailability).map(([day, value]) => (

                  <div
                    key={day}
                    className="border border-border/60 bg-muted/20 p-4 rounded-xl space-y-3">

                    <div className="flex items-center gap-2">

                      <input
                        type="checkbox"
                        checked={value.enabled}
                        onChange={(e) =>
                          setDoctorAvailability((prev) => ({
                            ...prev,
                            [day]: {
                              ...prev[day],
                              enabled: e.target.checked,
                            },
                          }))
                        }
                      />

                      <Label className="capitalize">{day}</Label>

                    </div>

                    {value.enabled && (

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Start Time */}
                        <div className="flex-1 space-y-1">
                          <Label className="text-sm text-muted-foreground">
                            Start Time
                          </Label>

                          <Input
                            type="time"
                            value={value.start}
                            onChange={(e) =>
                              setDoctorAvailability((prev) => ({
                                ...prev,
                                [day]: {
                                  ...prev[day],
                                  start: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>

                        {/* End Time */}
                        <div className="flex-1 space-y-1">
                          <Label className="text-sm text-muted-foreground">
                            End Time
                          </Label>

                          <Input
                            type="time"
                            value={value.end}
                            onChange={(e) =>
                              setDoctorAvailability((prev) => ({
                                ...prev,
                                [day]: {
                                  ...prev[day],
                                  end: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>

                      </div>

                    )}

                  </div>

                ))}
              </div>
            )}

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

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold rounded-xl">
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