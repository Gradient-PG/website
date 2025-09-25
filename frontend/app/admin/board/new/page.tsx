'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import ErrorBoundary from '@/components/ui/error-boundary';
import Avatar from '@/components/ui/avatar';
import ImageUpload from '@/components/ui/image-upload';

interface FormData {
  name: string;
  role: string;
  photoUrl: string;
  photoBase64: string;
  bio: string;
  socials: string;
  displayOrder: number;
  active: boolean;
}

interface FormErrors {
  name?: string;
  role?: string;
  photoUrl?: string;
  bio?: string;
  socials?: string;
  displayOrder?: string;
}

export default function NewBoardMemberPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    role: '',
    photoUrl: '',
    photoBase64: '',
    bio: '',
    socials: '',
    displayOrder: 0,
    active: true,
  });

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidSocialValue = (value: string): boolean => {
    return isValidUrl(value) || isValidEmail(value);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    // Optional but validated fields
    if (formData.photoUrl && !isValidUrl(formData.photoUrl)) {
      newErrors.photoUrl = 'Photo URL must be a valid URL';
    }

    if (formData.socials) {
      try {
        const socials = JSON.parse(formData.socials);
        if (typeof socials !== 'object' || Array.isArray(socials)) {
          newErrors.socials = 'Socials must be a valid JSON object';
        } else {
          // Validate URLs and emails in socials object
          for (const [platform, value] of Object.entries(socials)) {
            if (typeof value !== 'string' || !isValidSocialValue(value)) {
              newErrors.socials = 'All social links must be valid URLs or email addresses';
              break;
            }
          }
        }
      } catch {
        newErrors.socials = 'Socials must be valid JSON';
      }
    }

    if (formData.displayOrder < 0) {
      newErrors.displayOrder = 'Display order must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/admin/board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
              body: JSON.stringify({
        ...formData,
        socials: formData.socials ? formData.socials : '', // Send as string
        photoBase64: formData.photoBase64 || '', // Send base64 image
        displayOrder: Number(formData.displayOrder),
      }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create board member');
      }

      const data = await response.json();
      
      toast({
        title: "Board member created",
        description: `${formData.name} has been added to the board.`,
      });

      router.push('/admin/board');
    } catch (error: any) {
      console.error('Error creating board member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create board member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const parseSocials = (): { [key: string]: string } => {
    if (!formData.socials || formData.socials.trim() === '') return {};
    try {
      const parsed = JSON.parse(formData.socials);
      // Ensure it's an object and not null or array
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed;
      }
      return {};
    } catch {
      return {};
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/board">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Board Members
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Board Member</h1>
          <p className="text-muted-foreground">
            Create a new board member profile
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential details about the board member
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Full name"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="e.g., President, Secretary, Member"
                      className={errors.role ? "border-red-500" : ""}
                    />
                    {errors.role && (
                      <p className="text-sm text-red-600">{errors.role}</p>
                    )}
                  </div>
                </div>

                {/* Photo Upload Section */}
                <div className="space-y-4">
                  <Label>Photo</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Image Upload */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Upload Photo</Label>
                      <ImageUpload
                        value={formData.photoBase64}
                        onChange={(base64) => setFormData(prev => ({ ...prev, photoBase64: base64 || '' }))}
                        cropSize={200}
                        maxSize={5}
                      />
                      <p className="text-xs text-muted-foreground">
                        Recommended: Upload for best quality
                      </p>
                    </div>

                    {/* URL Input */}
                    <div className="space-y-2">
                      <Label htmlFor="photoUrl" className="text-sm font-medium">Or use Photo URL</Label>
                      <Input
                        id="photoUrl"
                        value={formData.photoUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                        placeholder="https://example.com/photo.jpg"
                        className={errors.photoUrl ? "border-red-500" : ""}
                      />
                      {errors.photoUrl && (
                        <p className="text-sm text-red-600">{errors.photoUrl}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Alternative: External image URL
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    📸 Uploaded photos take priority over URLs and are stored securely in the database.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biography</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Brief biography or description"
                    rows={4}
                    className={errors.bio ? "border-red-500" : ""}
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-600">{errors.bio}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Optional: Brief description or biography
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Links & Settings</CardTitle>
                <CardDescription>
                  Social media links and display settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="socials">Social Links</Label>
                  <Textarea
                    id="socials"
                    value={formData.socials}
                    onChange={(e) => setFormData(prev => ({ ...prev, socials: e.target.value }))}
                    placeholder='{"email": "user@example.com", "linkedin": "https://linkedin.com/in/...", "github": "https://github.com/..."}'
                    rows={3}
                    className={errors.socials ? "border-red-500" : ""}
                  />
                  {errors.socials && (
                    <p className="text-sm text-red-600">{errors.socials}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    JSON object of social links: {`{"email": "user@example.com", "linkedin": "https://...", "github": "https://..."}`}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="displayOrder">Display Order</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      min="0"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className={errors.displayOrder ? "border-red-500" : ""}
                    />
                    {errors.displayOrder && (
                      <p className="text-sm text-red-600">{errors.displayOrder}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Lower numbers appear first
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="active">Status</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, active: checked as boolean }))
                        }
                      />
                      <Label htmlFor="active" className="text-sm font-normal">
                        Active board member
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Only active members appear on the public board page
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/board')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Member
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                How this member will appear on the board page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Avatar
                    src={formData.photoUrl}
                    base64={formData.photoBase64}
                    name={formData.name || 'Member Name'}
                    size="xl"
                  />
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">
                    {formData.name || 'Member Name'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.role || 'Role'}
                  </p>
                  {formData.bio && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {formData.bio}
                    </p>
                  )}
                </div>

                {formData.socials && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Social Links:</h4>
                    <div className="space-y-1">
                      {(() => {
                        const socials = parseSocials();
                        const entries = Object.entries(socials);
                        if (entries.length === 0 && formData.socials.trim() !== '') {
                          return (
                            <div className="text-xs text-red-500">
                              Invalid JSON format
                            </div>
                          );
                        }
                        return entries.map(([platform, url]) => (
                          <div key={platform} className="text-xs text-muted-foreground">
                            {platform}: {url}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Display Order: {formData.displayOrder}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Status: {formData.active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
              </ErrorBoundary>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 