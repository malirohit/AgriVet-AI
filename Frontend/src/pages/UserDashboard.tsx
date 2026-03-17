
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  getNearbyDoctors,
  bookAppointment,
  getFarmerAppointments,
  getAIRemedy,
  chatWithAi,
  detectDisease
} from '@/api';

import { MOCK_DISEASE_RESULT, MOCK_AI_REMEDY, CHATBOT_RESPONSES } from '@/data/mockData';

import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

import {
  Upload, Scan, Pill, MapPin, Calendar, MessageSquare,
  Mic, Send, Bot, User as UserIcon,
  AlertTriangle, Clock, CheckCircle, XCircle
} from 'lucide-react';

declare global {
  interface Window {
    SpeechRecognition;
    webkitSpeechRecognition;
  }
}

import { useToast } from '@/hooks/use-toast';

const UserDashboard = () => {

  // Doctor Interface
  interface Doctor {
    _id: string;
    name: string;
    email: string;
    role: string;
    village: string;
    city: string;
    district: string;
    //specialization: string;
  }

  // Appointment Interface
  interface Appointment {
    _id: string;

    user: string;      // ObjectId (ref: user)
    doctor: string;    // ObjectId (ref: user)

    nature: string;
    symptoms: string;
    emergency: boolean;

    preferredDate: string; // ISO Date string from backend

    location: string;

    status:
    | "Pending"
    | "Approved"
    | "Rejected"
    | "Scheduled"
    | "Completed";

    assignedSlot?: string;

    sampleCollectionRequired?: boolean;

    homeVisitRequired?: boolean;

    instructions?: string;

    createdAt?: string;
    updatedAt?: string;
  }

  const { user } = useAuth();

  const { toast } = useToast();

  // ✅ Fetch doctors from backend
  const {
    data: doctors = [],
    isLoading,
    isError
  } = useQuery<Doctor[]>({
    queryKey: ['nearbyDoctors'],
    queryFn: getNearbyDoctors,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: myAppointments = [],
    isLoading: aptLoading,
    isError: aptError,
    refetch: refetchAppointments,
  } = useQuery({
    queryKey: ['myAppointments'],
    queryFn: getFarmerAppointments,
    staleTime: 0, // always fresh
    refetchInterval: 10000, // 10 sec auto refresh
  });

  // Disease Detection state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);


  const [diseaseResult, setDiseaseResult] = useState<typeof MOCK_DISEASE_RESULT | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [activeTab, setActiveTab] = useState("detect");

  // AI Remedy State
  const [aiRemedy, setAiRemedy] = useState(null);
  const [loadingRemedy, setLoadingRemedy] = useState(false);

  // Appointment Form
  const [aptForm, setAptForm] = useState({
    doctor: '',
    nature: '',
    symptoms: '',
    emergency: false,
    preferredDate: '',
    location: '',
    sampleCollectionRequired: false,
    homeVisitRequired: false,
  });

  // React Query Mutation for Booking Appointment
  const { mutate, isPending } = useMutation({
    mutationFn: bookAppointment,
    onSuccess: () => {
      toast({
        title: "Appointment Booked",
        description: "Doctor will review your request soon."
      });

      refetchAppointments(); // ✅ Refresh status tab
      // Reset Form After Success
      setAptForm({
        doctor: '',
        nature: '',
        symptoms: '',
        emergency: false,
        preferredDate: '',
        location: '',
        sampleCollectionRequired: false,
        homeVisitRequired: false,
      });
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Something went wrong.",
        variant: "destructive"
      });
    }
  });

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
  }

  // Chat Input State
  const [chatInput, setChatInput] = useState('');

  // Voice
  const [isListening, setIsListening] = useState(false);

  // Chatbot
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: "Hello! I'm your AI Veterinary Assistant. Ask me anything about animal health." }
  ]);


  const handleDetect = async () => {

    if (!imageFile) {
      toast({
        title: "Upload Image",
        description: "Please upload an image first.",
        variant: "destructive"
      });
      return;
    }

    try {

      setDetecting(true);

      const result = await detectDisease(imageFile);

      console.log("Detection Result:", result);

      const formattedResult = {
        animal: result.animal,
        disease: result.disease,
        severity: "Moderate",
        confidence: result.confidence
      };

      setDiseaseResult(formattedResult);

      setActiveTab("remedy");

      setLoadingRemedy(true);

      const remedy = await getAIRemedy(result.animal, result.disease);

      setAiRemedy(remedy);

      setLoadingRemedy(false);

    } catch (error) {

      console.log("Detection Error: ", error);


      toast({
        title: "Detection Failed",
        description: "AI model could not process image.",
        variant: "destructive"
      });

    } finally {
      setDetecting(false);
    }
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!aptForm.doctor) {
      toast({
        title: "Select Doctor",
        description: "Please select a doctor.",
        variant: "destructive"
      });
      return;
    }

    mutate({
      doctor: aptForm.doctor,
      nature: aptForm.nature,
      symptoms: aptForm.symptoms,
      emergency: aptForm.emergency,
      preferredDate: aptForm.preferredDate,
      location: aptForm.location,
      sampleCollectionRequired: aptForm.sampleCollectionRequired,
      homeVisitRequired: aptForm.homeVisitRequired,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handleChat = async () => {

    if (!chatInput.trim()) return;

    const message = chatInput;

    setChatMessages(prev => [
      ...prev,
      { role: "user", text: message }
    ]);

    setChatInput("");

    // show typing indicator
    setChatMessages(prev => [
      ...prev,
      { role: "bot", text: "Typing..." }
    ]);

    try {

      const reply = await chatWithAi(message);

      setChatMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "bot", text: reply };
        return updated;
      });

    } catch (error) {

      console.log("Frontend Error -", error);

      setChatMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "bot",
          text: "Sorry, AI service is temporarily unavailable."
        };
        return updated;
      });

    }

  };

  // const handleVoice = () => {
  //   setIsListening(true);
  //   setTimeout(() => {
  //     setChatInput('My cow has patches on skin and is not eating properly');
  //     setIsListening(false);
  //   }, 2000);
  // };
  const handleVoice = () => {

    if (!recognition) {
      toast({
        title: "Voice Not Supported",
        description: "Your browser does not support Speech Recognition.",
        variant: "destructive"
      });
      return;
    }

    setIsListening(true);

    recognition.start();

    recognition.onresult = (event) => {

      const transcript = event.results[0][0].transcript;

      setChatInput(transcript);
      setTimeout(() => handleChat(), 500);

      setIsListening(false);
    };

    recognition.onerror = (event) => {

      console.log("Speech Error:", event.error);

      toast({
        title: "Voice Error",
        description: "Could not capture voice input.",
        variant: "destructive"
      });

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'Rejected': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-highlight" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">

      <Navbar />

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Welcome, {user?.name} 👋</h1>

        {/* <Tabs defaultValue="detect" className="space-y-6"> */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">


          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="detect" className="gap-1"><Scan className="h-3.5 w-3.5" /> Detect</TabsTrigger>
            <TabsTrigger value="remedy" className="gap-1"><Pill className="h-3.5 w-3.5" /> Remedy</TabsTrigger>
            <TabsTrigger value="vets" className="gap-1"><MapPin className="h-3.5 w-3.5" /> Vets</TabsTrigger>
            <TabsTrigger value="book" className="gap-1"><Calendar className="h-3.5 w-3.5" /> Book</TabsTrigger>
            <TabsTrigger value="status" className="gap-1"><Clock className="h-3.5 w-3.5" /> Status</TabsTrigger>
            <TabsTrigger value="chat" className="gap-1"><MessageSquare className="h-3.5 w-3.5" /> Chat</TabsTrigger>
          </TabsList>

          {/* Disease Detection Tab*/}
          <TabsContent value="detect">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Scan className="h-5 w-5 text-primary" /> Disease Detection
                </CardTitle>
                <CardDescription>
                  Upload an image of your animal for AI-powered disease detection.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-xl p-8 text-center">
                  {uploadedImage ? (
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground text-sm">
                        Click to upload or drag & drop
                      </p>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    className="mt-4 max-w-xs mx-auto"
                    onChange={handleImageUpload}
                  />
                </div>

                {uploadedImage && (
                  <Button onClick={handleDetect} disabled={detecting} className="gap-2">
                    {detecting ? "Analyzing..." : "Detect Disease"}
                    <Scan className="h-4 w-4" />
                  </Button>
                )}

                {diseaseResult && (
                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="pt-6">
                      <h3 className="font-heading font-bold text-lg mb-3">
                        Detection Results
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div className="bg-card p-4 rounded-lg border">
                          <p className="text-xs text-muted-foreground mb-1">
                            Animal
                          </p>
                          <p className="font-bold text-foreground">
                            {diseaseResult.animal}
                          </p>
                        </div>

                        <div className="bg-card p-4 rounded-lg border">
                          <p className="text-xs text-muted-foreground mb-1">
                            Disease Detected
                          </p>
                          <p className="font-bold text-foreground">
                            {diseaseResult.disease}
                          </p>
                        </div>

                        {/* <div className="bg-card p-4 rounded-lg border">
                          <p className="text-xs text-muted-foreground mb-1">
                            Severity
                          </p>
                          <Badge variant="secondary">
                            {diseaseResult.severity}
                          </Badge>
                        </div> */}

                        <div className="bg-card p-4 rounded-lg border">
                          <p className="text-xs text-muted-foreground mb-1">
                            Confidence
                          </p>
                          <p className="font-bold text-primary">
                            {diseaseResult.confidence}%
                          </p>
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Remedy Tab */}
          <TabsContent value="remedy">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2"><Pill className="h-5 w-5 text-primary" /> AI Remedy Suggestions</CardTitle>
                <CardDescription>Based on the detected disease: {diseaseResult?.disease || 'No detection yet'}</CardDescription>
              </CardHeader>
              <CardContent>
                {

                  !diseaseResult ? (

                    <p className="text-muted-foreground text-center py-8">
                      Please detect a disease first in the Detect tab.
                    </p>

                  ) : loadingRemedy ? (

                    <p className="text-center py-8 text-primary font-semibold">
                      Generating AI Remedy... ⏳
                    </p>

                  ) :
                    aiRemedy ? (

                      <div className="space-y-6">

                        {/* First Aid */}
                        <div>

                          <h4 className="font-heading font-bold mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-highlight" /> First Aid Instructions</h4>

                          <ul className="space-y-2">
                            {aiRemedy.firstAid.map((item, i) => (
                              <li key={i} className="flex gap-2 text-sm"><span className="text-primary font-bold">{i + 1}.</span> {item}</li>
                            ))}
                          </ul>

                        </div>

                        {/* Precautions */}
                        <div>

                          <h4 className="font-heading font-bold mb-3">⚠️ Precautions</h4>

                          <ul className="space-y-2">
                            {aiRemedy.precautions.map((item, i) => (
                              <li key={i} className="flex gap-2 text-sm"><span className="text-accent font-bold">•</span> {item}</li>
                            ))}
                          </ul>

                        </div>

                        {/* Vet Consultation */}
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">

                          <h4 className="font-heading font-bold mb-2">🩺 Vet Consultation</h4>
                          <p className="text-sm">{aiRemedy.vetConsultation}</p>

                        </div>

                      </div>

                    ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nearby Doctors Tab*/}
          <TabsContent value="vets">
            <Card>
              <CardHeader>
                <CardTitle>Nearby Veterinarians</CardTitle>
              </CardHeader>
              <CardContent>

                {isLoading ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Loading nearby doctors...
                  </p>
                ) : isError ? (
                  <p className="text-center py-8 text-destructive">
                    Failed to load doctors.
                  </p>
                ) : doctors.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No doctors found in your district.
                  </p>
                ) : (
                  <div className="grid gap-4">

                    {doctors.map((doc) => (
                      <div
                        key={doc._id}
                        className="flex justify-between items-center p-4 border rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <UserIcon className="h-6 w-6 text-primary" />
                          <div>
                            <h4 className="font-bold">{doc.name}</h4>
                            {/* <p className="text-sm text-muted-foreground">
                              {doc.specialization}
                            </p> */}
                            <p className="text-xs text-muted-foreground">
                              {doc.city}
                            </p>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => {
                            setAptForm(prev => ({ ...prev, doctor: doc._id }));
                            setActiveTab("book");
                          }}
                        >
                          Book
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>

          {/* Book Appointment Tab*/}
          <TabsContent value="book">
            <Card>

              <CardHeader>
                <CardTitle>Book Appointment</CardTitle>
              </CardHeader>
              <CardContent>

                <form onSubmit={handleBookAppointment} className="space-y-4 max-w-lg">

                  {/* Select Doctor */}
                  <div className="space-y-2">
                    <Label>Select Doctor</Label>
                    <Select
                      value={aptForm.doctor}
                      onValueChange={(v) =>
                        setAptForm(prev => ({ ...prev, doctor: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a doctor" />
                      </SelectTrigger>
                      <SelectContent>


                        {doctors.map((d) => (
                          <SelectItem key={d._id} value={d._id}>
                            {/* {d.name} — {d.specialization} */}
                            {d.name} — {d.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Nature */}
                  <Input
                    placeholder="Nature of Appointment"
                    value={aptForm.nature}
                    onChange={e =>
                      setAptForm(p => ({ ...p, nature: e.target.value }))
                    }
                    required
                  />

                  {/* Symptoms */}
                  <Textarea
                    placeholder="Describe symptoms"
                    value={aptForm.symptoms}
                    onChange={e =>
                      setAptForm(p => ({ ...p, symptoms: e.target.value }))
                    }
                    required
                  />

                  {/* Emergency */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={aptForm.emergency}
                      onCheckedChange={(v) =>
                        setAptForm(p => ({ ...p, emergency: !!v }))
                      }
                    />
                    <Label>Emergency Case</Label>
                  </div>

                  {/* Date */}
                  <Input
                    type="date"
                    value={aptForm.preferredDate}
                    onChange={e =>
                      setAptForm(p => ({ ...p, preferredDate: e.target.value }))
                    }
                    required
                  />

                  {/* Location */}
                  <Input
                    placeholder="Location"
                    value={aptForm.location}
                    onChange={e =>
                      setAptForm(p => ({ ...p, location: e.target.value }))
                    }
                    required
                  />

                  {/* Sample Collection */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={aptForm.sampleCollectionRequired}
                      onCheckedChange={(v) =>
                        setAptForm(p => ({ ...p, sampleCollectionRequired: !!v }))
                      }
                    />
                    <Label>Sample Collection Required</Label>
                  </div>

                  {/* Home Visit */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={aptForm.homeVisitRequired}
                      onCheckedChange={(v) =>
                        setAptForm(p => ({ ...p, homeVisitRequired: !!v }))
                      }
                    />
                    <Label>Home Visit Required</Label>
                  </div>

                  {/* Submit */}
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Booking..." : "Submit Appointment"}
                  </Button>

                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointment Status */}
          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Status</CardTitle>
              </CardHeader>
              <CardContent>
                {aptLoading ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Loading appointments...
                  </p>
                ) : aptError ? (
                  <p className="text-center py-8 text-destructive">
                    Failed to load appointments.
                  </p>
                ) : myAppointments.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No appointments yet.
                  </p>
                ) : (
                  myAppointments.map((apt) => (
                    <div key={apt._id} className="p-4 border rounded-xl mb-3">
                      <div className="flex justify-between">
                        <h4 className="font-semibold">{apt.nature}</h4>
                        <div className="flex gap-1 items-center">
                          {statusIcon(apt.status)}
                          <Badge>{apt.status}</Badge>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Doctor: {apt.doctor?.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Date: {new Date(apt.preferredDate).toLocaleDateString()}
                      </p>

                      {apt.instructions && (
                        <p className="text-xs mt-2 text-primary">
                          Instructions: {apt.instructions}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chatbot */}
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" /> AI Veterinary Chatbot
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="bg-muted rounded-xl p-4 h-80 overflow-y-auto mb-4 space-y-3">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
                    >
                      {msg.role === "bot" && (
                        <Bot className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      )}

                      <div
                        className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border"
                          }`}
                      >

                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">

                  {/* <Button
                    variant="outline"
                    size="icon"
                    onClick={handleVoice}
                    className={isListening ? "animate-pulse" : ""}
                  >
                    <Mic className="h-4 w-4" />
                  </Button> */}

                  <Button
                    variant={isListening ? "destructive" : "outline"}
                    size="icon"
                    onClick={handleVoice}
                    className={isListening ? "animate-pulse" : ""}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>

                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about animal health..."
                    onKeyDown={(e) => e.key === "Enter" && handleChat()}
                  />

                  <Button size="icon" onClick={handleChat}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
