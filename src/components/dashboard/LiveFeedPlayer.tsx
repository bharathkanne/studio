
'use client';

import type { Camera } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Maximize } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';

interface LiveFeedPlayerProps {
  camera: Camera;
  onMaximize?: (camera: Camera) => void; // Added onMaximize prop
}

export function LiveFeedPlayer({ camera, onMaximize }: LiveFeedPlayerProps) {
  const handleMaximizeClick = () => {
    if (onMaximize) {
      onMaximize(camera);
    }
  };

  return (
    <Card className="overflow-hidden shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 border-b">
        <CardTitle className="text-base font-medium">{camera.name}</CardTitle>
        <Badge variant={camera.status === 'live' ? 'default' : 'destructive'} className="text-xs px-1.5 py-0.5">
          {camera.status === 'live' ? <Wifi className="mr-1 h-3 w-3" /> : <WifiOff className="mr-1 h-3 w-3" />}
          {camera.status}
        </Badge>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div className="aspect-video bg-black">
          {camera.status === 'live' ? (
            <Image
              src={`https://placehold.co/640x360.png?text=${encodeURIComponent(camera.name)}`}
              alt={`Live feed of ${camera.name}`}
              width={640}
              height={360}
              className="object-cover w-full h-full"
              data-ai-hint="security camera"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted">
              <WifiOff size={48} className="mb-2"/>
              <p className="text-sm font-medium">Stream Offline</p>
              <p className="text-xs">{camera.name}</p>
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 h-7 w-7 bg-black/30 hover:bg-black/50 text-white"
          onClick={handleMaximizeClick} // Call handleMaximizeClick
          aria-label={`Maximize live feed for ${camera.name}`}
        >
          <Maximize size={16} />
        </Button>
      </CardContent>
    </Card>
  );
}
