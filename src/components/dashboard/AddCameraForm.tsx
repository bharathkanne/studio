'use client';

import type { Camera } from '@/lib/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

interface AddCameraFormProps {
  onAddCamera: (camera: Omit<Camera, 'id' | 'status' | 'userId'>) => void;
  existingCamera?: Camera | null; // For editing
  onClose: () => void;
}

export function AddCameraForm({ onAddCamera, existingCamera, onClose }: AddCameraFormProps) {
  const [name, setName] = useState(existingCamera?.name || '');
  const [rtspUrl, setRtspUrl] = useState(existingCamera?.rtspUrl || '');
  const [location, setLocation] = useState(existingCamera?.location || '');
  const [tags, setTags] = useState(existingCamera?.tags.join(', ') || '');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rtspUrl || !location) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const cameraData = {
      name,
      rtspUrl,
      location,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };
    
    onAddCamera(cameraData);
    toast({
      title: existingCamera ? 'Camera Updated' : 'Camera Added',
      description: `${name} has been successfully ${existingCamera ? 'updated' : 'added'}.`,
    });
    onClose(); // Close dialog/modal after submission
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="camera-name">Camera Name</Label>
        <Input
          id="camera-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Front Door Cam"
          required
        />
      </div>
      <div>
        <Label htmlFor="rtsp-url">RTSP URL</Label>
        <Input
          id="rtsp-url"
          value={rtspUrl}
          onChange={(e) => setRtspUrl(e.target.value)}
          placeholder="rtsp://yourstream.example.com/live"
          required
        />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Entrance Hall"
          required
        />
      </div>
      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Textarea
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., outdoor, HD, night-vision"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">
          <PlusCircle className="mr-2 h-4 w-4" /> {existingCamera ? 'Update Camera' : 'Add Camera'}
        </Button>
      </div>
    </form>
  );
}
