// use server'

/**
 * @fileOverview Generates smart alerts for CCTV owners, summarizing incidents,
 * determining severity, and providing reasons for the alert based on AI detections.
 *
 * - generateSmartAlert - A function to generate smart alerts.
 * - GenerateSmartAlertInput - The input type for the generateSmartAlert function.
 * - GenerateSmartAlertOutput - The return type for the generateSmartAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSmartAlertInputSchema = z.object({
  incidentSummary: z
    .string()
    .describe('A summary of the incident detected by AI.'),
  aiDetections: z
    .string()
    .describe(
      'A list of AI detections that triggered the alert, such as physical assault, nudity, distress, or non-consensual interactions.'
    ),
  cameraName: z.string().describe('The name of the CCTV camera.'),
  location: z.string().describe('The location of the CCTV camera.'),
  timestamp: z.string().describe('The timestamp of the incident.'),
});
export type GenerateSmartAlertInput = z.infer<typeof GenerateSmartAlertInputSchema>;

const GenerateSmartAlertOutputSchema = z.object({
  alertSummary: z
    .string()
    .describe('A detailed summary of the incident for the CCTV owner.'),
  severityLevel: z
    .enum(['LOW', 'MEDIUM', 'HIGH'])
    .describe('The severity level of the incident.'),
  reason: z
    .string()
    .describe('The specific reason the alert was triggered based on AI detections.'),
  suggestedAction: z
    .string()
    .describe('Suggested actions for the CCTV owner to take.'),
});
export type GenerateSmartAlertOutput = z.infer<typeof GenerateSmartAlertOutputSchema>;

export async function generateSmartAlert(
  input: GenerateSmartAlertInput
): Promise<GenerateSmartAlertOutput> {
  return generateSmartAlertFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSmartAlertPrompt',
  input: {schema: GenerateSmartAlertInputSchema},
  output: {schema: GenerateSmartAlertOutputSchema},
  prompt: `You are an AI assistant designed to generate smart alerts for CCTV owners.

  Based on the incident summary, AI detections, camera name, location, and timestamp, create a detailed alert summary, determine the severity level (LOW, MEDIUM, HIGH), provide a specific reason for the alert, and suggest actions for the CCTV owner to take.

  Incident Summary: {{{incidentSummary}}}
  AI Detections: {{{aiDetections}}}
  Camera Name: {{{cameraName}}}
  Location: {{{location}}}
  Timestamp: {{{timestamp}}}

  Alert Summary: A detailed summary of the incident.
  Severity Level: The severity level of the incident (LOW, MEDIUM, HIGH).
  Reason: The specific reason the alert was triggered based on the AI detections.
  Suggested Action: Suggested actions for the CCTV owner to take.

  Format your response as a JSON object matching the following schema:
  {
    "alertSummary": "string",
    "severityLevel": "LOW" | "MEDIUM" | "HIGH",
    "reason": "string",
    "suggestedAction": "string"
  }`,
});

const generateSmartAlertFlow = ai.defineFlow(
  {
    name: 'generateSmartAlertFlow',
    inputSchema: GenerateSmartAlertInputSchema,
    outputSchema: GenerateSmartAlertOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
