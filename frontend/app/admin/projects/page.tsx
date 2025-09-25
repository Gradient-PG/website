'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Project } from '@/lib/types';

interface ProjectsTableProps {
  projects: Project[];
  onProjectsChange: () => void;
}

function ProjectStatusBadge({ status }: { status: Project['status'] }) {
  const variants = {
    planned: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const labels = {
    planned: 'Planned',
    active: 'Active',
    completed: 'Completed',
  };

  return (
    <Badge 
      variant="outline" 
      className={variants[status]}
    >
      {labels[status]}
    </Badge>
  );
}

function ProjectsTable({ projects, onProjectsChange }: ProjectsTableProps) {
  const { toast } = useToast();
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelectProject = (projectId: string, checked: boolean) => {
    const newSelected = new Set(selectedProjects);
    if (checked) {
      newSelected.add(projectId);
    } else {
      newSelected.delete(projectId);
    }
    setSelectedProjects(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProjects(new Set(projects.map(p => p.id)));
    } else {
      setSelectedProjects(new Set());
    }
  };

  const handleDeleteProject = async (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/projects/${projectToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      toast({
        title: "Project deleted",
        description: `${projectToDelete.title} has been deleted successfully.`,
      });

      onProjectsChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleBulkDelete = () => {
    if (selectedProjects.size === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkAction = (action: string) => {
    if (selectedProjects.size === 0) return;
    
    if (action === 'delete') {
      handleBulkDelete();
    } else if (action.startsWith('status-')) {
      const status = action.replace('status-', '');
      handleBulkStatusUpdate(status);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    setIsDeleting(true);
    const errors: string[] = [];

    try {
      const response = await fetch('/api/admin/projects/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateStatus',
          projectIds: Array.from(selectedProjects),
          data: { status },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project status');
      }

      const result = await response.json();

      if (result.errorCount > 0) {
        toast({
          title: "Partial success",
          description: `${result.successCount} projects updated, ${result.errorCount} failed.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Status updated",
          description: `${result.successCount} project(s) status updated to ${status}.`,
        });
      }

      setSelectedProjects(new Set());
      onProjectsChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmBulkDelete = async () => {
    setIsDeleting(true);
    const errors: string[] = [];

    try {
      // Delete projects one by one
      for (const projectId of Array.from(selectedProjects)) {
        try {
          const response = await fetch(`/api/admin/projects/${projectId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const project = projects.find(p => p.id === projectId);
            errors.push(project?.title || 'Unknown project');
          }
        } catch (error) {
          const project = projects.find(p => p.id === projectId);
          errors.push(project?.title || 'Unknown project');
        }
      }

      if (errors.length === 0) {
        toast({
          title: "Projects deleted",
          description: `${selectedProjects.size} project(s) deleted successfully.`,
        });
      } else {
        toast({
          title: "Partial success",
          description: `Some projects could not be deleted: ${errors.join(', ')}`,
          variant: "destructive",
        });
      }

      setSelectedProjects(new Set());
      onProjectsChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setBulkDeleteDialogOpen(false);
    }
  };

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No projects found</p>
          <Button asChild>
            <Link href="/admin/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              Create First Project
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const allSelected = projects.length > 0 && selectedProjects.size === projects.length;
  const someSelected = selectedProjects.size > 0 && selectedProjects.size < projects.length;

  return (
    <>
      <Card>
        <CardContent className="p-0">
          {/* Bulk Actions Bar */}
          {selectedProjects.size > 0 && (
            <div className="flex items-center justify-between p-4 bg-muted/50 border-b">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {selectedProjects.size} project(s) selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProjects(new Set())}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Selection
                </Button>
                                 <Select
                   value=""
                   onValueChange={(action) => handleBulkAction(action)}
                 >
                   <SelectTrigger className="w-[160px]">
                     <SelectValue placeholder="Bulk Actions" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="status-planned">Set to Planned</SelectItem>
                     <SelectItem value="status-active">Set to Active</SelectItem>
                     <SelectItem value="status-completed">Set to Completed</SelectItem>
                     <SelectItem value="delete">Delete Selected</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium w-12">
                    <Checkbox
                      checked={allSelected}
                      ref={(el) => {
                        if (el) {
                          const checkbox = el as any;
                          checkbox.indeterminate = someSelected;
                        }
                      }}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left p-4 font-medium">Project</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Tags</th>
                  <th className="text-left p-4 font-medium">Updated</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedProjects.has(project.id)}
                        onCheckedChange={(checked) => 
                          handleSelectProject(project.id, checked as boolean)
                        }
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {project.description || 'No description'}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <ProjectStatusBadge status={project.status} />
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground">
                        {project.tags || 'No tags'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${project.slug}`} target="_blank">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/projects/${project.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteProject(project)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProject}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Projects</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedProjects.size} project(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/projects');
      
      if (!response.ok) {
        throw new Error('Failed to load projects');
      }

      const data = await response.json();
      const sortedProjects = data.projects.sort((a: Project, b: Project) => {
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

      setProjects(sortedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Apply filters whenever projects, searchTerm, or statusFilter changes
  useEffect(() => {
    let filtered = projects;

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(search) ||
        (project.description && project.description.toLowerCase().includes(search)) ||
        (project.tags && project.tags.toLowerCase().includes(search))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter]);

  if (isLoading) {
    return <ProjectsLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your club's projects and initiatives
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Projects</CardTitle>
          <CardDescription>
            Search and filter your projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || statusFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
          {filteredProjects.length !== projects.length && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing {filteredProjects.length} of {projects.length} projects
            </p>
          )}
        </CardContent>
      </Card>

      {/* Projects Table */}
      <ProjectsTable projects={filteredProjects} onProjectsChange={loadProjects} />
    </div>
  );
}

function ProjectsLoadingSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminProjectsPage() {
  return <ProjectsManager />;
} 