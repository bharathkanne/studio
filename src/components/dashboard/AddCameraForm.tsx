
'use client';

import type { Camera } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit3 } from 'lucide-react';

interface AddCameraFormProps {
  onSubmitCamera: (cameraData: Omit<Camera, 'id' | 'status' | 'userId'>, existingId?: string) => void;
  existingCamera?: Camera | null; // For editing
  onClose: () => void;
}

export function AddCameraForm({ onSubmitCamera, existingCamera, onClose }: AddCameraFormProps) {
  const [name, setName] = useState('');
  const [rtspUrl, setRtspUrl] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const { toast } = useToast();

  const isEditing = !!existingCamera;

  useEffect(() => {
    if (existingCamera) {
      setName(existingCamera.name);
      setRtspUrl(existingCamera.rtspUrl);
      setLocation(existingCamera.location);
      setTags(existingCamera.tags.join(', '));
    } else {
      // Reset for add mode
      setName('');
      setRtspUrl('');
      setLocation('');
      setTags('');
    }
  }, [existingCamera]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rtspUrl || !location) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in Camera Name, RTSP URL, and Location.',
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
    
    onSubmitCamera(cameraData, existingCamera?.id);
    // Toast is handled by parent for add/update distinction
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
          {isEditing ? <Edit3 className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
          {isEditing ? 'Update Camera' : 'Add Camera'}
        </Button>
      </div>
    </form>
  );
}
