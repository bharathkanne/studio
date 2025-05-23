
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Users, PlusCircle, Edit, Trash2, ShieldCheck } from "lucide-react";
import { mockUsersList } from '@/lib/mockData';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddUserForm } from '@/components/dashboard/AddUserForm';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize with a copy of mockUsersList and sort it
    setUsers([...mockUsersList].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
  }, []);

  const handleOpenAddUserDialog = () => {
    setEditingUser(null);
    setIsAddUserDialogOpen(true);
  };

  const handleAddOrUpdateUser = (userData: Omit<User, 'id'>, existingId?: string) => {
    if (existingId) {
      // Update existing user
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === existingId ? { ...u, ...userData } : u)).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      );
      toast({ title: "User Updated", description: `${userData.name} details have been updated.` });
    } else {
      // Add new user
      const newUser: User = {
        ...userData,
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      };
      setUsers(prevUsers => [...prevUsers, newUser].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      // Optionally update mockUsersList if it's intended to be a persistent mock source across sessions/refreshes (not typical for state)
      // mockUsersList.push(newUser); 
      toast({ title: "User Added", description: `${newUser.name} has been successfully added.` });
    }
    setEditingUser(null);
    setIsAddUserDialogOpen(false);
  };

  const handleEditUser = (user: User) => {
    if (user.email === 'admin@example.com' && user.id !== 'admin-user-001') {
        // This handles a scenario where a new user might be mistakenly given the admin email.
        // The primary admin 'admin-user-001' can be edited (e.g. name, admin status toggle if allowed).
    }
    setEditingUser(user);
    setIsAddUserDialogOpen(true);
  };

  const handleDeleteUser = (userToDelete: User) => {
    if (userToDelete.id === 'admin-user-001' || userToDelete.email === 'admin@example.com') {
        toast({ title: "Cannot Delete Admin", description: "The primary admin user cannot be deleted.", variant: "destructive" });
        return;
    }
    if (window.confirm(`Are you sure you want to delete ${userToDelete.name}? This is a mock action.`)) {
      setUsers(users.filter(user => user.id !== userToDelete.id).sort((a,b) => (a.name || '').localeCompare(b.name || '')));
      toast({ title: "User Deleted (Mock)", description: `${userToDelete.name} has been removed from the list.`});
    }
  };

  return (
    <div className="space-y-6">
      <Dialog open={isAddUserDialogOpen} onOpenChange={(isOpen) => {
        setIsAddUserDialogOpen(isOpen);
        if (!isOpen) setEditingUser(null); // Reset editingUser when dialog closes
      }}>
        <DialogContent className="sm:max-w-[425px] md:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <AddUserForm 
            onSubmitUser={handleAddOrUpdateUser} 
            existingUser={editingUser}
            onClose={() => {
              setIsAddUserDialogOpen(false);
              setEditingUser(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Users /> User Management</h1>
        <Button onClick={handleOpenAddUserDialog}>
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
                        <Badge variant={user.isAdmin ? "default" : "secondary"} className={`${user.isAdmin ? "bg-primary text-primary-foreground" : ""} flex items-center w-fit`}>
                          {user.isAdmin ? <ShieldCheck className="mr-1 h-3.5 w-3.5 flex-shrink-0" /> : <Users className="mr-1 h-3.5 w-3.5 flex-shrink-0" />}
                          <span className="truncate">{user.isAdmin ? 'Admin' : 'User'}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="mr-1 h-4 w-4" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user)} disabled={user.id === 'admin-user-001' || user.email === 'admin@example.com'}>
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
            Showing {users.length} user(s). Users are sorted by name.
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
