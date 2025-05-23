
'use client';

import type { User } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Eye, EyeOff } from 'lucide-react';

interface AddUserFormProps {
  onAddUser: (user: Omit<User, 'id'>) => void;
  existingUser?: User | null; // For editing (future use)
  onClose: () => void;
}

export function AddUserForm({ onAddUser, existingUser, onClose }: AddUserFormProps) {
  const [name, setName] = useState(existingUser?.name || '');
  const [email, setEmail] = useState(existingUser?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(existingUser?.isAdmin || false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const isEditing = !!existingUser;

  useEffect(() => {
    if (existingUser) {
      setName(existingUser.name || '');
      setEmail(existingUser.email);
      setIsAdmin(existingUser.isAdmin || false);
      // Password fields are intentionally left blank for edits for security
    }
  }, [existingUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in Name and Email.',
        variant: 'destructive',
      });
      return;
    }

    if (!isEditing && !password) {
      toast({
        title: 'Missing Password',
        description: 'Password is required for new users.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    const userData: Omit<User, 'id'> = {
      name,
      email,
      isAdmin,
    };
    if (password) { // Include password if provided (especially for new users or password changes)
      // In a real app, password would be hashed here or on the backend
      // For mock, we're not storing it, but this structure allows for it
    }
    
    onAddUser(userData); // The actual user creation logic (including ID and potential password hashing) is handled by the parent
    toast({
      title: isEditing ? 'User Updated' : 'User Added',
      description: `${name} has been successfully ${isEditing ? 'updated' : 'added'}.`,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="user-name">Full Name</Label>
        <Input
          id="user-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Jane Doe"
          required
        />
      </div>
      <div>
        <Label htmlFor="user-email">Email</Label>
        <Input
          id="user-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g., jane@example.com"
          required
          disabled={isEditing} // Prevent email change on edit for simplicity in mock
        />
      </div>
      <div>
        <Label htmlFor="user-password">{isEditing ? 'New Password (optional)' : 'Password'}</Label>
        <div className="relative">
            <Input
            id="user-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required={!isEditing}
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
        </div>
      </div>
      <div>
        <Label htmlFor="user-confirm-password">{isEditing ? 'Confirm New Password' : 'Confirm Password'}</Label>
        <div className="relative">
            <Input
            id="user-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required={!isEditing && !!password} // Required if password is being set
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="isAdmin"
          checked={isAdmin}
          onCheckedChange={setIsAdmin}
        />
        <Label htmlFor="isAdmin">Is Admin?</Label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">
          <PlusCircle className="mr-2 h-4 w-4" /> {isEditing ? 'Update User' : 'Add User'}
        </Button>
      </div>
    </form>
  );
}
