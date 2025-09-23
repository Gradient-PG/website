import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { projectsRepo } from '@/lib/repositories';
import type { Project } from '@/lib/types';

interface ProjectsTableProps {
  projects: Project[];
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

function ProjectsTable({ projects }: ProjectsTableProps) {
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

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
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
                    <div>
                      <div className="font-medium">{project.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
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
                        <DropdownMenuItem className="text-red-600">
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
  );
}

async function ProjectsList() {
  try {
    const projects = await projectsRepo.findAll();
    
    // Sort by displayOrder, then by updatedAt
    const sortedProjects = projects.sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return <ProjectsTable projects={sortedProjects} />;
  } catch (error) {
    console.error('Error loading projects:', error);
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Error loading projects</p>
        </CardContent>
      </Card>
    );
  }
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
                className="max-w-sm"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Suspense fallback={<ProjectsLoadingSkeleton />}>
        <ProjectsList />
      </Suspense>
    </div>
  );
} 