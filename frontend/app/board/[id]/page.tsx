import { boardMembersRepo } from "@/lib/repositories";
import type { BoardMember, Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ArrowLeft, Mail, Github, Linkedin, Twitter, ExternalLink } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import dbConnect from "@/lib/mongodb";
import ProjectMember from "@/lib/models/ProjectMember";

interface MemberPageProps {
  params: {
    id: string;
  };
}

// Server component to fetch member by ID with projects
async function getMemberWithProjects(id: string): Promise<{member: BoardMember, projects: any[]} | null> {
  try {
    const member = await boardMembersRepo.findById(id);
    if (!member) return null;

    // Get member's projects
    await dbConnect();
    const memberProjects = await ProjectMember.find({ memberId: id })
      .populate({
        path: 'projectId',
        select: 'title slug description imageUrl imageBase64 tags status links displayOrder'
      })
      .sort({ joinedAt: 1 })
      .lean();

    const formattedProjects = memberProjects.map((mp: any) => ({
      id: mp._id.toString(),
      projectId: mp.projectId._id.toString(),
      memberId: mp.memberId.toString(),
      role: mp.role as 'member' | 'coordinator',
      joinedAt: mp.joinedAt.toISOString(),
      project: {
        id: mp.projectId._id.toString(),
        title: mp.projectId.title,
        slug: mp.projectId.slug,
        description: mp.projectId.description,
        imageUrl: mp.projectId.imageUrl || '',
        imageBase64: mp.projectId.imageBase64 || '',
        tags: mp.projectId.tags || '',
        status: mp.projectId.status,
        links: mp.projectId.links || '',
        displayOrder: mp.projectId.displayOrder,
        createdAt: mp.projectId.createdAt?.toISOString ? mp.projectId.createdAt.toISOString() : mp.projectId.createdAt,
        updatedAt: mp.projectId.updatedAt?.toISOString ? mp.projectId.updatedAt.toISOString() : mp.projectId.updatedAt,
      }
    }));

    return { member, projects: formattedProjects };
  } catch (error) {
    console.error('Failed to fetch member with projects:', error);
    return null;
  }
}

// Helper function to parse JSON socials
function parseSocials(socials?: string): { [key: string]: string } {
  if (!socials) return {};
  try {
    return JSON.parse(socials);
  } catch {
    return {};
  }
}

// Helper function to get social media icon
function getSocialIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case 'github':
      return <Github className="w-4 h-4" />;
    case 'linkedin':
      return <Linkedin className="w-4 h-4" />;
    case 'twitter':
      return <Twitter className="w-4 h-4" />;
    case 'email':
      return <Mail className="w-4 h-4" />;
    default:
      return <ExternalLink className="w-4 h-4" />;
  }
}

// Helper function to format social URL
function formatSocialUrl(platform: string, value: string): string {
  switch (platform.toLowerCase()) {
    case 'email':
      return `mailto:${value}`;
    case 'github':
      return value.startsWith('http') ? value : `https://github.com/${value}`;
    case 'linkedin':
      return value.startsWith('http') ? value : `https://linkedin.com/in/${value}`;
    case 'twitter':
      return value.startsWith('http') ? value : `https://twitter.com/${value}`;
    default:
      return value.startsWith('http') ? value : `https://${value}`;
  }
}

// Generate metadata
export async function generateMetadata({ params }: MemberPageProps): Promise<Metadata> {
  const data = await getMemberWithProjects(params.id);
  
  if (!data) {
    return {
      title: "Member Not Found | Gradient Science Club",
    };
  }

  return {
    title: `${data.member.name} | Gradient Science Club`,
    description: data.member.bio || `Learn more about ${data.member.name}, ${data.member.role} at Gradient Science Club.`,
  };
}

export default async function MemberPage({ params }: MemberPageProps) {
  const data = await getMemberWithProjects(params.id);

  if (!data) {
    notFound();
  }

  const { member, projects } = data;
  const socials = parseSocials(member.socials);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/board">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Team
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Member Profile */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative mx-auto mb-6">
                <Avatar
                  src={member.photoUrl}
                  base64={member.photoBase64}
                  name={member.name}
                  size="xl"
                  alt={`${member.name} photo`}
                  className="mx-auto"
                />
              </div>
              
              <h1 className="text-2xl font-bold mb-2">{member.name}</h1>
              <p className="text-lg text-primary font-medium mb-4">{member.role}</p>
              
              {member.bio && (
                <p className="text-muted-foreground text-sm mb-6 text-justify">
                  {member.bio}
                </p>
              )}

              {/* Social links */}
              {Object.keys(socials).length > 0 && (
                <div className="flex flex-wrap gap-3 justify-center">
                  {Object.entries(socials)
                    .filter(([_, url]) => url) // Filter out empty values
                    .map(([platform, url]) => (
                    <a
                      key={platform}
                      href={formatSocialUrl(platform, url!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                      title={`${member.name} on ${platform}`}
                    >
                      {getSocialIcon(platform)}
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Member Projects */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Projects</h2>
            <p className="text-muted-foreground">
              Projects that {member.name} is currently working on or has contributed to.
            </p>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((assignment) => (
                <ProjectCard key={assignment.projectId} assignment={assignment} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  {member.name} is not currently assigned to any projects.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Project card component for member page
function ProjectCard({ assignment }: { assignment: any }) {
  const project = assignment.project;
  const tags = project.tags ? project.tags.split(',').map((tag: string) => tag.trim()) : [];

  return (
    <Card className="h-full flex flex-col">
      <div className="relative h-32 w-full">
        <Image
          className="rounded-t-lg object-cover"
          src={project.imageBase64 || project.imageUrl || "/images/placeholder-project.jpg"}
          alt={project.title}
          fill
        />
      </div>
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{project.title}</CardTitle>
          <span className={cn(
            "px-2 py-1 text-xs rounded-full font-medium",
            project.status === 'active' && "bg-green-100 text-green-800",
            project.status === 'completed' && "bg-blue-100 text-blue-800", 
            project.status === 'planned' && "bg-orange-100 text-orange-800"
          )}>
            {project.status}
          </span>
        </div>
        <p className="text-sm text-primary font-medium capitalize">
          {assignment.role}
        </p>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
          {project.description || 'No description provided.'}
        </p>
        
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag: string, index: number) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{tags.length - 2}
              </span>
            )}
          </div>
        )}
      </CardContent>

      <div className="p-6 pt-0">
        <Button asChild className="w-full" size="sm">
          <Link href={`/projects/${project.slug}`}>
            View Project
          </Link>
        </Button>
      </div>
    </Card>
  );
} 