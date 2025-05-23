
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
  onSubmitUser: (user: Omit<User, 'id'>, existingId?: string) => void;
  existingUser?: User | null;
  onClose: () => void;
}

export function AddUserForm({ onSubmitUser, existingUser, onClose }: AddUserFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
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
      // User must explicitly enter a new password to change it.
      setPassword('');
      setConfirmPassword('');
    } else {
      // Reset fields for "add new" mode
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setIsAdmin(false);
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
    
    // For admin user, don't allow isAdmin to be toggled off if it's the primary admin
    if (isEditing && existingUser?.id === 'admin-user-001' && !isAdmin) {
        toast({
            title: 'Cannot Revoke Admin',
            description: 'The primary admin user must remain an administrator.',
            variant: 'destructive',
        });
        setIsAdmin(true); // Revert switch
        return;
    }


    const userData: Omit<User, 'id'> = {
      name,
      email,
      isAdmin,
      // Password will be handled by the backend/auth logic.
      // For mock, we don't directly store/use the password from this form in the User object,
      // but it's collected for the submission process.
      // If `password` is empty during an edit, it means no change is requested.
    };
    
    // Pass existingUser.id if we are editing
    onSubmitUser(userData, existingUser?.id);
    // Toast is handled by parent
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
          disabled={isEditing} 
        />
      </div>
      <div>
        <Label htmlFor="user-password">{isEditing ? 'New Password (leave blank to keep current)' : 'Password'}</Label>
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
                aria-label={showPassword ? "Hide password" : "Show password"}
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
            required={!isEditing && !!password} 
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
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
          disabled={isEditing && existingUser?.id === 'admin-user-001'}
        />
        <Label htmlFor="isAdmin">Is Admin?</Label>
      </div>
      {isEditing && existingUser?.id === 'admin-user-001' && (
        <p className="text-xs text-muted-foreground">The primary admin user's role cannot be changed.</p>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">
          <PlusCircle className="mr-2 h-4 w-4" /> {isEditing ? 'Update User' : 'Add User'}
        </Button>
      </div>
    </form>
  );
}
