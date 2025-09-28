'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, RotateCcw, AlertCircle } from 'lucide-react';
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
import type { ProjectInput } from '@/lib/types';

interface FormErrors {
  title?: string;
  description?: string;
  slug?: string;
  imageUrl?: string;
  imageBase64?: string;
  status?: string;
  tags?: string;
  links?: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectInput>({
    title: '',
    slug: '',
    description: '',
    imageUrl: '',
    imageBase64: '',
    tags: '',
    status: 'planned',
    links: '',

  });

  // Track if user has made changes (for new forms, any non-empty content counts as changes)
  const [hasUserMadeChanges, setHasUserMadeChanges] = useState(false);

  // Auto-save functionality - only enabled after user makes changes
  const { restoreSavedData, clearSavedData, hasSavedData } = useAutoSave({
    key: 'new-project',
    data: formData,
    enabled: !isLoading && hasUserMadeChanges,
    onRestore: (data) => setFormData(data),
  });

  // Check for saved data on component mount
  useEffect(() => {
    if (hasSavedData()) {
      // Show restore option
      toast({
        title: 'Unsaved changes found',
        description: 'Would you like to restore your previous draft?',
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => restoreSavedData()}
          >
            Restore
          </Button>
        ),
        duration: 10000,
      });
    }
  }, []);

  // Real-time form validation
  const validateFormInRealTime = () => {
    if (!isSubmitted) return;
    const validation = validateProject(formData);
    setErrors(validation.errors);
  };

  useEffect(() => {
    validateFormInRealTime();
  }, [formData, isSubmitted]);

  // Detect changes for new form (any meaningful content)
  useEffect(() => {
    if (!hasUserMadeChanges) {
      const hasContent = Object.values(formData).some(value => 
        value !== null && value !== undefined && String(value).trim() !== '' && 
        value !== 0 && value !== 'planned' // ignore default values
      );
      
      if (hasContent) {
        setHasUserMadeChanges(true);
      }
    }
  }, [formData, hasUserMadeChanges]);

  const handleTitleChange = (value: string) => {
    const newSlug = generateSlug(value);
    setFormData(prev => ({
      ...prev,
      title: value,
      // Auto-update slug if it hasn't been manually edited
      slug: prev.slug === generateSlug(prev.title) || !prev.slug ? newSlug : prev.slug
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

    try {
      const response = await fetch(`/api/admin/projects?slug=${encodeURIComponent(slug)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.projects && data.projects.some((p: any) => p.slug === slug)) {
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
      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          links: formData.links ? formData.links : '',
          imageBase64: formData.imageBase64 || '',
          displayOrder: 0, // Default display order, will be managed by drag-and-drop
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
        
        throw new Error(errorData.error || 'Failed to create project');
      }

      // Clear auto-saved data on successful submission
      clearSavedData();
      
      toast({
        title: 'Project Created',
        description: 'Your project has been created successfully.',
      });

      router.push('/admin/projects');
      router.refresh();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
            <p className="text-muted-foreground">
              Add a new project to showcase your club's initiatives
            </p>
          </div>
        </div>
        
        {hasSavedData() && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => restoreSavedData()}
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
              Fill in the information about your new project
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
                    cropSize={720}
                    maxSize={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: Upload for best quality (720×720px)
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
            <FormField
              label="Tags"
              name="tags"
              value={formData.tags || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, tags: value }))}
              placeholder="science, research, AI, data visualization"
              error={errors.tags}
              maxLength={200}
              hint="Comma-separated tags for categorizing and filtering your project"
            />

            {/* Links */}
            <FormField
              label="Links (JSON)"
              name="links"
              type="textarea"
              value={formData.links || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, links: value }))}
              placeholder='{"github": "https://github.com/...", "website": "https://example.com", "demo": "https://demo.com"}'
              rows={3}
              error={errors.links}
              hint={`JSON object of project links. Example: {"github": "...", "website": "...", "demo": "..."}`}
            />

            {/* Form Actions */}
            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Project
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