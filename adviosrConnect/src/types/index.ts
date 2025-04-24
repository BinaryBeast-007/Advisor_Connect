export interface Advisor {
  id: string;
  name: string;
  type: 'analyst' | 'distributor';
  yearsOfExperience: number;
  sebiNumber?: string;
  arnNumber?: string;
  languages: string[];
  imageUrl: string;
  rating: number;
  reviewCount: number;
  about: string;
  longBio: string;
  verifications: ('SEBI' | 'MFD' | 'KYC')[];
}

export interface ServicePackage {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  features: string[];
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface Review {
  id: string;
  advisorId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}