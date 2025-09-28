import React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { boardMembersRepo } from "@/lib/repositories/boardMembers";
import type { BoardMember } from "@/lib/types";
import Avatar from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface BoardProps {
  className?: string;
}

interface MemberSocials {
  [key: string]: string;
}

// Revalidate every 60 seconds to show new members
export const revalidate = 60;

// Server component to fetch active board members grouped by role type
async function getActiveBoardMembersGrouped(): Promise<{
  boardMembers: BoardMember[];
  coordinators: BoardMember[];
}> {
  try {
    return await boardMembersRepo.findGroupedByRoleType(true);
  } catch (error) {
    console.error('Failed to fetch board members:', error);
    return { boardMembers: [], coordinators: [] };
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

const Board: React.FC<BoardProps> = async ({ ...props }) => {
  const { boardMembers, coordinators } = await getActiveBoardMembersGrouped();
  const totalMembers = boardMembers.length + coordinators.length;

  return (
    <div
      className={cn("container flex flex-col justify-center", props.className)}
    >
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold">Our Team</h1>
      </div>
      
      {/* Board Members Section */}
      {boardMembers.length > 0 && (
        <div className="mt-8 md:mt-12">
          <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4 md:mb-6 text-center">Board Members</h2>
          <div className="grid grid-cols-1 gap-3 md:gap-4 px-2 md:px-4 md:grid-cols-3">
            {boardMembers
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((member) => {
                const socials = parseSocials(member.socials);
                return (
                  <div
                    className="flex flex-row items-center gap-3 md:gap-5 rounded-md bg-neutral-100 p-3 md:p-4 py-4 md:py-5"
                    key={member.id}
                  >
                    <Avatar
                      src={member.photoUrl}
                      base64={member.photoBase64}
                      name={member.name}
                      size="lg"
                      alt={`${member.name} photo`}
                    />
                    <div className="flex flex-col rounded-md flex-1">
                      <h1 className="text-lg md:text-xl font-bold text-neutral-900">
                        {member.name}
                      </h1>
                      <h2 className="text-sm md:text-base font-semibold text-primary">
                        {member.role}
                      </h2>
                      {member.bio && (
                        <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Coordinators Section */}
      {coordinators.length > 0 && (
        <div className="mt-8 md:mt-12">
          <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4 md:mb-6 text-center">Coordinators</h2>
          <div className="grid grid-cols-1 gap-3 md:gap-4 px-2 md:px-4 md:grid-cols-3">
            {coordinators
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((member) => {
          const socials = parseSocials(member.socials);
          return (
            <div
                    className="flex flex-row items-center gap-3 md:gap-5 rounded-md bg-neutral-100 p-3 md:p-4 py-4 md:py-5"
              key={member.id}
            >
              <Avatar
                src={member.photoUrl}
                base64={member.photoBase64}
                name={member.name}
                size="lg"
                alt={`${member.name} photo`}
              />
              <div className="flex flex-col rounded-md flex-1">
                      <h1 className="text-lg md:text-xl font-bold text-neutral-900">
                  {member.name}
                </h1>
                      <h2 className="text-sm md:text-base font-semibold text-primary">
                  {member.role}
                </h2>
                {member.bio && (
                        <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">
                    {member.bio}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
        </div>
      )}

      {totalMembers === 0 && (
        <div className="text-center mt-8">
          <p className="text-muted-foreground">No team member information available.</p>
        </div>
      )}
      
      {/* View All Board Members Button */}
      {totalMembers > 0 && (
        <div className="flex justify-center mt-8">
          <Button asChild variant="outline">
            <Link href="/board">
              Meet the Full Team
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Board;
