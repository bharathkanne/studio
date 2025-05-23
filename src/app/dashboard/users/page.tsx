'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Users, PlusCircle, Edit, Trash2, ShieldAlert, ShieldCheck } from "lucide-react";
import { mockUsersList } from '@/lib/mockData'; // Assuming you'll create this
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
// TODO: Create AddUserForm/Dialog similar to AddCameraForm for full functionality

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, fetch users from an API
    setUsers(mockUsersList);
  }, []);

  const handleAddUser = () => {
    // Placeholder: Open a dialog to add a new user
    toast({ title: "Add User", description: "This would open a form to add a new user. (Not implemented)"});
  };

  const handleEditUser = (user: User) => {
    // Placeholder: Open a dialog to edit user details
    toast({ title: "Edit User", description: `This would open a form to edit ${user.name}. (Not implemented)`});
  };

  const handleDeleteUser = (userToDelete: User) => {
    // Placeholder: Confirm and delete user
    if (window.confirm(`Are you sure you want to delete ${userToDelete.name}? This is a mock action.`)) {
      setUsers(users.filter(user => user.id !== userToDelete.id));
      toast({ title: "User Deleted (Mock)", description: `${userToDelete.name} has been removed from the list.`});
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Users /> User Management</h1>
        <Button onClick={handleAddUser}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New User
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Platform Users ({users.length})</CardTitle>
          <CardDescription>Manage users, their roles, and permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.isAdmin ? "default" : "secondary"} className={user.isAdmin ? "bg-primary text-primary-foreground" : ""}>
                          {user.isAdmin ? <ShieldCheck className="mr-1 h-3.5 w-3.5" /> : <Users className="mr-1 h-3.5 w-3.5" />}
                          {user.isAdmin ? 'Admin' : 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="mr-1 h-4 w-4" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user)} disabled={user.isAdmin && user.email === 'admin@example.com'}>
                          <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-muted-foreground/30 rounded-lg">
              <Users size={48} className="mx-auto text-muted-foreground mb-2" />
              <h3 className="text-xl font-medium text-muted-foreground">No Users Found</h3>
              <p className="text-sm text-muted-foreground">No users available in the system yet.</p>
            </div>
          )}
        </CardContent>
         {users.length > 0 && (
          <CardFooter className="text-sm text-muted-foreground">
            Showing {users.length} user(s).
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
