import React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { boardMembersRepo } from "@/lib/repositories";
import type { BoardMember, MemberSocials } from "@/lib/types";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface BoardProps extends React.HTMLProps<HTMLDivElement> {}

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

const Board: React.FC<BoardProps> = async ({ ...props }) => {
  const boardMembers = await getActiveBoardMembers();

  return (
    <div
      className={cn("container flex flex-col justify-center", props.className)}
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold">Our Board</h1>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-4 px-4 md:grid-cols-3">
        {boardMembers.map((member) => {
          const socials = parseSocials(member.socials);
          return (
            <div
              className="flex flex-row items-center gap-5 rounded-md bg-neutral-100 p-4 py-5"
              key={member.id}
            >
              <div className="relative rounded-full bg-primary w-16 h-16 overflow-hidden">
                {member.photoUrl ? (
                <Image
                    alt={`${member.name} photo`}
                    fill
                    className="object-cover"
                    src={member.photoUrl}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-primary text-white font-bold text-xl">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex flex-col rounded-md flex-1">
                <h1 className="text-xl font-bold text-neutral-900">
                  {member.name}
                </h1>
                <h2 className="font-semibold text-primary">
                  {member.role}
                </h2>
                {member.bio && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {member.bio}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {boardMembers.length === 0 && (
        <div className="text-center mt-8">
          <p className="text-muted-foreground">No board members information available.</p>
        </div>
      )}
      
      {/* View All Board Members Button */}
      {boardMembers.length > 0 && (
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
