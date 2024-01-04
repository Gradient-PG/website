import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import projectsFile from "@/public/data/projects.json";
import Image from "next/image";
import Link from "next/link";

interface ProjectsProps extends React.HTMLProps<HTMLDivElement> {}

const Projects: React.FC<ProjectsProps> = ({ ...props }) => {
  let projects_path = "/images/projects/";

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
        {projectsFile.projects.map((project, index) => {
          return (
            <Card className="" key={index}>
              <div className="relative h-44 w-full md:h-32">
                <Image
                  className="rounded-t-md object-cover"
                  src={projects_path + project.img}
                  alt={project.name}
                  fill
                />
              </div>
              <CardHeader className="">
                <CardTitle className="">{project.name}</CardTitle>
              </CardHeader>
              <CardFooter>
                <Button variant="link" size={"lg"} className="p-0">
                  <Link href={project.href}>Learn more {">"}</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Projects;
