'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/ui/image-upload';
import { FormField } from '@/components/ui/form-field';
import { useToast } from '@/hooks/use-toast';
import { useAutoSave } from '@/hooks/use-autosave';
import { validateProject, generateSlug, ValidationRules } from '@/lib/validation';
import type { Project, ProjectInput } from '@/lib/types';

interface FormErrors {
  title?: string;
  description?: string;
  slug?: string;
  imageUrl?: string;
  imageBase64?: string;
  status?: string;
  tags?: string;
  links?: string;
  displayOrder?: string;
}

interface EditProjectPageProps {
  params: {
    id: string;
  };
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectInput>({
    title: '',
    slug: '',
    description: '',
    imageUrl: '',
    imageBase64: '',
    tags: '',
    status: 'planned',
    links: '',
    displayOrder: 0,
  });

  // Track if user has made changes
  const [hasUserMadeChanges, setHasUserMadeChanges] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<ProjectInput | null>(null);

  // Auto-save functionality for edit form - only enabled after user makes changes
  const { restoreSavedData, clearSavedData, hasSavedData } = useAutoSave({
    key: `edit-project-${params.id}`,
    data: formData,
    enabled: !isLoading && !isLoadingProject && hasUserMadeChanges && project !== null,
    onRestore: (data) => setFormData(data),
  });

  // Real-time form validation
  const validateFormInRealTime = () => {
    if (!isSubmitted) return;
    const validation = validateProject(formData);
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

  // Load existing project data
  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoadingProject(true);
        const response = await fetch(`/api/admin/projects/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to load project');
        }

        const data = await response.json();
        const projectData = data.project;
        
        setProject(projectData);
        
        const originalData = {
          title: projectData.title,
          slug: projectData.slug,
          description: projectData.description || '',
          imageUrl: projectData.imageUrl || '',
          imageBase64: projectData.imageBase64 || '',
          tags: projectData.tags || '',
          status: projectData.status,
          links: projectData.links || '',
          displayOrder: projectData.displayOrder || 0,
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
        console.error('Error loading project:', error);
        setErrors({ title: 'Failed to load project' });
      } finally {
        setIsLoadingProject(false);
      }
    };

    loadProject();
  }, [params.id]);

  // Auto-generate slug from title (but only if it hasn't been manually edited)
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    const newSlug = generateSlug(value);
    setFormData(prev => ({
      ...prev,
      title: value,
      // Auto-update slug if it hasn't been manually edited
      slug: project && prev.slug === generateSlug(prev.title) || !prev.slug ? newSlug : prev.slug
    }));
    
    // Clear title error if it exists
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: undefined }));
    }
  };

  const handleSlugChange = (value: string) => {
    setFormData(prev => ({ ...prev, slug: value }));
    setSlugError(null);
    
    // Clear slug error if it exists
    if (errors.slug) {
      setErrors(prev => ({ ...prev, slug: undefined }));
    }
  };

  // Async slug validation
  const validateSlugUnique = async (slug: string): Promise<string | null> => {
    if (!slug) return 'URL slug is required';
    
    const slugValidation = ValidationRules.slug(slug, 'URL slug');
    if (slugValidation) return slugValidation;

    // Skip uniqueness check if slug hasn't changed
    if (project && slug === project.slug) return null;

    try {
      const response = await fetch(`/api/admin/projects?slug=${encodeURIComponent(slug)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.projects && data.projects.some((p: any) => p.slug === slug && p.id !== params.id)) {
          return 'This URL slug is already taken';
        }
      }
    } catch (error) {
      return 'Could not validate URL slug';
    }
    
    return null;
  };

  const validateFormData = (): boolean => {
    setIsSubmitted(true);
    const validation = validateProject(formData);
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
      const response = await fetch(`/api/admin/projects/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          links: formData.links ? formData.links : '',
          imageBase64: formData.imageBase64 || '',
          displayOrder: Number(formData.displayOrder),
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
        
        throw new Error(errorData.error || 'Failed to update project');
      }

      // Clear auto-saved data and reset change tracking on successful submission
      clearSavedData();
      setHasUserMadeChanges(false);
      
      toast({
        title: 'Project Updated',
        description: 'Your project has been updated successfully.',
      });

      router.push('/admin/projects');
      router.refresh();
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update project',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
            <p className="text-muted-foreground">Loading project data...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
            <p className="text-muted-foreground">Project not found</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Project not found or failed to load</p>
            <Button asChild>
              <Link href="/admin/projects">Back to Projects</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
            <p className="text-muted-foreground">
              Editing: {project.title}
            </p>
          </div>
        </div>

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
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Update the information for this project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <FormField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Enter project title"
              required
              error={errors.title}
              maxLength={100}
              hint="A clear, descriptive title for your project"
            />

            {/* Slug */}
            <FormField
              label="URL Slug"
              name="slug"
              value={formData.slug}
              onChange={handleSlugChange}
              placeholder="project-url-slug"
              required
              error={errors.slug || slugError || undefined}
              maxLength={50}
              validator={validateSlugUnique}
              hint={`Used in the project URL: /projects/${formData.slug || 'your-slug'}`}
            />

            {/* Description */}
            <FormField
              label="Description"
              name="description"
              type="textarea"
              value={formData.description || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Describe your project in detail... (optional)"
              required={false}
              error={errors.description}
              rows={4}
              hint="Optional: Provide a description of your project's goals and outcomes"
            />

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Project Image Upload Section */}
            <div className="space-y-4">
              <Label>Project Image</Label>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Upload Image</Label>
                  <ImageUpload
                    value={formData.imageBase64}
                    onChange={(base64) => setFormData(prev => ({ ...prev, imageBase64: base64 || '' }))}
                    cropSize={400}
                    maxSize={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: Upload for best quality (400×400px)
                  </p>
                </div>

                {/* URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-sm font-medium">Or use Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className={errors.imageUrl ? "border-red-500" : ""}
                  />
                  {errors.imageUrl && (
                    <p className="text-sm text-red-600">{errors.imageUrl}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Alternative: External image URL
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                🖼️ Uploaded images take priority over URLs and are stored securely in the database.
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="science, research, AI"
              />
              <p className="text-sm text-muted-foreground">
                Comma-separated tags for categorizing your project
              </p>
            </div>

            {/* Links */}
            <div className="space-y-2">
              <Label htmlFor="links">Links (JSON)</Label>
              <Textarea
                id="links"
                value={formData.links}
                onChange={(e) => setFormData(prev => ({ ...prev, links: e.target.value }))}
                placeholder='{"github": "https://github.com/...", "website": "https://example.com"}'
                rows={3}
                className={errors.links ? "border-red-500" : ""}
              />
              <p className="text-sm text-muted-foreground">
                JSON object of links: {`{"type": "url", "github": "...", "website": "..."}`}
              </p>
              {errors.links && (
                <p className="text-sm text-red-600">{errors.links}</p>
              )}
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                className={errors.displayOrder ? "border-red-500" : ""}
              />
              <p className="text-sm text-muted-foreground">
                Lower numbers appear first in the list
              </p>
              {errors.displayOrder && (
                <p className="text-sm text-red-600">{errors.displayOrder}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Project
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/projects">Cancel</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 