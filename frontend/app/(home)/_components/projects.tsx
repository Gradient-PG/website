import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { projectsRepo } from "@/lib/repositories";
import type { Project } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

interface ProjectsProps extends React.HTMLProps<HTMLDivElement> {}

// Server component to fetch featured projects
async function getFeauturedProjects(): Promise<Project[]> {
  try {
    return await projectsRepo.findFeatured(6); // Get up to 6 featured projects
  } catch (error) {
    console.error('Failed to fetch featured projects:', error);
    return [];
  }
}

const Projects: React.FC<ProjectsProps> = async ({ ...props }) => {
  const projects = await getFeauturedProjects();

  return (
    <div
      className={cn("align-center container flex flex-col", props.className)}
      id="projects"
    >
      <div className="flex flex-col justify-center text-center">
        <h1 className="font-bold text-secondary">CHECK OUT</h1>
        <h2 className="text-3xl font-bold">OUR PROJECTS</h2>
      </div>
      <div
        className={cn(
          "mt-12 flex flex-col flex-wrap gap-4 p-4 md:grid md:grid-cols-3",
        )}
      >
        {projects.map((project) => {
          return (
            <Card className="" key={project.id}>
              <div className="relative h-44 w-full md:h-32">
                <Image
                  className="rounded-t-md object-cover"
                  src={project.imageBase64 || project.imageUrl || "/images/placeholder-project.jpg"}
                  alt={project.title}
                  fill
                />
              </div>
              <CardHeader className="">
                <CardTitle className="">{project.title}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>
              </CardHeader>
              <CardFooter className="flex justify-between items-center">
                <Button variant="link" size={"lg"} className="p-0">
                  <Link href={`/projects/${project.slug}`}>Learn more {">"}</Link>
                </Button>
                <div className="flex gap-1">
                  <span className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    project.status === 'active' && "bg-green-100 text-green-800",
                    project.status === 'completed' && "bg-blue-100 text-blue-800", 
                    project.status === 'planned' && "bg-orange-100 text-orange-800"
                  )}>
                    {project.status}
                  </span>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {projects.length === 0 && (
        <div className="text-center mt-8">
          <p className="text-muted-foreground">No projects available at the moment.</p>
        </div>
      )}
      
      {/* View All Projects Button */}
      {projects.length > 0 && (
        <div className="text-center mt-8">
          <Button asChild size="lg">
            <Link href="/projects">
              View All Projects
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Projects;
