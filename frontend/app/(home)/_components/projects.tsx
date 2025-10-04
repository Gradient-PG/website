import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { projectsRepo } from "@/lib/repositories";
import type { Project } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";

interface ProjectsProps extends React.HTMLProps<HTMLDivElement> {}

// Revalidate every 60 seconds to show new projects
export const revalidate = 60;

// Server component to fetch featured projects with members
async function getFeauturedProjects(): Promise<Project[]> {
  try {
    const projectsWithMembers = await projectsRepo.findAllWithMembers();
    // Group projects by status for featured display
    const statusOrder = { 'planned': 0, 'active': 1, 'completed': 2 };
    const sortedProjects = projectsWithMembers.sort((a, b) => {
      const aStatusOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
      const bStatusOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
      
      if (aStatusOrder !== bStatusOrder) {
        return aStatusOrder - bStatusOrder;
      }
      // Within same status, sort by display order
      return a.displayOrder - b.displayOrder;
    });
    
    return sortedProjects.slice(0, 6); // Get up to 6 featured projects
  } catch (error) {
    console.error('Failed to fetch featured projects with members:', error);
    // Fallback to projects without members
    try {
      return await projectsRepo.findFeatured(6);
    } catch (fallbackError) {
      console.error('Failed to fetch featured projects (fallback):', fallbackError);
      return [];
    }
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
              <CardFooter className="flex flex-col gap-3">
                {/* Team Members */}
                {project.members && project.members.length > 0 && (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-gray-600">Team:</span>
                    <div className="flex -space-x-1">
                      {project.members.slice(0, 3).map((assignment) => (
                        <Avatar
                          key={assignment.memberId}
                          src={assignment.member?.photoUrl}
                          base64={assignment.member?.photoBase64}
                          name={assignment.member?.name || 'Member'}
                          size="sm"
                          className="ring-2 ring-white"
                          alt={`${assignment.member?.name} photo`}
                        />
                      ))}
                      {project.members.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 ring-2 ring-white">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center w-full">
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
