'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Edit, MoreVertical, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { Partnership } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SortableList } from '@/components/ui/sortable-list';

export default function PartnershipsAdminPage() {
  const { toast } = useToast();
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPartnerships, setSelectedPartnerships] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partnershipToDelete, setPartnershipToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPartnerships();
  }, []);

  const fetchPartnerships = async () => {
    try {
      const response = await fetch('/api/admin/partnerships');
      if (!response.ok) throw new Error('Failed to fetch partnerships');
      const data = await response.json();
      setPartnerships(data.partnerships);
    } catch (error) {
      console.error('Error fetching partnerships:', error);
      toast({
        title: 'Error',
        description: 'Failed to load partnerships',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (reorderedPartnerships: Partnership[]) => {
    try {
      const updates = reorderedPartnerships.map((partnership, index) => ({
        id: partnership.id,
        displayOrder: index + 1
      }));

      const response = await fetch('/api/admin/partnerships/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateDisplayOrder',
          partnershipIds: updates.map(u => u.id),
          data: { updates }
        }),
      });

      if (!response.ok) throw new Error('Failed to update order');

      toast({
        title: 'Success',
        description: 'Partnership order updated successfully',
      });
      await fetchPartnerships();
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: 'Error',
        description: 'Failed to save order',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/partnerships/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete partnership');

      toast({
        title: 'Success',
        description: 'Partnership deleted successfully',
      });
      await fetchPartnerships();
    } catch (error) {
      console.error('Error deleting partnership:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete partnership',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      const response = await fetch('/api/admin/partnerships/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          partnershipIds: Array.from(selectedPartnerships),
        }),
      });

      if (!response.ok) throw new Error('Failed to delete partnerships');

      toast({
        title: 'Success',
        description: `${selectedPartnerships.size} partnership(s) deleted successfully`,
      });
      setSelectedPartnerships(new Set());
      await fetchPartnerships();
    } catch (error) {
      console.error('Error bulk deleting partnerships:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete partnerships',
        variant: 'destructive',
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPartnerships(new Set(partnerships.map(p => p.id)));
    } else {
      setSelectedPartnerships(new Set());
    }
  };

  const handleSelectPartnership = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedPartnerships);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedPartnerships(newSelected);
  };

  const activeCount = partnerships.filter(p => p.active).length;
  const totalCount = partnerships.length;

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Partnerships</h1>
        <p className="text-muted-foreground">Manage your organization partnerships</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Partnerships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount - activeCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/partnerships/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Partnership
            </Link>
          </Button>
        </div>
        {selectedPartnerships.size > 0 && (
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected ({selectedPartnerships.size})
          </Button>
        )}
      </div>

      {/* Partnerships List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Partnerships</CardTitle>
            <Checkbox
              checked={selectedPartnerships.size === partnerships.length && partnerships.length > 0}
              onCheckedChange={handleSelectAll}
            />
          </div>
        </CardHeader>
        <CardContent>
          <SortableList<Partnership>
            items={partnerships}
            onReorder={handleReorder}
            getItemId={(partnership) => partnership.id}
          >
            {(partnership) => (
              <div className="flex items-center gap-4 p-4 bg-white border rounded-lg">
                <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                <Checkbox
                  checked={selectedPartnerships.has(partnership.id)}
                  onCheckedChange={(checked) => handleSelectPartnership(partnership.id, !!checked)}
                />
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                  {(partnership.logoBase64 || partnership.logoUrl) ? (
                    <img
                      src={partnership.logoBase64 || partnership.logoUrl}
                      alt={partnership.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded text-gray-400 font-semibold">
                      {partnership.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{partnership.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {partnership.yearFrom} - {partnership.yearTo || 'Present'}
                  </p>
                </div>
                <Badge variant={partnership.active ? 'default' : 'secondary'}>
                  {partnership.active ? 'Active' : 'Inactive'}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/partnerships/${partnership.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => {
                        setPartnershipToDelete(partnership.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </SortableList>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {partnershipToDelete
                ? 'This will permanently delete this partnership.'
                : `This will permanently delete ${selectedPartnerships.size} partnership(s).`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPartnershipToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (partnershipToDelete) {
                  handleDelete(partnershipToDelete);
                  setPartnershipToDelete(null);
                } else {
                  handleBulkDelete();
                }
                setDeleteDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 