'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Plus, Eye, Search, Filter, Trash2, Edit, ExternalLink, MoreVertical, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { Project } from '@/lib/types';
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
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SortableList } from '@/components/ui/sortable-list';

interface ProjectsTableProps {
  projects: Project[];
  onProjectsChange: () => void;
}

function ProjectStatusBadge({ status }: { status: string }) {
  const variants = {
    'planned': 'bg-orange-100 text-orange-800',
    'active': 'bg-green-100 text-green-800', 
    'completed': 'bg-blue-100 text-blue-800'
  };

  return (
    <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  );
}

function ProjectsTable({ projects, onProjectsChange }: ProjectsTableProps) {
  const { toast } = useToast();
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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

  const handleReorder = async (reorderedProjects: Project[]) => {
    try {
      // Create updates array with new display orders
      const updates = reorderedProjects.map((project, index) => ({
        id: project.id,
        displayOrder: index + 1
      }));

      const response = await fetch('/api/admin/projects/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateDisplayOrder',
          projectIds: updates.map(u => u.id),
          data: { updates }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project order');
      }

      toast({
        title: "Success",
        description: "Project order updated successfully.",
      });

      // Only refresh data from server after successful save
      onProjectsChange();
    } catch (error) {
      console.error('Error updating project order:', error);
      toast({
        title: "Error",
        description: "Failed to update project order. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to let SortableList handle the revert
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      toast({
        title: "Success",
        description: "Project deleted successfully.",
      });

      onProjectsChange();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setProjectToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setIsBulkDeleting(true);
      const response = await fetch('/api/admin/projects/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          projectIds: Array.from(selectedProjects),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete projects');
      }

      const result = await response.json();

      if (result.errors && result.errors.length > 0) {
        toast({
          title: "Partial Success",
          description: `${result.success.length} projects deleted, but ${result.errors.length} failed.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `${selectedProjects.size} projects deleted successfully.`,
        });
      }

      setSelectedProjects(new Set());
      onProjectsChange();
    } catch (error) {
      console.error('Error deleting projects:', error);
      toast({
        title: "Error",
        description: "Failed to delete projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch('/api/admin/projects/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateStatus',
          projectIds: Array.from(selectedProjects),
          data: { status: newStatus }
        }),
          });

          if (!response.ok) {
        throw new Error('Failed to update project status');
          }

      const result = await response.json();
      
      if (result.errors && result.errors.length > 0) {
        toast({
          title: "Partial Success",
          description: `${result.success.length} projects updated, but ${result.errors.length} failed.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `${selectedProjects.size} projects updated to ${newStatus}.`,
        });
      }

      setSelectedProjects(new Set());
      onProjectsChange();
    } catch (error) {
      console.error('Error updating project status:', error);
      toast({
        title: "Error",
        description: "Failed to update project status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Projects</CardTitle>
              <CardDescription>
                Manage your projects. Drag and drop to reorder.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
          {selectedProjects.size > 0 && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Update Status ({selectedProjects.size})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate('planned')}>
                        Set to Planned
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate('active')}>
                        Set to Active
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate('completed')}>
                        Set to Completed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={isBulkDeleting}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete ({selectedProjects.size})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Projects</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {selectedProjects.size} selected projects? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleBulkDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Projects
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No projects found.</p>
              <Button asChild>
                <Link href="/admin/projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first project
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All */}
              <div className="flex items-center space-x-2 pb-2 border-b">
                <Checkbox
                  checked={selectedProjects.size === projects.length && projects.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  Select All ({projects.length} projects)
                </span>
              </div>

              {/* Sortable Projects List */}
              <SortableList
                items={projects}
                onReorder={handleReorder}
                getItemId={(project) => project.id}
                className="space-y-2"
              >
                {(project) => (
                  <div className="flex items-center space-x-4 p-4 border rounded-lg bg-white hover:bg-gray-50">
                    <Checkbox
                      checked={selectedProjects.has(project.id)}
                      onCheckedChange={(checked) => 
                        handleSelectProject(project.id, checked as boolean)
                      }
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <h3 className="font-medium truncate">{project.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {project.description || 'No description'}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <ProjectStatusBadge status={project.status} />
                            {project.tags && (
                              <span className="text-xs text-muted-foreground">
                                {project.tags}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/projects/${project.slug}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/projects/${project.id}/members`}>
                          <Users className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/projects/${project.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/projects/${project.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/projects/${project.id}/members`}>
                              <Users className="h-4 w-4 mr-2" />
                              Manage Team
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${project.slug}`} target="_blank">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setProjectToDelete(project.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}
              </SortableList>
          </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Project'}
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
            Manage your club's projects and initiatives.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/projects" target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              View Projects Page
            </Link>
          </Button>
        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find specific projects or filter by status.
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      
    <Card>
      <CardContent className="p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg mb-2">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
          ))}
      </CardContent>
    </Card>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<ProjectsLoadingSkeleton />}>
      <ProjectsManager />
    </Suspense>
  );
} 