import { projectsRepo } from "@/lib/repositories";
import type { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ArrowLeft, ExternalLink, Github, Globe, FileText } from "lucide-react";

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

// Server component to fetch project by slug
async function getProject(slug: string): Promise<Project | null> {
  try {
    return await projectsRepo.findBySlug(slug);
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await getProject(params.slug);
  
  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.title} | Gradient Science Club`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.imageUrl ? [project.imageUrl] : [],
    },
  };
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

// Helper to get link icon
function getLinkIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'github':
      return <Github className="w-4 h-4" />;
    case 'website':
    case 'demo':
      return <Globe className="w-4 h-4" />;
    case 'paper':
    case 'materials':
    case 'resources':
      return <FileText className="w-4 h-4" />;
    default:
      return <ExternalLink className="w-4 h-4" />;
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProject(params.slug);

  if (!project) {
    notFound();
  }

  const links = parseLinks(project.links);
  const tags = project.tags ? project.tags.split(',').map(tag => tag.trim()) : [];

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/projects">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-4xl font-bold">{project.title}</h1>
              <span className={cn(
                "px-3 py-1 text-sm rounded-full font-medium",
                project.status === 'active' && "bg-green-100 text-green-800",
                project.status === 'completed' && "bg-blue-100 text-blue-800", 
                project.status === 'planned' && "bg-orange-100 text-orange-800"
              )}>
                {project.status}
              </span>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Featured image */}
          {project.imageUrl && (
            <div className="relative h-64 md:h-96 w-full mb-8 rounded-lg overflow-hidden">
              <Image
                className="object-cover"
                src={project.imageUrl}
                alt={project.title}
                fill
                priority
              />
            </div>
          )}

          {/* Description */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">About This Project</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Project Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <p className="font-medium capitalize">{project.status}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Created</span>
                  <p className="font-medium">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Last Updated</span>
                  <p className="font-medium">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          {Object.keys(links).length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Related Links</h3>
                <div className="space-y-3">
                  {Object.entries(links).map(([type, url]) => (
                    <a
                      key={type}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      {getLinkIcon(type)}
                      <span className="font-medium capitalize">{type}</span>
                      <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call to action */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-2">Interested in this project?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Join our science club to participate in exciting projects like this one.
              </p>
              <Button asChild className="w-full">
                <Link href="/board">Contact Us</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 