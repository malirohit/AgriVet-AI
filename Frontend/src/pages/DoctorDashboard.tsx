// import { useState } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
// import Navbar from '@/components/Navbar';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Switch } from '@/components/ui/switch';
// import { Calendar, ClipboardList, MapPin, MessageSquare, CheckCircle, Clock, XCircle, AlertTriangle, Send } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';

// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { getDoctorAppointments, updateAppointmentStatus } from '@/api';

// const DoctorDashboard = () => {

//   const { user } = useAuth();
//   const { toast } = useToast();



//   const [queryMsg, setQueryMsg] = useState('');

//   const queryClient = useQueryClient();


//   const { data: appointments = [], isLoading } = useQuery({
//     queryKey: ['doctorAppointments'],
//     queryFn: getDoctorAppointments,
//     refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
//     staleTime: 30000, // Data is considered fresh for 30 seconds
//   });

//   const myAppointments = appointments;

//   console.log("My Appointments:", myAppointments); // Debug log

//   const pendingApts = myAppointments.filter(a => a.status === "Pending");
//   const allApts = myAppointments;

//   const updateMutation = useMutation({
//     mutationFn: ({ id, status }: { id: string; status: string }) =>
//       updateAppointmentStatus(id, status),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
//     }
//   });

//   const handleApprove = (id: string) => {

//     updateMutation.mutate({ id, status: "approved" });

//     toast({
//       title: 'Approved',
//       description: 'Appointment approved and scheduled.'
//     });
//   };

//   const handleReject = (id: string) => {

//     updateMutation.mutate({ id, status: "rejected" });

//     toast({
//       title: 'Rejected',
//       description: 'Appointment Rejected.'
//     });
//   };

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const handleUpdateVisit = (id: string, field: string, value: any) => {
//     updateMutation.mutate({ id, status: value });
//   };

//   // const handleSendQuery = () => {
//   //   if (!queryMsg.trim() || !selectedApt || !user) return;
//   //   addQuery({
//   //     appointmentId: selectedApt,
//   //     senderId: user.id,
//   //     senderName: user.name,
//   //     senderRole: user.role,
//   //     message: queryMsg,
//   //   });
//   //   setQueryMsg('');
//   //   refresh();
//   // };

//   const statusIcon = (status: string) => {
//     switch (status) {
//       case 'Approved': return <CheckCircle className="h-4 w-4 text-primary" />;
//       case 'Rejected': return <XCircle className="h-4 w-4 text-destructive" />;
//       default: return <Clock className="h-4 w-4 text-highlight" />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">

//       <Navbar />

//       <div className="container mx-auto px-4 py-6">

//         <h1 className="font-heading text-2xl font-bold mb-1">Welcome, {user?.name} 🩺</h1>
//         <p className="text-muted-foreground text-sm mb-6">Doctor Dashboard</p>

//         <Tabs defaultValue="requests" className="space-y-6">

//           {/* Tabs */}
//           <TabsList className="flex-wrap h-auto gap-1">
//             <TabsTrigger value="requests" className="gap-1"><ClipboardList className="h-3.5 w-3.5" /> Requests ({pendingApts.length})</TabsTrigger>
//             <TabsTrigger value="manage" className="gap-1"><Calendar className="h-3.5 w-3.5" /> Manage</TabsTrigger>
//             <TabsTrigger value="visits" className="gap-1"><MapPin className="h-3.5 w-3.5" /> Visits</TabsTrigger>
//             {/* <TabsTrigger value="queries" className="gap-1"><MessageSquare className="h-3.5 w-3.5" /> Queries</TabsTrigger> */}
//           </TabsList>

//           {/* Incoming Requests */}
//           <TabsContent value="requests">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="font-heading">Incoming Appointment Requests</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {pendingApts.length === 0 ? (
//                   <p className="text-center text-muted-foreground py-8">No pending requests.</p>
//                 ) : (
//                   <div className="space-y-4">
//                     {pendingApts.map(apt => (
//                       <div key={apt.id} className="p-4 border rounded-xl">
//                         <div className="flex items-start justify-between">
//                           <div>
//                             <h4 className="font-heading font-bold">{apt.user?.name}</h4>
//                             <p className="text-sm text-muted-foreground">{apt.nature}</p>
//                             <p className="text-xs text-muted-foreground mt-1">Symptoms: {apt.symptoms}</p>
//                             <p className="text-xs text-muted-foreground">Date: {apt.preferredDate} · `${apt.user?.village}, ${apt.user?.city}`</p>
//                             {apt.emergency && <Badge variant="destructive" className="mt-1 text-xs gap-1"><AlertTriangle className="h-3 w-3" /> Emergency</Badge>}
//                           </div>
//                           <div className="flex gap-2">
//                             <Button size="sm" onClick={() => handleApprove(apt.id)}>Approve</Button>
//                             <Button size="sm" variant="destructive" onClick={() => handleReject(apt.id)}>Reject</Button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Appointment Management */}
//           <TabsContent value="manage">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="font-heading">Appointment Management</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {allApts.filter(a => a.status === 'Approved').map(apt => (
//                     <div key={apt.id} className="p-4 border rounded-xl space-y-3">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <h4 className="font-heading font-bold text-sm">{apt.user?.name} — {apt.nature}</h4>
//                           <p className="text-xs text-muted-foreground">Scheduled: {apt.scheduledDate}</p>
//                         </div>
//                         <Badge>{apt.visitStatus || 'Pending'}</Badge>
//                       </div>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                         <div className="flex items-center gap-2">
//                           <Switch checked={apt.sampleCollection || false} onCheckedChange={v => handleUpdateVisit(apt.id, 'sampleCollection', v)} />
//                           <Label className="text-xs">Sample Collection</Label>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <Switch checked={apt.homeVisit || false} onCheckedChange={v => handleUpdateVisit(apt.id, 'homeVisit', v)} />
//                           <Label className="text-xs">Home Visit</Label>
//                         </div>
//                         <div>
//                           <Input placeholder="Add instructions" value={apt.instructions || ''} onChange={e => handleUpdateVisit(apt.id, 'instructions', e.target.value)} className="text-xs" />
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                   {allApts.filter(a => a.status === 'Approved').length === 0 && (
//                     <p className="text-center text-muted-foreground py-8">No approved appointments.</p>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Visit Tracking */}
//           <TabsContent value="visits">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="font-heading">Visit Tracking</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {allApts.filter(a => a.status === 'Approved').map(apt => (
//                     <div key={apt.id} className="p-4 border rounded-xl">
//                       <div className="flex items-center justify-between mb-3">
//                         <div>
//                           <h4 className="font-heading font-bold text-sm">{apt.user?.name}</h4>
//                           <p className="text-xs text-muted-foreground">{apt.nature} · `${apt.user?.village}, ${apt.user?.city}`</p>
//                           {apt.sampleCollection && <Badge variant="outline" className="text-xs mt-1">Sample Collection</Badge>}
//                         </div>
//                         <div>
//                           <Select value={apt.visitStatus || 'pending'} onValueChange={v => handleUpdateVisit(apt.id, 'visitStatus', v)}>
//                             <SelectTrigger className="w-[130px] text-xs"><SelectValue /></SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="pending">Pending</SelectItem>
//                               <SelectItem value="scheduled">Scheduled</SelectItem>
//                               <SelectItem value="completed">Completed</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Queries */}
//           {/* <TabsContent value="queries">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="font-heading">Appointment Queries</CardTitle>
//                 <CardDescription>Exchange messages related to specific appointments.</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-2 mb-4">
//                   <Label>Select Appointment</Label>
//                   <Select value={selectedApt || ''} onValueChange={setSelectedApt}>
//                     <SelectTrigger><SelectValue placeholder="Choose an appointment" /></SelectTrigger>
//                     <SelectContent>
//                       {allApts.map(a => <SelectItem key={a.id} value={a.id}>{a.userName} — {a.nature}</SelectItem>)}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 {selectedApt && (
//                   <>
//                     <div className="bg-muted rounded-xl p-4 h-60 overflow-y-auto mb-4 space-y-2">
//                       {getQueriesForAppointment(selectedApt).map(q => (
//                         <div key={q.id} className={`flex gap-2 ${q.senderRole === 'doctor' ? 'justify-end' : ''}`}>
//                           <div className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${q.senderRole === 'doctor' ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>
//                             <p className="text-xs font-bold mb-0.5">{q.senderName}</p>
//                             {q.message}
//                           </div>
//                         </div>
//                       ))}
//                       {getQueriesForAppointment(selectedApt).length === 0 && (
//                         <p className="text-center text-muted-foreground text-sm py-4">No messages yet.</p>
//                       )}
//                     </div>
//                     <div className="flex gap-2">
//                       <Textarea value={queryMsg} onChange={e => setQueryMsg(e.target.value)} placeholder="Type your message..." className="min-h-[40px]" />
//                       <Button size="icon" onClick={handleSendQuery}><Send className="h-4 w-4" /></Button>
//                     </div>
//                   </>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent> */}

//         </Tabs>
//       </div>
//     </div>
//   );
// };

// export default DoctorDashboard;

import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Calendar,
  ClipboardList,
  MapPin,
  AlertTriangle,
  Phone,
  Clock,
  CalendarDays,
  Image as ImageIcon,
  MapPinned,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDoctorAppointments, updateAppointmentStatus } from '@/api';

const DoctorDashboard = () => {

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['doctorAppointments'],
    queryFn: getDoctorAppointments,
    refetchInterval: 30000,
    staleTime: 30000,
  });


  const myAppointments = appointments || [];

  const pendingApts = myAppointments.filter(
    (a) => a.status?.toLowerCase() === "pending"
  );

  const approvedApts = myAppointments.filter(
    (a) => a.status?.toLowerCase() === "approved"
  );


  type AppointmentUpdateData = {

    status?: "Pending" | "Approved" | "Rejected" | "Scheduled" | "Completed";

    visitStatus?: "pending" | "scheduled" | "completed";

  };


  const updateMutation = useMutation({

    mutationFn: ({
      id,
      data
    }: {
      id: string;
      data: AppointmentUpdateData;
    }) => updateAppointmentStatus(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
    }

  });

  // const handleApprove = (id: string) => {

  //   updateMutation.mutate({ 
  //     id, 
  //     status: "Approved" 
  //   });

  //   toast({
  //     title: "Approved",
  //     description: "Appointment approved and scheduled."
  //   });
  // };

  const handleApprove = (id: string) => {

    updateMutation.mutate({
      id,
      data: {
        status: "Approved",
      },
    });

    toast({
      title: "Approved",
      description: "Appointment approved and scheduled."
    });
  };

  // const handleReject = (id: string) => {

  //   updateMutation.mutate({ 
  //     id, 
  //     status: "Rejected" 
  //   });

  //   toast({
  //     title: "Rejected",
  //     description: "Appointment rejected."
  //   });
  // };


  const handleReject = (id: string) => {

    updateMutation.mutate({
      id,
      data: {
        status: "Rejected",
      },
    });

    toast({
      title: "Rejected",
      description: "Appointment rejected."
    });
  };

  // const handleUpdateVisit = (
  //   id: string, 
  //   value: string) => {

  //   updateMutation.mutate({ 
  //     id, visitStatus: value 
  //   });

  // };

  const handleUpdateVisit = (
    id: string,
    value: "pending" | "scheduled" | "completed"
  ) => {

    updateMutation.mutate({
      id,
      data: {
        visitStatus: value,
      },
    });

  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <Navbar />

      <div className="container mx-auto px-4 py-6">

        {/* <h1 className="font-heading text-2xl font-bold mb-1">
          Welcome, {user?.name} 🩺
        </h1> */}

        <div className="flex items-center gap-4 mb-2">

          <img
            src={
              user?.profilePicture ||
              "https://ui-avatars.com/api/?name=Doctor"
            }
            alt="doctor"
            className="h-14 w-14 rounded-full object-cover border"
          />

          <div>

            <h1 className="font-heading text-2xl font-bold">
              Dr. {user?.name} 🩺
            </h1>

            <p className="text-muted-foreground text-sm">
              Veterinary Doctor Dashboard
            </p>

          </div>

        </div>

        {/* <p className="text-muted-foreground text-sm mb-6">
          Doctor Dashboard
        </p> */}

        <Tabs defaultValue="requests" className="space-y-6">

          <TabsList className="flex-wrap h-auto gap-1">

            <TabsTrigger value="requests" className="gap-1">
              <ClipboardList className="h-3.5 w-3.5" />
              Requests ({pendingApts.length})
            </TabsTrigger>

            <TabsTrigger value="manage" className="gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Manage
            </TabsTrigger>

            <TabsTrigger value="visits" className="gap-1">
              <MapPin className="h-3.5 w-3.5" />
              Visits
            </TabsTrigger>

          </TabsList>


          {/* REQUESTS */}

          {/* <TabsContent value="requests">

            <Card>

              <CardHeader>
                <CardTitle className="font-heading">
                  Incoming Appointment Requests
                </CardTitle>
              </CardHeader>

              <CardContent>

                {pendingApts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No pending requests.
                  </p>
                ) : (

                  <div className="space-y-4">

                    {pendingApts.map((apt) => (

                      <div key={apt._id} className="p-4 border rounded-xl">

                        <div className="flex items-start justify-between">

                          <div>

                            <h4 className="font-heading font-bold">
                              {apt.user?.name}
                            </h4>

                            <p className="text-sm text-muted-foreground">
                              {apt.nature}
                            </p>

                            <p className="text-xs text-muted-foreground mt-1">
                              Symptoms: {apt.symptoms}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Date: {new Date(apt.preferredDate).toDateString()}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {apt.user?.village}, {apt.user?.city}
                            </p>

                            {apt.emergency && (
                              <Badge variant="destructive" className="mt-1 text-xs gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Emergency
                              </Badge>
                            )}

                          </div>

                          <div className="flex gap-2">

                            <Button
                              size="sm"
                              onClick={() => handleApprove(apt._id)}
                            >
                              Approve
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(apt._id)}
                            >
                              Reject
                            </Button>

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </CardContent>

            </Card>

          </TabsContent> */}
          <TabsContent value="requests">

            <Card>

              <CardHeader>

                <CardTitle className="font-heading">
                  Incoming Appointment Requests
                </CardTitle>

              </CardHeader>

              <CardContent>

                {pendingApts.length === 0 ? (

                  <p className="text-center text-muted-foreground py-8">
                    No pending requests.
                  </p>

                ) : (

                  <div className="space-y-5">

                    {pendingApts.map((apt) => (

                      <div
                        key={apt._id}
                        className="border rounded-2xl p-5 bg-card shadow-sm space-y-5"
                      >

                        {/* TOP SECTION */}

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                          {/* Farmer Info */}

                          <div className="flex gap-4">

                            <img
                              src={
                                apt.user?.profilePicture ||
                                "https://ui-avatars.com/api/?name=Farmer"
                              }
                              alt="farmer"
                              className="h-16 w-16 rounded-full object-cover border"
                            />

                            <div className="space-y-1">

                              <div className="flex items-center gap-2">

                                <h3 className="font-bold text-lg">
                                  {apt.user?.name}
                                </h3>

                                {apt.emergency && (
                                  <Badge
                                    variant="destructive"
                                    className="gap-1"
                                  >
                                    <AlertTriangle className="h-3 w-3" />
                                    Emergency
                                  </Badge>
                                )}

                              </div>

                              <div className="flex items-center gap-2 text-sm text-muted-foreground">

                                <Phone className="h-4 w-4" />

                                <span>
                                  {apt.user?.contactNumber || "No Contact"}
                                </span>

                              </div>

                              <div className="flex items-center gap-2 text-sm text-muted-foreground">

                                <MapPinned className="h-4 w-4" />

                                <span>
                                  {apt.user?.village}, {apt.user?.city}
                                </span>

                              </div>

                            </div>

                          </div>

                          {/* Action Buttons */}

                          <div className="flex gap-2">

                            <Button
                              size="sm"
                              onClick={() => handleApprove(apt._id)}
                            >
                              Approve
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(apt._id)}
                            >
                              Reject
                            </Button>

                          </div>

                        </div>


                        {/* Appointment Details */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                          <div className="border rounded-xl p-3 space-y-2">

                            <h4 className="font-semibold text-sm">
                              Appointment Details
                            </h4>

                            <div className="space-y-1 text-sm">

                              <p>
                                <span className="font-medium">
                                  Nature:
                                </span>{" "}
                                {apt.nature}
                              </p>

                              <p>
                                <span className="font-medium">
                                  Symptoms:
                                </span>{" "}
                                {apt.symptoms}
                              </p>

                              <div className="flex items-center gap-2">

                                <CalendarDays className="h-4 w-4" />

                                <span>
                                  {new Date(
                                    apt.appointmentDate
                                  ).toLocaleDateString()}
                                </span>

                              </div>

                              <div className="flex items-center gap-2">

                                <Clock className="h-4 w-4" />

                                <span>
                                  {apt.appointmentSlot}
                                </span>

                              </div>

                            </div>

                          </div>


                          {/* Additional Requirements */}

                          <div className="border rounded-xl p-3 space-y-3">

                            <h4 className="font-semibold text-sm">
                              Additional Requirements
                            </h4>

                            <div className="flex flex-wrap gap-2">

                              {apt.sampleCollectionRequired && (
                                <Badge variant="secondary">
                                  Sample Collection Required
                                </Badge>
                              )}

                              {apt.homeVisitRequired && (
                                <Badge variant="secondary">
                                  Home Visit Required
                                </Badge>
                              )}

                            </div>

                            <div className="text-sm">

                              <span className="font-medium">
                                Location:
                              </span>{" "}
                              {apt.location}

                            </div>

                            <div className="text-xs text-muted-foreground">

                              Request Created:
                              {" "}
                              {new Date(
                                apt.createdAt
                              ).toLocaleString()}

                            </div>

                          </div>

                        </div>


                        {/* Uploaded Images */}

                        {apt.animalImages?.length > 0 && (

                          <div className="space-y-3">

                            <div className="flex items-center gap-2">

                              <ImageIcon className="h-4 w-4" />

                              <h4 className="font-semibold text-sm">
                                Uploaded Animal Images
                              </h4>

                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                              {apt.animalImages.map(
                                (img: string, index: number) => (

                                  <a
                                    key={index}
                                    href={img}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >

                                    <img
                                      src={img}
                                      alt={`animal-${index}`}
                                      className="h-32 w-full object-cover rounded-xl border hover:scale-105 transition"
                                    />

                                  </a>

                                )
                              )}

                            </div>

                          </div>

                        )}

                      </div>

                    ))}

                  </div>

                )}

              </CardContent>

            </Card>

          </TabsContent>


          {/* MANAGE */}

          {/* <TabsContent value="manage">

            <Card>

              <CardHeader>
                <CardTitle className="font-heading">
                  Appointment Management
                </CardTitle>
              </CardHeader>

              <CardContent>

                <div className="space-y-4">

                  {approvedApts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No approved appointments.
                    </p>
                  )}

                  {approvedApts.map((apt) => (

                    <div
                      key={apt._id}
                      className="p-4 border rounded-xl space-y-3"
                    >

                      <div className="flex items-center justify-between">

                        <div>

                          <h4 className="font-heading font-bold text-sm">
                            {apt.user?.name} — {apt.nature}
                          </h4>

                          <p className="text-xs text-muted-foreground">
                            Slot: {apt.assignedSlot || "Not Assigned"}
                          </p>

                        </div>

                        <Badge>
                          {apt.visitStatus || "pending"}
                        </Badge>

                      </div>


                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                        <div className="flex items-center gap-2">

                          <Switch
                            checked={apt.sampleCollectionRequired || false}
                            disabled
                          />

                          <Label className="text-xs">
                            Sample Collection
                          </Label>

                        </div>


                        <div className="flex items-center gap-2">

                          <Switch
                            checked={apt.homeVisitRequired || false}
                            disabled
                          />

                          <Label className="text-xs">
                            Home Visit
                          </Label>

                        </div>


                        <div>

                          <Input
                            placeholder="Instructions"
                            value={apt.instructions || ""}
                            readOnly
                            className="text-xs"
                          />

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              </CardContent>

            </Card>

          </TabsContent> */}
          <TabsContent value="manage">

            <Card>

              <CardHeader>

                <CardTitle className="font-heading">
                  Appointment Management
                </CardTitle>

              </CardHeader>

              <CardContent>

                {approvedApts.length === 0 ? (

                  <p className="text-center text-muted-foreground py-8">
                    No approved appointments.
                  </p>

                ) : (

                  <div className="space-y-5">

                    {approvedApts.map((apt) => (

                      <div
                        key={apt._id}
                        className="border rounded-2xl p-5 bg-card shadow-sm space-y-5"
                      >

                        {/* TOP SECTION */}

                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                          {/* Farmer Info */}

                          <div className="flex gap-4">

                            <img
                              src={
                                apt.user?.profilePicture ||
                                "https://ui-avatars.com/api/?name=Farmer"
                              }
                              alt="farmer"
                              className="h-16 w-16 rounded-full object-cover border"
                            />

                            <div className="space-y-1">

                              <div className="flex items-center gap-2 flex-wrap">

                                <h3 className="font-bold text-lg">
                                  {apt.user?.name}
                                </h3>

                                {apt.emergency && (
                                  <Badge variant="destructive">
                                    Emergency
                                  </Badge>
                                )}

                              </div>

                              <p className="text-sm text-muted-foreground">
                                {apt.nature}
                              </p>

                              <div className="flex items-center gap-2 text-sm text-muted-foreground">

                                <Phone className="h-4 w-4" />

                                <span>
                                  {apt.user?.contactNumber || "No Contact"}
                                </span>

                              </div>

                              <div className="flex items-center gap-2 text-sm text-muted-foreground">

                                <MapPinned className="h-4 w-4" />

                                <span>
                                  {apt.user?.village}, {apt.user?.city}
                                </span>

                              </div>

                            </div>

                          </div>


                          {/* Status */}

                          <div className="flex flex-col gap-2 items-start lg:items-end">

                            <Badge className="text-sm px-3 py-1">
                              {apt.status}
                            </Badge>

                            <Badge variant="outline">
                              {apt.visitStatus || "Pending Visit"}
                            </Badge>

                          </div>

                        </div>


                        {/* APPOINTMENT DETAILS */}

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                          {/* Appointment Date */}

                          <div className="border rounded-xl p-4 space-y-2">

                            <div className="flex items-center gap-2">

                              <CalendarDays className="h-4 w-4" />

                              <h4 className="font-medium text-sm">
                                Appointment Date
                              </h4>

                            </div>

                            <p className="text-sm font-semibold">
                              {new Date(
                                apt.appointmentDate
                              ).toLocaleDateString()}
                            </p>

                          </div>


                          {/* Appointment Slot */}

                          <div className="border rounded-xl p-4 space-y-2">

                            <div className="flex items-center gap-2">

                              <Clock className="h-4 w-4" />

                              <h4 className="font-medium text-sm">
                                Time Slot
                              </h4>

                            </div>

                            <p className="text-sm font-semibold">
                              {apt.appointmentSlot}
                            </p>

                          </div>


                          {/* Visit Type */}

                          <div className="border rounded-xl p-4 space-y-3">

                            <h4 className="font-medium text-sm">
                              Visit Type
                            </h4>

                            <div className="flex flex-wrap gap-2">

                              {apt.homeVisitRequired ? (
                                <Badge variant="secondary">
                                  Home Visit
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  Clinic Visit
                                </Badge>
                              )}

                              {apt.sampleCollectionRequired && (
                                <Badge variant="secondary">
                                  Sample Collection
                                </Badge>
                              )}

                            </div>

                          </div>


                          {/* Location */}

                          <div className="border rounded-xl p-4 space-y-2">

                            <div className="flex items-center gap-2">

                              <MapPinned className="h-4 w-4" />

                              <h4 className="font-medium text-sm">
                                Location
                              </h4>

                            </div>

                            <p className="text-sm font-semibold">
                              {apt.location}
                            </p>

                          </div>

                        </div>


                        {/* Symptoms */}

                        <div className="border rounded-xl p-4">

                          <h4 className="font-medium text-sm mb-2">
                            Symptoms / Case Description
                          </h4>

                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {apt.symptoms}
                          </p>

                        </div>


                        {/* Uploaded Images */}

                        {apt.animalImages?.length > 0 && (

                          <div className="space-y-3">

                            <div className="flex items-center gap-2">

                              <ImageIcon className="h-4 w-4" />

                              <h4 className="font-medium text-sm">
                                Animal Images
                              </h4>

                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                              {apt.animalImages.map(
                                (img: string, index: number) => (

                                  <a
                                    key={index}
                                    href={img}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >

                                    <img
                                      src={img}
                                      alt={`animal-${index}`}
                                      className="h-32 w-full rounded-xl object-cover border hover:scale-105 transition"
                                    />

                                  </a>

                                )
                              )}

                            </div>

                          </div>

                        )}


                        {/* Footer */}

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pt-2 border-t">

                          <div className="text-xs text-muted-foreground">

                            Appointment Created:
                            {" "}
                            {new Date(apt.createdAt).toLocaleString()}

                          </div>

                          <div className="text-xs text-muted-foreground">

                            Appointment ID:
                            {" "}
                            {apt._id}

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </CardContent>

            </Card>

          </TabsContent>

          {/* VISITS */}

          {/* <TabsContent value="visits">

            <Card>

              <CardHeader>
                <CardTitle className="font-heading">
                  Visit Tracking
                </CardTitle>
              </CardHeader>

              <CardContent>

                <div className="space-y-4">

                  {approvedApts.map((apt) => (

                    <div
                      key={apt._id}
                      className="p-4 border rounded-xl"
                    >

                      <div className="flex items-center justify-between mb-3">

                        <div>

                          <h4 className="font-heading font-bold text-sm">
                            {apt.user?.name}
                          </h4>

                          <p className="text-xs text-muted-foreground">
                            {apt.nature} · {apt.user?.village}, {apt.user?.city}
                          </p>

                          {apt.sampleCollectionRequired && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Sample Collection
                            </Badge>
                          )}

                        </div>

                        <Select
                          value={apt.visitStatus || "pending"}
                          onValueChange={(value) =>
                            handleUpdateVisit(apt._id, value)
                          }
                        >

                          <SelectTrigger className="w-[130px] text-xs">
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>

                            <SelectItem value="pending">
                              Pending
                            </SelectItem>

                            <SelectItem value="scheduled">
                              Scheduled
                            </SelectItem>

                            <SelectItem value="completed">
                              Completed
                            </SelectItem>

                          </SelectContent>

                        </Select>

                      </div>

                    </div>

                  ))}

                </div>

              </CardContent>

            </Card>

          </TabsContent> */}

          <TabsContent value="visits">

            <Card>

              <CardHeader>

                <CardTitle className="font-heading">
                  Visit Tracking
                </CardTitle>

              </CardHeader>

              <CardContent>

                {approvedApts.length === 0 ? (

                  <p className="text-center text-muted-foreground py-8">
                    No approved visits available.
                  </p>

                ) : (

                  <div className="space-y-5">

                    {approvedApts.map((apt) => (

                      <div
                        key={apt._id}
                        className="border rounded-2xl p-5 bg-card shadow-sm space-y-5"
                      >

                        {/* TOP SECTION */}

                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                          {/* Farmer Info */}

                          <div className="flex gap-4">

                            <img
                              src={
                                apt.user?.profilePicture ||
                                "https://ui-avatars.com/api/?name=Farmer"
                              }
                              alt="farmer"
                              className="h-16 w-16 rounded-full object-cover border"
                            />

                            <div className="space-y-1">

                              <div className="flex items-center gap-2 flex-wrap">

                                <h3 className="font-bold text-lg">
                                  {apt.user?.name}
                                </h3>

                                {apt.emergency && (
                                  <Badge variant="destructive">
                                    Emergency
                                  </Badge>
                                )}

                              </div>

                              <p className="text-sm text-muted-foreground">
                                {apt.nature}
                              </p>

                              <div className="flex items-center gap-2 text-sm text-muted-foreground">

                                <MapPinned className="h-4 w-4" />

                                <span>
                                  {apt.user?.village}, {apt.user?.city}
                                </span>

                              </div>

                            </div>

                          </div>


                          {/* Visit Status Dropdown */}

                          <div className="space-y-2">

                            <Label className="text-xs text-muted-foreground">
                              Visit Status
                            </Label>

                            <Select
                              value={apt.visitStatus || "pending"}
                              onValueChange={(value) =>
                                handleUpdateVisit(
                                  apt._id, 
                                  // value
                                    value as "pending" | "scheduled" | "completed"
                                )
                              }
                            >

                              <SelectTrigger className="w-[180px]">

                                <SelectValue />

                              </SelectTrigger>

                              <SelectContent>

                                <SelectItem value="pending">
                                  Pending
                                </SelectItem>

                                <SelectItem value="scheduled">
                                  Scheduled
                                </SelectItem>

                                <SelectItem value="completed">
                                  Completed
                                </SelectItem>

                              </SelectContent>

                            </Select>

                          </div>

                        </div>


                        {/* VISIT DETAILS */}

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                          {/* Date */}

                          <div className="border rounded-xl p-4 space-y-2">

                            <div className="flex items-center gap-2">

                              <CalendarDays className="h-4 w-4" />

                              <h4 className="font-medium text-sm">
                                Visit Date
                              </h4>

                            </div>

                            <p className="text-sm font-semibold">
                              {new Date(
                                apt.appointmentDate
                              ).toLocaleDateString()}
                            </p>

                          </div>


                          {/* Time */}

                          <div className="border rounded-xl p-4 space-y-2">

                            <div className="flex items-center gap-2">

                              <Clock className="h-4 w-4" />

                              <h4 className="font-medium text-sm">
                                Visit Time
                              </h4>

                            </div>

                            <p className="text-sm font-semibold">
                              {apt.appointmentSlot}
                            </p>

                          </div>


                          {/* Visit Type */}

                          <div className="border rounded-xl p-4 space-y-3">

                            <h4 className="font-medium text-sm">
                              Visit Type
                            </h4>

                            <div className="flex flex-wrap gap-2">

                              {apt.homeVisitRequired ? (
                                <Badge variant="secondary">
                                  Home Visit
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  Clinic Visit
                                </Badge>
                              )}

                              {apt.sampleCollectionRequired && (
                                <Badge variant="secondary">
                                  Sample Collection
                                </Badge>
                              )}

                            </div>

                          </div>


                          {/* Current Status */}

                          <div className="border rounded-xl p-4 space-y-2">

                            <h4 className="font-medium text-sm">
                              Current Status
                            </h4>

                            <Badge className="w-fit">
                              {apt.visitStatus || "pending"}
                            </Badge>

                          </div>

                        </div>


                        {/* Symptoms */}

                        <div className="border rounded-xl p-4">

                          <h4 className="font-medium text-sm mb-2">
                            Symptoms / Observations
                          </h4>

                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {apt.symptoms}
                          </p>

                        </div>


                        {/* Location */}

                        <div className="border rounded-xl p-4">

                          <div className="flex items-center gap-2 mb-2">

                            <MapPinned className="h-4 w-4" />

                            <h4 className="font-medium text-sm">
                              Visit Location
                            </h4>

                          </div>

                          <p className="text-sm text-muted-foreground">
                            {apt.location}
                          </p>

                        </div>


                        {/* Animal Images */}

                        {apt.animalImages?.length > 0 && (

                          <div className="space-y-3">

                            <div className="flex items-center gap-2">

                              <ImageIcon className="h-4 w-4" />

                              <h4 className="font-medium text-sm">
                                Animal Images
                              </h4>

                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                              {apt.animalImages.map(
                                (img: string, index: number) => (

                                  <a
                                    key={index}
                                    href={img}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >

                                    <img
                                      src={img}
                                      alt={`animal-${index}`}
                                      className="h-32 w-full rounded-xl object-cover border hover:scale-105 transition"
                                    />

                                  </a>

                                )
                              )}

                            </div>

                          </div>

                        )}


                        {/* Footer */}

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pt-2 border-t">

                          <div className="text-xs text-muted-foreground">

                            Appointment Created:
                            {" "}
                            {new Date(apt.createdAt).toLocaleString()}

                          </div>

                          <div className="text-xs text-muted-foreground">

                            Appointment ID:
                            {" "}
                            {apt._id}

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </CardContent>

            </Card>

          </TabsContent>

        </Tabs>

      </div>

    </div>
  );
};

export default DoctorDashboard;