import { projectsRepo } from "@/lib/repositories";
import type { Project } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

// Revalidate every 60 seconds
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects | Gradient Science Club",
  description: "Explore our current and completed research projects, workshops, and initiatives.",
};

// Server component to fetch all projects
async function getAllProjects(): Promise<Project[]> {
  try {
    return await projectsRepo.findAll();
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}

// Helper function to parse JSON links
function parseLinks(links?: string): { [key: string]: string } {
  if (!links) return {};
  try {
    return JSON.parse(links);
  } catch {
    return {};
  }
}

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  // Group projects by status
  const activeProjects = projects.filter(p => p.status === 'active');
  const plannedProjects = projects.filter(p => p.status === 'planned');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back to Home Button */}
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Projects</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover the innovative research projects, workshops, and initiatives 
          that drive our science club forward.
        </p>
      </div>

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-green-600">Active Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Planned Projects */}
      {plannedProjects.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-orange-600">Planned Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plannedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-blue-600">Completed Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* No projects message */}
      {projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No projects available at the moment. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}

// Project card component
function ProjectCard({ project }: { project: Project }) {
  const links = parseLinks(project.links);
  const tags = project.tags ? project.tags.split(',').map(tag => tag.trim()) : [];

  return (
    <Card className="h-full flex flex-col">
      <div className="relative h-48 w-full">
        <Image
          className="rounded-t-lg object-cover"
          src={project.imageBase64 || project.imageUrl || "/images/placeholder-project.jpg"}
          alt={project.title}
          fill
        />
      </div>
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{project.title}</CardTitle>
          <span className={cn(
            "px-2 py-1 text-xs rounded-full font-medium",
            project.status === 'active' && "bg-green-100 text-green-800",
            project.status === 'completed' && "bg-blue-100 text-blue-800", 
            project.status === 'planned' && "bg-orange-100 text-orange-800"
          )}>
            {project.status}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {project.description || 'No description provided.'}
        </p>
        
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Links */}
        {Object.keys(links).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(links).slice(0, 2).map(([type, url]) => (
              <a
                key={type}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {type}
              </a>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/projects/${project.slug}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 