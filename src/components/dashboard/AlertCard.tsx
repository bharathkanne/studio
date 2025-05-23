'use client';

import type { Alert } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Video, CheckCircle, XCircle, Edit, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface AlertCardProps {
  alert: Alert;
  onViewEvidence: (alert: Alert) => void;
  onVerify: (alert: Alert, isTruePositive: boolean, notes?: string) => void;
}

export function AlertCard({ alert, onViewEvidence, onVerify }: AlertCardProps) {
  const severityColors = {
    LOW: 'bg-green-500 hover:bg-green-600',
    MEDIUM: 'bg-yellow-500 hover:bg-yellow-600',
    HIGH: 'bg-red-500 hover:bg-red-600',
  };
  const severityTextColors = {
    LOW: 'text-green-700 dark:text-green-300',
    MEDIUM: 'text-yellow-700 dark:text-yellow-300',
    HIGH: 'text-red-700 dark:text-red-300',
  }
  const severityBorderColors = {
    LOW: 'border-green-500',
    MEDIUM: 'border-yellow-500',
    HIGH: 'border-red-500',
  }

  return (
    <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 ${severityBorderColors[alert.severity]}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <AlertTriangle className={`${severityTextColors[alert.severity]}`} />
            {alert.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Alert
          </CardTitle>
          <Badge className={`${severityColors[alert.severity]} text-white`}>{alert.severity}</Badge>
        </div>
        <CardDescription>
          {alert.cameraName} - {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground mb-3">{alert.description}</p>
        {alert.videoClipUrl && (
           <div className="aspect-video bg-muted rounded-md overflow-hidden mb-3">
            <Image 
              src={alert.videoClipUrl} 
              alt={`Evidence clip for alert ${alert.id}`} 
              width={640} 
              height={360}
              className="object-cover w-full h-full"
              data-ai-hint="alert evidence"
            />
          </div>
        )}
        {alert.reason && <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">AI Reason:</span> {alert.reason}</p>}
        {alert.suggestedAction && <p className="text-xs text-muted-foreground"><span className="font-medium">Suggested Action:</span> {alert.suggestedAction}</p>}
        
        {alert.isVerified !== undefined && (
          <div className={`mt-3 p-2 rounded-md text-sm flex items-center gap-2 ${alert.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {alert.isVerified ? <CheckCircle size={16} /> : <XCircle size={16} />}
            <span>{alert.isVerified ? 'Verified as True Positive' : 'Verified as False Positive'}</span>
          </div>
        )}
        {alert.notes && <p className="text-xs text-muted-foreground mt-1 italic">Notes: {alert.notes}</p>}

      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" size="sm" onClick={() => onViewEvidence(alert)}>
          <Video className="mr-2 h-4 w-4" /> View Evidence
        </Button>
        {alert.isVerified === undefined && (
          <>
            <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-100 hover:text-green-700" onClick={() => onVerify(alert, true, prompt("Add notes for true positive (optional):") || undefined)}>
              <CheckCircle className="mr-2 h-4 w-4" /> True
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-100 hover:text-red-700" onClick={() => onVerify(alert, false, prompt("Add notes for false positive (optional):") || undefined)}>
              <XCircle className="mr-2 h-4 w-4" /> False
            </Button>
          </>
        )}
        {alert.isVerified !== undefined && (
           <Button variant="ghost" size="sm" onClick={() => onVerify(alert, !alert.isVerified, prompt("Update verification notes (optional):") || alert.notes || undefined)}>
             <Edit className="mr-2 h-4 w-4" /> Edit Verification
           </Button>
        )}
      </CardFooter>
    </Card>
  );
}
