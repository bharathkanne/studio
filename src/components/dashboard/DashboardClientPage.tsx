'use client';

import { useState, useEffect }
from 'react';
import type { Camera, Alert } from '@/lib/types';
import { mockCameras, mockAlerts } from '@/lib/mockData';
import { CameraCard } from './CameraCard';
import { AlertCard } from './AlertCard';
import { LiveFeedPlayer } from './LiveFeedPlayer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddCameraForm } from './AddCameraForm';
import { AlertFilters } from './AlertFilters';
import { useToast } from '@/hooks/use-toast';
import { createSmartAlertAction, type CreateSmartAlertActionInput } from '@/app/actions';
import { PlusCircle, Video, AlertTriangle, LayoutGrid, List } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';

export default function DashboardClientPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [isAddCameraDialogOpen, setIsAddCameraDialogOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [selectedLiveViewCamera, setSelectedLiveViewCamera] = useState<Camera | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { toast } = useToast();

  useEffect(() => {
    // Load initial mock data
    setCameras(mockCameras);
    setAlerts(mockAlerts);
    setFilteredAlerts(mockAlerts); // Initially, show all alerts
  }, []);

  const handleAddOrUpdateCamera = (cameraData: Omit<Camera, 'id' | 'status' | 'userId'>) => {
    if (editingCamera) {
      setCameras(cameras.map(c => c.id === editingCamera.id ? { ...editingCamera, ...cameraData } : c));
      toast({ title: "Camera Updated", description: `${cameraData.name} details have been updated.` });
    } else {
      const newCamera: Camera = {
        ...cameraData,
        id: `cam-${Date.now()}`,
        status: 'live', // Default new cameras to live
        userId: 'mock-user-1', // Assuming a logged-in user
      };
      setCameras([...cameras, newCamera]);
      toast({ title: "Camera Added", description: `${newCamera.name} has been successfully added.` });
    }
    setEditingCamera(null);
    setIsAddCameraDialogOpen(false);
  };

  const handleEditCamera = (camera: Camera) => {
    setEditingCamera(camera);
    setIsAddCameraDialogOpen(true);
  };

  const handleDeleteCamera = (cameraToDelete: Camera) => {
    if (window.confirm(`Are you sure you want to delete ${cameraToDelete.name}?`)) {
      setCameras(cameras.filter(camera => camera.id !== cameraToDelete.id));
      // Also remove related alerts or reassign them if necessary
      const updatedAlerts = alerts.filter(alert => alert.cameraId !== cameraToDelete.id);
      setAlerts(updatedAlerts);
      setFilteredAlerts(updatedAlerts);
      toast({ title: "Camera Deleted", description: `${cameraToDelete.name} has been removed.`, variant: "destructive" });
    }
  };

  const handleSimulateIncident = async (camera: Camera) => {
    toast({ title: "Simulating Incident...", description: `Generating AI alert for ${camera.name}.` });
    try {
      // More realistic incident types
      const incidentTypes: CreateSmartAlertActionInput['incidentDetails']['type'][] = ['physical_assault', 'distress', 'non_consensual'];
      const randomIncidentType = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
      
      const input: CreateSmartAlertActionInput = {
        camera: { id: camera.id, name: camera.name, location: camera.location },
        incidentDetails: {
          summary: `Simulated ${randomIncidentType.replace('_', ' ')} event at ${camera.name}.`,
          detections: `AI detected signs consistent with ${randomIncidentType.replace('_', ' ')}.`,
          type: randomIncidentType,
        },
      };
      const newAlert = await createSmartAlertAction(input);
      setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
      setFilteredAlerts(prevAlerts => [newAlert, ...prevAlerts]); // Add to filtered list too, or re-filter
      toast({ title: "AI Alert Generated", description: `New ${newAlert.severity} alert for ${camera.name}.`, variant: newAlert.severity === 'HIGH' ? 'destructive' : 'default' });
    } catch (error) {
      toast({ title: "Simulation Failed", description: "Could not generate AI alert.", variant: "destructive" });
      console.error("Simulation error:", error);
    }
  };

  const handleFilterAlerts = (filters: { cameraId?: string; type?: string; date?: Date, severity?: string }) => {
    let tempAlerts = alerts;
    if (filters.cameraId) {
      tempAlerts = tempAlerts.filter(alert => alert.cameraId === filters.cameraId);
    }
    if (filters.type) {
      tempAlerts = tempAlerts.filter(alert => alert.type === filters.type);
    }
    if (filters.severity) {
      tempAlerts = tempAlerts.filter(alert => alert.severity === filters.severity);
    }
    if (filters.date) {
      tempAlerts = tempAlerts.filter(alert => {
        const alertDate = new Date(alert.timestamp);
        return alertDate.toDateString() === filters.date?.toDateString();
      });
    }
    setFilteredAlerts(tempAlerts);
  };
  
  const handleClearAlertFilters = () => {
    setFilteredAlerts(alerts);
  }

  const handleVerifyAlert = (alertToVerify: Alert, isTruePositive: boolean, notes?: string) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === alertToVerify.id ? { ...alert, isVerified: isTruePositive, notes } : alert
    );
    setAlerts(updatedAlerts);
    setFilteredAlerts(updatedAlerts); // Update filtered list to reflect verification
    toast({
      title: "Alert Verified",
      description: `Alert for ${alertToVerify.cameraName} marked as ${isTruePositive ? 'True Positive' : 'False Positive'}.`
    });
  };

  const handleViewEvidence = (alert: Alert) => {
    // For now, just log. In a real app, this would open a modal with video playback.
    console.log("Viewing evidence for alert:", alert);
    toast({ title: "View Evidence", description: `Displaying evidence for alert from ${alert.cameraName}. (Mock)` });
  };
  
  const handleViewLive = (camera: Camera) => {
    setSelectedLiveViewCamera(camera);
  };


  return (
    <div className="space-y-8">
      <Dialog open={isAddCameraDialogOpen} onOpenChange={(isOpen) => {
        setIsAddCameraDialogOpen(isOpen);
        if (!isOpen) setEditingCamera(null); // Reset editing state when dialog closes
      }}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCamera ? 'Edit Camera' : 'Add New Camera'}</DialogTitle>
          </DialogHeader>
          <AddCameraForm 
            onAddCamera={handleAddOrUpdateCamera} 
            existingCamera={editingCamera}
            onClose={() => {
              setIsAddCameraDialogOpen(false);
              setEditingCamera(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedLiveViewCamera} onOpenChange={(isOpen) => { if(!isOpen) setSelectedLiveViewCamera(null);}}>
        <DialogContent className="max-w-3xl p-0">
          {selectedLiveViewCamera && (
            <>
            <DialogHeader className="p-4 border-b">
              <DialogTitle>Live View: {selectedLiveViewCamera.name}</DialogTitle>
            </DialogHeader>
            <div className="p-4">
               <Image
                src={`https://placehold.co/1280x720.png?text=${encodeURIComponent(selectedLiveViewCamera.name)} Live Feed`}
                alt={`Live feed of ${selectedLiveViewCamera.name}`}
                width={1280}
                height={720}
                className="object-contain w-full h-auto rounded-md"
                data-ai-hint="live security feed"
              />
            </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex mb-6">
          <TabsTrigger value="dashboard">Overview</TabsTrigger>
          <TabsTrigger value="cameras">Manage Cameras</TabsTrigger>
          <TabsTrigger value="alerts">Alert Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <section id="live-feeds">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2"><Video /> Live Feeds</h2>
            </div>
            {cameras.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cameras.filter(cam => cam.status === 'live').slice(0,3).map(camera => ( // Show up to 3 live cameras on overview
                  <LiveFeedPlayer key={camera.id} camera={camera} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No cameras added yet. Add a camera to see live feeds.</p>
            )}
             {cameras.filter(cam => cam.status === 'live').length > 3 && (
                <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => {
                        const camerasTab = document.querySelector('button[data-state="inactive"][role="tab"][value="cameras"]') as HTMLButtonElement | null;
                        camerasTab?.click();
                    }}>View All Live Feeds</Button>
                </div>
            )}
          </section>

          <section id="recent-alerts" className="mt-8">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2"><AlertTriangle /> Recent Alerts</h2>
             </div>
             {alerts.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredAlerts.slice(0,4).map(alert => ( // Show up to 4 recent alerts
                    <AlertCard key={alert.id} alert={alert} onViewEvidence={handleViewEvidence} onVerify={handleVerifyAlert} />
                ))}
                </div>
             ) : (
                <p className="text-muted-foreground">No alerts to display.</p>
             )}
             {filteredAlerts.length > 4 && (
                <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => {
                        const alertsTab = document.querySelector('button[data-state="inactive"][role="tab"][value="alerts"]') as HTMLButtonElement | null;
                        alertsTab?.click();
                    }}>View All Alerts</Button>
                </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="cameras">
          <section id="manage-cameras">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Manage Cameras ({cameras.length})</h2>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingCamera(null); setIsAddCameraDialogOpen(true); }}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Camera
                </Button>
              </DialogTrigger>
            </div>
            {cameras.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cameras.map(camera => (
                  <CameraCard
                    key={camera.id}
                    camera={camera}
                    onEdit={handleEditCamera}
                    onDelete={handleDeleteCamera}
                    onSimulateIncident={handleSimulateIncident}
                    onViewLive={handleViewLive}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                <Video size={48} className="mx-auto text-muted-foreground mb-2" />
                <h3 className="text-xl font-medium text-muted-foreground">No Cameras Added</h3>
                <p className="text-sm text-muted-foreground mb-4">Get started by adding your first CCTV camera.</p>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingCamera(null); setIsAddCameraDialogOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Camera
                  </Button>
                </DialogTrigger>
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="alerts">
          <section id="alert-feed">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Alert Feed ({filteredAlerts.length} of {alerts.length})</h2>
              <div className="flex items-center gap-2">
                  <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                      <LayoutGrid />
                  </Button>
                  <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                      <List />
                  </Button>
              </div>
            </div>
            <AlertFilters cameras={cameras} onFilterChange={handleFilterAlerts} onClearFilters={handleClearAlertFilters}/>
            {filteredAlerts.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                {filteredAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} onViewEvidence={handleViewEvidence} onVerify={handleVerifyAlert} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                <AlertTriangle size={48} className="mx-auto text-muted-foreground mb-2" />
                <h3 className="text-xl font-medium text-muted-foreground">No Alerts Found</h3>
                <p className="text-sm text-muted-foreground">There are no alerts matching your current filters, or no alerts have been generated yet.</p>
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
