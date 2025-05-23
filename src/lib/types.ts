export interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin?: boolean; // Added for role management
}

export interface Camera {
  id: string;
  name: string;
  rtspUrl: string;
  location: string;
  tags: string[];
  status: 'live' | 'offline';
  userId: string;
}

export interface Alert {
  id: string;
  cameraId: string;
  cameraName: string;
  timestamp: string; 
  type: 'physical_assault' | 'nudity' | 'distress' | 'non_consensual' | 'other';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  videoClipUrl?: string; // Mock URL to a 10s clip
  description: string;
  notes?: string;
  isVerified?: boolean;
  verifiedBy?: string; // userId
  reason?: string; // From AI
  suggestedAction?: string; // From AI
}
