'use client';

import type { Camera } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video, Wifi, WifiOff, Edit3, Trash2, AlertTriangle, PlayCircle } from 'lucide-react';
import Image from 'next/image';

interface CameraCardProps {
  camera: Camera;
  onEdit: (camera: Camera) => void;
  onDelete: (camera: Camera) => void;
  onSimulateIncident: (camera: Camera) => void;
  onViewLive: (camera: Camera) => void;
}

export function CameraCard({ camera, onEdit, onDelete, onSimulateIncident, onViewLive }: CameraCardProps) {
  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Video className="text-primary" />
            {camera.name}
          </CardTitle>
          <Badge variant={camera.status === 'live' ? 'default' : 'destructive'} className="capitalize">
            {camera.status === 'live' ? <Wifi className="mr-1 h-3 w-3" /> : <WifiOff className="mr-1 h-3 w-3" />}
            {camera.status}
          </Badge>
        </div>
        <CardDescription>{camera.location}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="aspect-video bg-muted rounded-md overflow-hidden mb-3">
          <Image 
            src={`https://placehold.co/640x360.png?text=${encodeURIComponent(camera.name)}`} 
            alt={`Live feed of ${camera.name}`} 
            width={640} 
            height={360}
            className="object-cover w-full h-full"
            data-ai-hint="security camera"
          />
        </div>
        <div className="space-y-1 text-sm">
          <p><span className="font-medium">RTSP URL:</span> <span className="text-muted-foreground break-all">{camera.rtspUrl}</span></p>
          {camera.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {camera.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 pt-4 border-t">
        <Button variant="outline" size="sm" onClick={() => onEdit(camera)}><Edit3 className="mr-2 h-4 w-4" /> Edit</Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(camera)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
        <Button variant="secondary" size="sm" onClick={() => onViewLive(camera)}><PlayCircle className="mr-2 h-4 w-4" /> View Live</Button>
        <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700" size="sm" onClick={() => onSimulateIncident(camera)}>
          <AlertTriangle className="mr-2 h-4 w-4" /> Simulate
        </Button>
      </CardFooter>
    </Card>
  );
}
