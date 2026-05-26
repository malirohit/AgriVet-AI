import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL + "/api";

const mlUrl = import.meta.env.VITE_ML_API_URL;

const api = axios.create({
  baseURL: backendUrl,
});

const mlApi = axios.create({
  baseURL: mlUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Farmer Api's

// ✅ Detect Disease Using ML Model
export const detectDisease = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await mlApi.post("/predict", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

// ✅ Get AI Remedy Using Gemini
export const getAIRemedy = async (animalName: string, diseaseName: string) => {
  const res = await api.post("/user/ai-remedy", { animalName, diseaseName });

  return res.data.remedy;
};

// Chatbot Api
export const chatWithAi = async (message: string) => {
  const res = await api.post("/user/ai-chat", { message });
  return res.data.reply;
};

// ✅ Get Nearby Doctors
export const getNearbyDoctors = async () => {
  const res = await api.get("/user/doctors");
  return res.data.doctors;
};

// ✅ Book Appointment
export const bookAppointment = async (data: {
  doctor: string;

  animalImages?: File[];

  nature: string;
  symptoms: string;
  emergency: boolean;

  appointmentDate: string;
  appointmentSlot: string;

  location: string;

  sampleCollectionRequired?: boolean;
  homeVisitRequired?: boolean;
}) => {
  const formData = new FormData();

  formData.append("doctor", data.doctor);

  if (data.animalImages?.length) {
    data.animalImages.forEach((file) => {
      formData.append("animalImages", file);
    });
  }

  formData.append("nature", data.nature);
  formData.append("symptoms", data.symptoms);
  formData.append("emergency", String(data.emergency));

  formData.append("appointmentDate", data.appointmentDate);

  formData.append("appointmentSlot", data.appointmentSlot);

  formData.append("location", data.location);

  formData.append(
    "sampleCollectionRequired",
    String(data.sampleCollectionRequired),
  );

  formData.append("homeVisitRequired", String(data.homeVisitRequired));

  console.log("Form Data Entries( From api.ts ):");
  for (const pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
  }

  const res = await api.post("/user/book-appointment", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// ✅ Get My Appointments
export const getFarmerAppointments = async () => {
  const res = await api.get("/user/appointments");

  return res.data.appointments;
};

// ✅ Get Doctor Available Slots
export const getDoctorAvailableSlots = async (
  doctorId: string,
  date: string,
) => {
  const res = await api.get(`/user/doctor-slots/${doctorId}/${date}`);

  return res.data.slots;
};

// Doctor Api's

// ✅ Get Doctor Appointments
export const getDoctorAppointments = async () => {
  const res = await api.get("/doctor/appointments");

  console.log("Doctor Appointments:", res.data.appointments); // Debug log

  return res.data.appointments;
};

// ✅ Update Appointment Status
// export const updateAppointmentStatus = async(
//   apointmentId:string,
//   status:string)=>{

//   const res = await api.put(`/doctor/update-appointment/${apointmentId}`,{status});

//   return res.data;
// }

type AppointmentUpdateData = {

  status?: "Pending" | "Approved" | "Rejected" | "Scheduled" | "Completed";

  visitStatus?: "pending" | "scheduled" | "completed";

};

export const updateAppointmentStatus = async (
  appointmentId: string,
  data: AppointmentUpdateData,
) => {

  const res = await api.put(
    `/doctor/update-appointment/${appointmentId}`,
    data,
  );

  return res.data;
  
};
