import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Users /> User Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Platform Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">User management features for administrators will be available here.</p>
          {/* TODO: Implement user list, roles, permissions etc. for admins */}
        </CardContent>
      </Card>
    </div>
  );
}
