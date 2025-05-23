import type { Camera, Alert, User } from './types';

export const mockUsersList: User[] = [
  { id: 'admin-user-001', email: 'admin@example.com', name: 'Admin User', isAdmin: true },
  { id: 'user-001', email: 'charlie@example.com', name: 'Charlie Brown', isAdmin: false },
  { id: 'user-002', email: 'lucy@example.com', name: 'Lucy Van Pelt', isAdmin: false },
  { id: 'user-003', email: 'linus@example.com', name: 'Linus Van Pelt', isAdmin: false },
  { id: 'user-004', email: 'snoopy@example.com', name: 'Snoopy Dog', isAdmin: false },
];

export const mockCameras: Camera[] = [
  {
    id: 'cam-001',
    name: 'Front Door Cam',
    rtspUrl: 'rtsp://mockstream.example.com/frontdoor',
    location: 'Entrance',
    tags: ['outdoor', ' wichtigen', 'HD'],
    status: 'live',
    userId: 'admin-user-001', // Example linked to admin
  },
  {
    id: 'cam-002',
    name: 'Living Room Cam',
    rtspUrl: 'rtsp://mockstream.example.com/livingroom',
    location: 'Living Room',
    tags: ['indoor', 'pet-monitoring'],
    status: 'live',
    userId: 'user-001', // Example linked to charlie
  },
  {
    id: 'cam-003',
    name: 'Backyard Cam',
    rtspUrl: 'rtsp://mockstream.example.com/backyard',
    location: 'Backyard',
    tags: ['outdoor', 'night-vision'],
    status: 'offline',
    userId: 'admin-user-001',
  },
    {
    id: 'cam-004',
    name: 'Office Cam',
    rtspUrl: 'rtsp://mockstream.example.com/office',
    location: 'Office Main',
    tags: ['indoor', 'sensitive-area'],
    status: 'live',
    userId: 'user-002', // Example linked to lucy
  },
];

export const mockAlerts: Alert[] = [
  {
    id: 'alert-001',
    cameraId: 'cam-001',
    cameraName: 'Front Door Cam',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    type: 'distress',
    severity: 'HIGH',
    description: 'Loud shouting and sounds of struggle detected near the front door.',
    videoClipUrl: 'https://placehold.co/600x400.png',
    reason: 'AI detected distress signals (shouting) and rapid movements indicative of a struggle.',
    suggestedAction: 'Immediately review live feed. Contact authorities if necessary. Check on individuals involved.',
    isVerified: false,
  },
  {
    id: 'alert-002',
    cameraId: 'cam-002',
    cameraName: 'Living Room Cam',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    type: 'other',
    severity: 'LOW',
    description: 'Unusual movement pattern detected in the living room when no one is expected to be home.',
    videoClipUrl: 'https://placehold.co/600x400.png',
    reason: 'AI detected movement patterns inconsistent with typical household activity during unoccupied hours.',
    suggestedAction: 'Review video clip to identify the source of movement. Ensure property is secure.',
    isVerified: true,
    notes: "It was just the cat."
  },
  {
    id: 'alert-003',
    cameraId: 'cam-004',
    cameraName: 'Office Cam',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    type: 'physical_assault',
    severity: 'HIGH',
    description: 'Potential physical altercation detected in the main office area.',
    videoClipUrl: 'https://placehold.co/600x400.png',
    reason: 'AI detected pose estimations and action recognition consistent with physical assault (e.g., hitting, pushing).',
    suggestedAction: 'Urgently review footage. Notify security personnel and relevant authorities. Ensure safety of individuals.',
    isVerified: false,
  },
];
