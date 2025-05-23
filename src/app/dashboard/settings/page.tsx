import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Settings /> Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>User Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">User settings and preferences will be available here in a future update.</p>
          {/* TODO: Implement settings form, e.g., notification preferences, theme toggle */}
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Account Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Manage your account details, password, and subscription.</p>
        </CardContent>
      </Card>
    </div>
  );
}
