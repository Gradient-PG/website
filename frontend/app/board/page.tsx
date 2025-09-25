import { boardMembersRepo } from "@/lib/repositories";
import type { BoardMember, MemberSocials } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Avatar from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Mail, Linkedin, Github, Twitter, Globe, ExternalLink, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Board Members | Gradient Science Club",
  description: "Meet the passionate leaders driving our science club forward.",
};

// Server component to fetch active board members
async function getActiveBoardMembers(): Promise<BoardMember[]> {
  try {
    return await boardMembersRepo.findActive();
  } catch (error) {
    console.error('Failed to fetch board members:', error);
    return [];
  }
}

// Helper function to parse JSON socials
function parseSocials(socials?: string): MemberSocials {
  if (!socials) return {};
  try {
    return JSON.parse(socials);
  } catch {
    return {};
  }
}

// Helper to get social media icon
function getSocialIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case 'email':
      return <Mail className="w-4 h-4" />;
    case 'linkedin':
      return <Linkedin className="w-4 h-4" />;
    case 'github':
      return <Github className="w-4 h-4" />;
    case 'twitter':
      return <Twitter className="w-4 h-4" />;
    case 'website':
      return <Globe className="w-4 h-4" />;
    default:
      return <ExternalLink className="w-4 h-4" />;
  }
}

// Helper to format social media URL
function formatSocialUrl(platform: string, value: string): string {
  if (platform === 'email') {
    return value.includes('@') ? `mailto:${value}` : value;
  }
  return value.startsWith('http') ? value : `https://${value}`;
}

export default async function BoardPage() {
  const boardMembers = await getActiveBoardMembers();

  // Group members by leadership vs regular members
  const leadershipRoles = ['President', 'Vice President', 'Secretary', 'Treasurer'];
  const leadership = boardMembers.filter(member => 
    leadershipRoles.includes(member.role)
  );
  const otherMembers = boardMembers.filter(member => 
    !leadershipRoles.includes(member.role)
  );

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back to Home Button */}
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Board</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Meet the passionate students leading our science club and driving 
          innovation in research, education, and collaboration.
        </p>
      </div>

      {/* Leadership Team */}
      {leadership.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-primary">Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership
              .sort((a, b) => {
                const order = { 'President': 0, 'Vice President': 1, 'Secretary': 2, 'Treasurer': 3 };
                return (order[a.role as keyof typeof order] || 99) - (order[b.role as keyof typeof order] || 99);
              })
              .map((member) => (
                <BoardMemberCard key={member.id} member={member} featured={true} />
              ))}
          </div>
        </section>
      )}

      {/* Other Members */}
      {otherMembers.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Team Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherMembers.map((member) => (
              <BoardMemberCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}

      {/* No members message */}
      {boardMembers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Board member information will be available soon.
          </p>
        </div>
      )}

      {/* Call to action */}
      <div className="text-center mt-16 p-8 bg-gray-50 rounded-lg">
        <h3 className="text-2xl font-bold mb-4">Interested in Joining Our Team?</h3>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          We're always looking for passionate students to join our board and help 
          lead exciting scientific initiatives. Reach out to learn about opportunities!
        </p>
        <Button size="lg">
          Contact Leadership
        </Button>
      </div>
    </div>
  );
}

// Board member card component
function BoardMemberCard({ member, featured = false }: { member: BoardMember; featured?: boolean }) {
  const socials = parseSocials(member.socials);

  return (
    <Card className={`h-full flex flex-col ${featured ? 'border-primary shadow-lg' : ''}`}>
      <CardHeader className="text-center">
        <div className="relative mx-auto mb-4">
          <Avatar
            src={member.photoUrl}
            name={member.name}
            size={featured ? 'xl' : 'lg'}
            alt={`${member.name} photo`}
          />
        </div>
        
        <CardTitle className={featured ? "text-xl" : "text-lg"}>{member.name}</CardTitle>
        <p className={`font-semibold text-primary ${featured ? 'text-base' : 'text-sm'}`}>
          {member.role}
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {member.bio && (
          <p className="text-muted-foreground text-sm mb-4 flex-1">
            {member.bio}
          </p>
        )}

        {/* Social links */}
        {Object.keys(socials).length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mt-auto">
                         {Object.entries(socials)
               .filter(([_, url]) => url) // Filter out empty values
               .slice(0, 4) // Limit to 4 social links
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
  );
} 