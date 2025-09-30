export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  language: 'nl' | 'en';
}

export interface Activity {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: Date;
  time?: string;
  location?: string;
  status: 'draft' | 'future' | 'past';
  weatherAssessment?: WeatherAssessment;
  backupPlan?: string;
  invitees: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WeatherAssessment {
  recommendation: 'good' | 'bad';
  confidence: number;
  reasoning: string;
  dataSource: 'forecast' | 'historic';
  temperature?: number;
  precipitation?: number;
  windSpeed?: number;
}

export interface Invitation {
  id: string;
  activityId: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  sentAt: Date;
}