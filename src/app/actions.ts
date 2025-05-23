'use server';
import { generateSmartAlert, type GenerateSmartAlertInput, type GenerateSmartAlertOutput } from '@/ai/flows/generate-smart-alert';
import type { Alert, Camera } from '@/lib/types';
import { z } from 'zod';

const CreateSmartAlertActionInputSchema = z.object({
  camera: z.object({
    id: z.string(),
    name: z.string(),
    location: z.string(),
  }),
  incidentDetails: z.object({
    summary: z.string(),
    detections: z.string(), // e.g. "Physical assault, distress vocalizations"
    type: z.enum(['physical_assault', 'nudity', 'distress', 'non_consensual', 'other']),
  }),
});

export type CreateSmartAlertActionInput = z.infer<typeof CreateSmartAlertActionInputSchema>;

export async function createSmartAlertAction(input: CreateSmartAlertActionInput): Promise<Alert> {
  try {
    const aiInput: GenerateSmartAlertInput = {
      incidentSummary: input.incidentDetails.summary,
      aiDetections: input.incidentDetails.detections,
      cameraName: input.camera.name,
      location: input.camera.location,
      timestamp: new Date().toISOString(),
    };

    const aiResult = await generateSmartAlert(aiInput);

    const newAlert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      cameraId: input.camera.id,
      cameraName: input.camera.name,
      timestamp: aiInput.timestamp,
      type: input.incidentDetails.type, // Or derive from aiResult if possible
      severity: aiResult.severityLevel,
      description: aiResult.alertSummary,
      videoClipUrl: 'https://placehold.co/600x400.png', // Mock clip
      reason: aiResult.reason,
      suggestedAction: aiResult.suggestedAction,
      isVerified: false,
    };
    
    return newAlert;
  } catch (error) {
    console.error('Error in createSmartAlertAction:', error);
    // Consider a more user-friendly error or specific error type
    throw new Error('Failed to generate smart alert.');
  }
}
