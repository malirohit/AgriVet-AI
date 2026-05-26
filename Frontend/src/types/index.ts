export type UserRole = 'farmer' | 'doctor';

export interface User {
  id: string;
  profilePicture?:string,
  name: string;
  email: string;
  role: UserRole;
  city?: string;
  specialization?: string;
  availability?: string;
  avatar?: string;
}

export interface Appointment {
  id: string;
  userId: string;
  userName: string;
  doctorId: string;
  doctorName: string;
  nature: string;
  symptoms: string;
  emergency: boolean;
  preferredDate: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  scheduledDate?: string;
  sampleCollection?: boolean;
  homeVisit?: boolean;
  instructions?: string;
  visitStatus?: 'pending' | 'scheduled' | 'completed';
}

export interface Query {
  id: string;
  appointmentId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
}

export interface DiseaseResult {
  disease: string;
  severity: string;
  confidence: number;
  imageUrl?: string;
}

export interface AiRemedy {
  firstAid: string[];
  precautions: string[];
  vetConsultation: string;
}
