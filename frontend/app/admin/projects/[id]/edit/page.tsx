'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/ui/image-upload';
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
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
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
        setFormData({
          title: projectData.title,
          slug: projectData.slug,
          description: projectData.description,
          imageUrl: projectData.imageUrl || '',
          imageBase64: projectData.imageBase64 || '',
          tags: projectData.tags || '',
          status: projectData.status,
          links: projectData.links || '',
          displayOrder: projectData.displayOrder || 0,
        });
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
    setFormData(prev => ({
      ...prev,
      title: value,
      // Only auto-update slug if it matches the generated slug or is empty
      slug: project && prev.slug === generateSlug(prev.title) || !prev.slug ? generateSlug(value) : prev.slug
    }));
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL';
    }

    if (formData.links) {
      try {
        const links = JSON.parse(formData.links);
        if (typeof links !== 'object' || Array.isArray(links)) {
          newErrors.links = 'Links must be a valid JSON object';
        } else {
          for (const [type, url] of Object.entries(links)) {
            if (typeof url !== 'string' || !isValidUrl(url)) {
              newErrors.links = 'All link URLs must be valid';
              break;
            }
          }
        }
      } catch {
        newErrors.links = 'Links must be valid JSON';
      }
    }

    if ((formData.displayOrder ?? 0) < 0) {
      newErrors.displayOrder = 'Display order must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
        const error = await response.json();
        throw new Error(error.error || 'Failed to update project');
      }

      router.push('/admin/projects');
      router.refresh();
    } catch (error) {
      console.error('Error updating project:', error);
      setErrors({ title: error instanceof Error ? error.message : 'Failed to update project' });
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
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter project title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="project-url-slug"
                className={errors.slug ? "border-red-500" : ""}
              />
              <p className="text-sm text-muted-foreground">
                Used in the project URL: /projects/{formData.slug || 'your-slug'}
              </p>
              {errors.slug && (
                <p className="text-sm text-red-600">{errors.slug}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your project..."
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

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