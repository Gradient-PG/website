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
import { Checkbox } from '@/components/ui/checkbox';
import ImageUpload from '@/components/ui/image-upload';
import { useToast } from '@/hooks/use-toast';
import type { PartnershipInput } from '@/lib/types';

interface FormErrors {
  name?: string;
  yearFrom?: string;
  yearTo?: string;
}

export default function EditPartnershipPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const currentYear = new Date().getFullYear();
  
  const [formData, setFormData] = useState<PartnershipInput>({
    name: '',
    websiteUrl: '',
    logoUrl: '',
    logoBase64: '',
    yearFrom: currentYear,
    yearTo: undefined,
    active: true,
  });

  useEffect(() => {
    fetchPartnership();
  }, []);

  const fetchPartnership = async () => {
    try {
      const response = await fetch(`/api/admin/partnerships/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch partnership');
      const { partnership } = await response.json();
      setFormData({
        name: partnership.name,
        websiteUrl: partnership.websiteUrl || '',
        logoUrl: partnership.logoUrl || '',
        logoBase64: partnership.logoBase64 || '',
        yearFrom: partnership.yearFrom,
        yearTo: partnership.yearTo,
        active: partnership.active,
      });
    } catch (error) {
      console.error('Error fetching partnership:', error);
      toast({
        title: 'Error',
        description: 'Failed to load partnership',
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    }

    if (!formData.yearFrom) {
      newErrors.yearFrom = 'Start year is required';
    } else if (formData.yearFrom < 1900 || formData.yearFrom > 2200) {
      newErrors.yearFrom = 'Please enter a valid year';
    }

    if (formData.yearTo) {
      if (formData.yearTo < 1900 || formData.yearTo > 2200) {
        newErrors.yearTo = 'Please enter a valid year';
      } else if (formData.yearTo < formData.yearFrom) {
        newErrors.yearTo = 'End year must be after start year';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/partnerships/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update partnership');
      }

      toast({
        title: 'Partnership Updated',
        description: 'The partnership has been updated successfully.',
      });

      router.push('/admin/partnerships');
      router.refresh();
    } catch (error) {
      console.error('Error updating partnership:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update partnership',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Partnership</h1>
          <p className="text-muted-foreground">Update partnership details</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/partnerships">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Partnership Details</CardTitle>
            <CardDescription>Update the details for this partnership</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Website URL */}
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="https://example.com"
              />
              <p className="text-sm text-muted-foreground">Link to the organization's website</p>
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <Label>Logo</Label>
              <ImageUpload
                value={formData.logoBase64 || formData.logoUrl || ''}
                onChange={(value) => {
                  if (value && value.startsWith('data:')) {
                    setFormData({ ...formData, logoBase64: value, logoUrl: '' });
                  } else if (value) {
                    setFormData({ ...formData, logoUrl: value, logoBase64: '' });
                  } else {
                    setFormData({ ...formData, logoBase64: '', logoUrl: '' });
                  }
                }}
                noCrop={true}
                maxWidth={800}
                maxHeight={400}
              />
              <p className="text-sm text-muted-foreground">Upload organization logo (will be resized maintaining aspect ratio)</p>
            </div>

            {/* Year Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yearFrom">Start Year *</Label>
                <Input
                  id="yearFrom"
                  type="number"
                  value={formData.yearFrom}
                  onChange={(e) => setFormData({ ...formData, yearFrom: parseInt(e.target.value) || currentYear })}
                  min={1900}
                  max={2200}
                  className={errors.yearFrom ? 'border-red-500' : ''}
                />
                {errors.yearFrom && <p className="text-sm text-red-600">{errors.yearFrom}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearTo">End Year (leave empty for ongoing)</Label>
                <Input
                  id="yearTo"
                  type="number"
                  value={formData.yearTo || ''}
                  onChange={(e) => setFormData({ ...formData, yearTo: e.target.value ? parseInt(e.target.value) : undefined })}
                  min={1900}
                  max={2200}
                  className={errors.yearTo ? 'border-red-500' : ''}
                  placeholder="Present"
                />
                {errors.yearTo && <p className="text-sm text-red-600">{errors.yearTo}</p>}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: !!checked })}
              />
              <Label htmlFor="active">Active partnership (visible on website)</Label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/partnerships">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
} 