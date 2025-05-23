
'use client';

import { useState, useEffect } from 'react';
import type { Camera, Alert } from '@/lib/types';
import { mockCameras, mockAlerts } from '@/lib/mockData';
import { CameraCard } from './CameraCard';
import { AlertCard } from './AlertCard';
import { LiveFeedPlayer } from './LiveFeedPlayer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AddCameraForm } from './AddCameraForm';
import { AlertFilters } from './AlertFilters';
import { useToast } from '@/hooks/use-toast';
import { createSmartAlertAction, type CreateSmartAlertActionInput } from '@/app/actions';
import { PlusCircle, Video, AlertTriangle, LayoutGrid, List, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';


export default function DashboardClientPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [isAddCameraDialogOpen, setIsAddCameraDialogOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [selectedLiveViewCamera, setSelectedLiveViewCamera] = useState<Camera | null>(null);
  const [selectedAlertForEvidence, setSelectedAlertForEvidence] = useState<Alert | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { toast } = useToast();

  useEffect(() => {
    setCameras(mockCameras);
    const sortedAlerts = [...mockAlerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setAlerts(sortedAlerts);
    setFilteredAlerts(sortedAlerts);
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (tab === 'dashboard' || tab === 'cameras' || tab === 'alerts')) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/dashboard?tab=${value}`, { scroll: false });
  };

  const handleAddOrUpdateCamera = (cameraData: Omit<Camera, 'id' | 'status' | 'userId'>, existingId?: string) => {
    if (existingId) {
      // Editing existing camera
      setCameras(cameras.map(c => c.id === existingId ? { ...c, ...cameraData } : c));
      toast({ title: "Camera Updated", description: `${cameraData.name} details have been updated.` });
    } else {
      // Adding new camera
      const newCamera: Camera = {
        ...cameraData,
        id: `cam-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
        status: 'live', 
        userId: 'mock-user-1', 
      };
      setCameras(prevCameras => [...prevCameras, newCamera].sort((a,b) => a.name.localeCompare(b.name)));
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
    if (window.confirm(`Are you sure you want to delete ${cameraToDelete.name}? This will also delete associated alerts.`)) {
      setCameras(cameras.filter(camera => camera.id !== cameraToDelete.id));
      
      const updatedAlerts = alerts.filter(alert => alert.cameraId !== cameraToDelete.id)
                                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setAlerts(updatedAlerts);
      
      // Also update filteredAlerts based on the new alerts list
      // This simple approach re-filters based on the current filter state if filters were active,
      // or just sets to updatedAlerts if no specific filters active. For now, we re-filter.
      // A more robust way would be to store current filter params and re-apply them.
      const currentFilters = { // This is a simplification, ideally you'd store current filter state
          cameraId: searchParams.get('cameraId'),
          type: searchParams.get('type'),
          severity: searchParams.get('severity'),
          date: searchParams.get('date') ? new Date(searchParams.get('date')!) : undefined,
      };
      handleFilterAlerts(currentFilters, updatedAlerts); // Pass the new alerts list to filter upon

      toast({ title: "Camera Deleted", description: `${cameraToDelete.name} and its alerts have been removed.`, variant: "destructive" });
    }
  };

  const handleSimulateIncident = async (camera: Camera) => {
    toast({ title: "Simulating Incident...", description: `Generating AI alert for ${camera.name}.` });
    try {
      const incidentTypes: CreateSmartAlertActionInput['incidentDetails']['type'][] = ['physical_assault', 'distress', 'non_consensual', 'nudity', 'other'];
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
      const updatedAlerts = [newAlert, ...alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setAlerts(updatedAlerts);
      
      // Re-apply filters to potentially include the new alert
      // This simplification refilters the updatedAlerts list based on current searchParams
      const currentFilters = {
          cameraId: searchParams.get('cameraId') || undefined,
          type: searchParams.get('type') || undefined,
          severity: searchParams.get('severity') || undefined,
          date: searchParams.get('date') ? new Date(searchParams.get('date')!) : undefined,
      };
      handleFilterAlerts(currentFilters, updatedAlerts);

      toast({ title: "AI Alert Generated", description: `New ${newAlert.severity} alert for ${camera.name}.`, variant: newAlert.severity === 'HIGH' ? 'destructive' : 'default' });
    } catch (error) {
      toast({ title: "Simulation Failed", description: "Could not generate AI alert.", variant: "destructive" });
      console.error("Simulation error:", error);
    }
  };

  const handleFilterAlerts = (filters: { cameraId?: string; type?: string; date?: Date, severity?: string }, sourceAlerts: Alert[] = alerts) => {
    let tempAlerts = [...sourceAlerts]; // Use a copy of sourceAlerts
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
    setFilteredAlerts(tempAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };
  
  const handleClearAlertFilters = () => {
    setFilteredAlerts([...alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    // Optionally clear filter inputs in AlertFilters component if it holds its own state for inputs
  }

  const handleVerifyAlert = (alertToVerify: Alert, isTruePositive: boolean, notes?: string) => {
    const updateAlertList = (list: Alert[]) => 
      list.map(alert =>
        alert.id === alertToVerify.id ? { ...alert, isVerified: isTruePositive, notes } : alert
      ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setAlerts(prevAlerts => updateAlertList(prevAlerts));
    setFilteredAlerts(prevFilteredAlerts => updateAlertList(prevFilteredAlerts));
    
    toast({
      title: "Alert Verified",
      description: `Alert for ${alertToVerify.cameraName} marked as ${isTruePositive ? 'True Positive' : 'False Positive'}.`
    });
  };

  const handleViewEvidence = (alert: Alert) => {
    setSelectedAlertForEvidence(alert);
  };
  
  const handleViewLive = (camera: Camera) => {
    setSelectedLiveViewCamera(camera);
  };


  return (
    <div className="space-y-8">
      <Dialog open={isAddCameraDialogOpen} onOpenChange={(isOpen) => {
        setIsAddCameraDialogOpen(isOpen);
        if (!isOpen) setEditingCamera(null); 
      }}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCamera ? 'Edit Camera' : 'Add New Camera'}</DialogTitle>
          </DialogHeader>
          <AddCameraForm 
            onSubmitCamera={handleAddOrUpdateCamera} 
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

      <Dialog open={!!selectedAlertForEvidence} onOpenChange={(isOpen) => { if(!isOpen) setSelectedAlertForEvidence(null);}}>
        <DialogContent className="max-w-2xl">
            {selectedAlertForEvidence && (
                <>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                           <AlertTriangle className={
                               selectedAlertForEvidence.severity === 'HIGH' ? 'text-red-500' : 
                               selectedAlertForEvidence.severity === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'
                           } />
                           Evidence for Alert: {selectedAlertForEvidence.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </DialogTitle>
                        <DialogDescription>
                            Camera: {selectedAlertForEvidence.cameraName} | Location: {cameras.find(c=>c.id === selectedAlertForEvidence.cameraId)?.location || 'N/A'} <br/>
                            Time: {format(new Date(selectedAlertForEvidence.timestamp), "PPP p")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {selectedAlertForEvidence.videoClipUrl && (
                            <div className="aspect-video bg-muted rounded-md overflow-hidden">
                                <Image 
                                    src={selectedAlertForEvidence.videoClipUrl} 
                                    alt={`Evidence clip for alert ${selectedAlertForEvidence.id}`} 
                                    width={640} 
                                    height={360}
                                    className="object-cover w-full h-full"
                                    data-ai-hint="alert evidence"
                                />
                            </div>
                        )}
                        <div>
                            <h4 className="font-semibold text-sm">Alert Details:</h4>
                            <p className="text-sm text-muted-foreground">{selectedAlertForEvidence.description}</p>
                        </div>
                        {selectedAlertForEvidence.reason && (
                             <div>
                                <h4 className="font-semibold text-sm">AI Reason:</h4>
                                <p className="text-sm text-muted-foreground">{selectedAlertForEvidence.reason}</p>
                            </div>
                        )}
                        {selectedAlertForEvidence.suggestedAction && (
                            <div>
                                <h4 className="font-semibold text-sm">Suggested Action:</h4>
                                <p className="text-sm text-muted-foreground">{selectedAlertForEvidence.suggestedAction}</p>
                            </div>
                        )}
                         {selectedAlertForEvidence.isVerified !== undefined && (
                          <div className={`mt-3 p-2 rounded-md text-sm flex items-center gap-2 ${selectedAlertForEvidence.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            <Info size={16} />
                            <span>{selectedAlertForEvidence.isVerified ? 'Verified as True Positive' : 'Verified as False Positive'}</span>
                          </div>
                        )}
                        {selectedAlertForEvidence.notes && <p className="text-xs text-muted-foreground mt-1 italic">Notes: {selectedAlertForEvidence.notes}</p>}
                    </div>
                    <div className="flex justify-end">
                         <Button variant="outline" onClick={() => setSelectedAlertForEvidence(null)}>Close</Button>
                    </div>
                </>
            )}
        </DialogContent>
      </Dialog>


      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
                {cameras.filter(cam => cam.status === 'live').slice(0,3).map(camera => ( 
                  <LiveFeedPlayer key={camera.id} camera={camera} onMaximize={handleViewLive} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No cameras added yet. Add a camera to see live feeds.</p>
            )}
             {cameras.filter(cam => cam.status === 'live').length > 3 && (
                <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => handleTabChange('cameras')}>
                      View All Live Feeds
                    </Button>
                </div>
            )}
          </section>

          <section id="recent-alerts" className="mt-8">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2"><AlertTriangle /> Recent Alerts</h2>
             </div>
             {alerts.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredAlerts.slice(0,4).map(alert => ( 
                    <AlertCard key={alert.id} alert={alert} onViewEvidence={handleViewEvidence} onVerify={handleVerifyAlert} />
                ))}
                </div>
             ) : (
                <p className="text-muted-foreground">No alerts to display.</p>
             )}
             {filteredAlerts.length > 4 && (
                <div className="mt-4 text-center">
                     <Button variant="outline" onClick={() => handleTabChange('alerts')}>
                       View All Alerts
                     </Button>
                </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="cameras">
          <section id="manage-cameras">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-semibold">Manage Cameras ({cameras.length})</h2>
              <Button onClick={() => { setEditingCamera(null); setIsAddCameraDialogOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Camera
              </Button>
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
                <Button onClick={() => { setEditingCamera(null); setIsAddCameraDialogOpen(true); }}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Camera
                </Button>
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="alerts">
          <section id="alert-feed">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Alert Feed ({filteredAlerts.length} of {alerts.length})</h2>
              <div className="flex items-center gap-2">
                  <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} aria-label="Grid view">
                      <LayoutGrid />
                  </Button>
                  <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} aria-label="List view">
                      <List />
                  </Button>
              </div>
            </div>
            <AlertFilters cameras={cameras} onFilterChange={(filters) => handleFilterAlerts(filters, alerts)} onClearFilters={handleClearAlertFilters}/>
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
