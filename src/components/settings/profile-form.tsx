'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DeleteAccountDialog } from './delete-account-dialog';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  createdAt: Date;
  subscription: {
    status: string | null;
    tier: string;
  };
}

export function ProfileForm() {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preferences, setPreferences] = useState({
    notifications: {
      product: true,
      billing: true,
      marketing: false,
    },
    theme: 'light',
    language: 'en',
  });

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfile();
    }
  }, [isLoaded, user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const bio = formData.get('bio') as string;

    try {
      // Update Clerk profile
      await user?.update({
        firstName,
        lastName,
      });

      // Update our database
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: JSON.stringify(preferences),
          metadata: JSON.stringify({ bio }),
        }),
      });

      toast.success('Profile updated successfully');
      await fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile || !user) return;
    
    setIsLoading(true);
    try {
      // For now, we'll just show a message
      // In production, you'd upload to a service like Cloudinary or S3
      toast.success('Profile image upload coming soon!');
      
      // Example of how you'd update the image:
      // const imageUrl = await uploadToCloudinary(imageFile);
      // await user.setProfileImage({ file: imageUrl });
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.imageUrl} alt={user.fullName || ''} />
            <AvatarFallback>
              {user.firstName?.[0]}{user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <button
            className="absolute bottom-0 right-0 rounded-full bg-white p-2 shadow-md hover:bg-gray-50"
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            <Camera className="h-4 w-4 text-gray-600" />
          </button>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{user.fullName || 'Unnamed User'}</h3>
          <p className="text-sm text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
          <p className="text-sm text-gray-500">
            Member since {new Date(user.createdAt!).toLocaleDateString()}
          </p>
          {profile?.subscription && (
            <p className="text-sm font-medium text-blue-600">
              {profile.subscription.tier.charAt(0).toUpperCase() + profile.subscription.tier.slice(1)} Plan
            </p>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              defaultValue={user.firstName || ''}
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={user.lastName || ''}
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            defaultValue={user.primaryEmailAddress?.emailAddress || ''}
            disabled
            className="bg-gray-50"
          />
          <p className="mt-1 text-xs text-gray-500">
            Email cannot be changed here. Use Clerk's email management.
          </p>
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Tell us about yourself..."
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Preferences */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Preferences</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={preferences.notifications.product}
                onChange={(e) => setPreferences({
                  ...preferences,
                  notifications: { ...preferences.notifications, product: e.target.checked }
                })}
              />
              <span className="ml-2 text-sm text-gray-700">Product updates</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={preferences.notifications.billing}
                onChange={(e) => setPreferences({
                  ...preferences,
                  notifications: { ...preferences.notifications, billing: e.target.checked }
                })}
              />
              <span className="ml-2 text-sm text-gray-700">Billing notifications</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={preferences.notifications.marketing}
                onChange={(e) => setPreferences({
                  ...preferences,
                  notifications: { ...preferences.notifications, marketing: e.target.checked }
                })}
              />
              <span className="ml-2 text-sm text-gray-700">Marketing emails</span>
            </label>
          </div>
        </div>

        {/* Theme Selection */}
        <div>
          <Label htmlFor="theme">Theme</Label>
          <select
            id="theme"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={preferences.theme}
            onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          {imageFile && (
            <Button type="button" variant="secondary" onClick={handleImageUpload}>
              Upload Image
            </Button>
          )}
        </div>
      </form>

      {/* Account Actions */}
      <div className="border-t pt-6">
        <h4 className="text-sm font-semibold mb-3 text-red-600">Danger Zone</h4>
        <div className="space-y-3">
          <DeleteAccountDialog />
        </div>
      </div>
    </div>
  );
}