'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAutoSave } from '@/hooks/use-autosave';
import { validateBoardMember } from '@/lib/validation';
import ErrorBoundary from '@/components/ui/error-boundary';
import Avatar from '@/components/ui/avatar';
import ImageUpload from '@/components/ui/image-upload';
import { FormField } from '@/components/ui/form-field';
import type { BoardMember } from '@/lib/types';

interface EditBoardMemberPageProps {
  params: {
    id: string;
  };
}

interface FormData {
  name: string;
  role: string;
  roleType: 'board_member' | 'coordinator';
  photoUrl: string;
  photoBase64: string;
  bio: string;
  socials: string;
  active: boolean;
}

interface FormErrors {
  name?: string;
  role?: string;
  photoUrl?: string;
  bio?: string;
  socials?: string;
}

export default function EditBoardMemberPage({ params }: EditBoardMemberPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [member, setMember] = useState<BoardMember | null>(null);
  const [isLoadingMember, setIsLoadingMember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    role: '',
    roleType: 'board_member',
    photoUrl: '',
    photoBase64: '',
    bio: '',
    socials: '',
    active: true,
  });

  // Track if user has made changes
  const [hasUserMadeChanges, setHasUserMadeChanges] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);

  // Auto-save functionality for edit form - only enabled after user makes changes
  const { restoreSavedData, clearSavedData, hasSavedData } = useAutoSave({
    key: `edit-board-member-${params.id}`,
    data: formData,
    enabled: !isLoading && !isLoadingMember && hasUserMadeChanges && member !== null,
    onRestore: (data) => setFormData(data),
  });

  // Real-time form validation
  const validateFormInRealTime = () => {
    if (!isSubmitted) return;
    const validation = validateBoardMember(formData);
    setErrors(validation.errors);
  };

  useEffect(() => {
    validateFormInRealTime();
  }, [formData, isSubmitted]);

  // Detect changes from original data
  useEffect(() => {
    if (originalFormData && !hasUserMadeChanges) {
      const currentDataString = JSON.stringify(formData);
      const originalDataString = JSON.stringify(originalFormData);
      
      if (currentDataString !== originalDataString) {
        setHasUserMadeChanges(true);
      }
    }
  }, [formData, originalFormData, hasUserMadeChanges]);

  // Load existing board member data
  useEffect(() => {
    const loadMember = async () => {
      try {
        const response = await fetch(`/api/admin/board/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            toast({
              title: "Board member not found",
              description: "The requested board member could not be found.",
              variant: "destructive",
            });
            router.push('/admin/board');
            return;
          }
          throw new Error('Failed to load board member');
        }

        const data = await response.json();
        const memberData = data.member;
        
        setMember(memberData);
        
        const originalData = {
          name: memberData.name || '',
          role: memberData.role || '',
          roleType: memberData.roleType || 'board_member', // Default to board_member for existing records
          photoUrl: memberData.photoUrl || '',
          photoBase64: memberData.photoBase64 || '',
          bio: memberData.bio || '',
          socials: memberData.socials || '', // Load as string
          displayOrder: memberData.displayOrder || 0,
          active: memberData.active !== undefined ? memberData.active : true,
        };

        // Store original data for comparison
        setOriginalFormData(originalData);

        // Always load original data first, let user choose to restore draft
        setFormData(originalData);
        
        // Show draft restore option if available
        setTimeout(() => {
          if (hasSavedData()) {
            toast({
              title: 'Unsaved changes found',
              description: 'You have a draft with unsaved changes.',
              action: (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const draftData = restoreSavedData();
                    if (draftData) {
                      setFormData(draftData);
                      setHasUserMadeChanges(true);
                      toast({
                        title: 'Draft restored',
                        description: 'Your previous changes have been restored.',
                        duration: 2000,
                      });
                    }
                  }}
                >
                  Restore
                </Button>
              ),
              duration: 10000,
            });
          }
        }, 500);
      } catch (error) {
        console.error('Error loading board member:', error);
        toast({
          title: "Error",
          description: "Failed to load board member data.",
          variant: "destructive",
        });
        router.push('/admin/board');
      } finally {
        setIsLoadingMember(false);
      }
    };

    loadMember();
  }, [params.id, router, toast]);

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

  const validateFormData = (): boolean => {
    setIsSubmitted(true);
    const validation = validateBoardMember(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFormData()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors above before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/admin/board/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
                  socials: formData.socials ? formData.socials : '', // Send as string
        photoBase64: formData.photoBase64 || '', // Send base64 image
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle detailed validation errors from server
        if (errorData.details) {
          setErrors(errorData.details);
          toast({
            title: 'Validation Error',
            description: errorData.error || 'Please fix the errors and try again.',
            variant: 'destructive',
          });
          return;
        }
        
        throw new Error(errorData.error || 'Failed to update board member');
      }

      const data = await response.json();
      
      // Clear auto-saved data and reset change tracking on successful submission
      clearSavedData();
      setHasUserMadeChanges(false);
      
      toast({
        title: "Board member updated",
        description: `${formData.name} has been updated successfully.`,
      });

      router.push('/admin/board');
    } catch (error: any) {
      console.error('Error updating board member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update board member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/admin/board/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete board member');
      }

      toast({
        title: "Board member deleted",
        description: `${member?.name} has been deleted successfully.`,
      });

      router.push('/admin/board');
    } catch (error: any) {
      console.error('Error deleting board member:', error);
      toast({
        title: "Error",
        description: "Failed to delete board member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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

  if (isLoadingMember) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="space-y-2">
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4 animate-pulse">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/board">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Board Members
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Board Member</h1>
            <p className="text-muted-foreground">
              Update {member.name}'s profile
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasSavedData() && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const draftData = restoreSavedData();
                if (draftData) {
                  setFormData(draftData);
                  setHasUserMadeChanges(true);
                  toast({
                    title: 'Draft restored',
                    description: 'Your previous changes have been restored.',
                    duration: 2000,
                  });
                }
              }}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Restore Draft
            </Button>
          )}
          
          <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Member
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Board Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{member.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
                  <FormField
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                    placeholder="Full name"
                    required
                    error={errors.name}
                    maxLength={100}
                    hint="Full name of the board member"
                  />

                  <FormField
                    label="Role"
                    name="role"
                    value={formData.role}
                    onChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                    placeholder="e.g., President, Secretary, Member"
                    required
                    error={errors.role}
                    maxLength={100}
                    hint="Position or role within the organization"
                  />
                </div>

                {/* Role Type */}
                <div className="space-y-2">
                  <Label htmlFor="roleType">Member Type *</Label>
                  <Select value={formData.roleType} onValueChange={(value: 'board_member' | 'coordinator') => setFormData(prev => ({ ...prev, roleType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select member type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="board_member">Board Member</SelectItem>
                      <SelectItem value="coordinator">Coordinator</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Board Members have formal positions, Coordinators manage specific areas
                  </p>
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
                      Active member
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Only active members appear on the public board page
                  </p>
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Member
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
                    Status: {formData.active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
              </ErrorBoundary>
            </CardContent>
          </Card>

          {/* Member Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Member Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Created:</span>{' '}
                {new Date(member.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Last Updated:</span>{' '}
                {new Date(member.updatedAt).toLocaleDateString()}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">ID:</span>{' '}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">{member.id}</code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 