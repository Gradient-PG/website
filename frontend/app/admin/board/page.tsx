import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
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
import { boardMembersRepo } from '@/lib/repositories';
import type { BoardMember } from '@/lib/types';

interface BoardMembersTableProps {
  members: BoardMember[];
}

function MemberStatusBadge({ active }: { active: boolean }) {
  return (
    <Badge 
      variant="outline" 
      className={active 
        ? 'bg-green-100 text-green-800 border-green-200' 
        : 'bg-gray-100 text-gray-800 border-gray-200'
      }
    >
      {active ? 'Active' : 'Inactive'}
    </Badge>
  );
}

function BoardMembersTable({ members }: BoardMembersTableProps) {
  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No board members found</p>
          <Button asChild>
            <Link href="/admin/board/new">
              <Plus className="h-4 w-4 mr-2" />
              Add First Board Member
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
                <th className="text-left p-4 font-medium">Member</th>
                <th className="text-left p-4 font-medium">Role</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Order</th>
                <th className="text-left p-4 font-medium">Updated</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      {member.photoUrl && (
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{member.name}</div>
                        {member.bio && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {member.bio}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{member.role}</div>
                  </td>
                  <td className="p-4">
                    <MemberStatusBadge active={member.active} />
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-muted-foreground">
                      {member.displayOrder}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-muted-foreground">
                      {new Date(member.updatedAt).toLocaleDateString()}
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
                          <Link href="/board" target="_blank">
                            <Eye className="h-4 w-4 mr-2" />
                            View on Site
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/board/${member.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {member.active ? (
                          <DropdownMenuItem className="text-orange-600">
                            <UserX className="h-4 w-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-600">
                            <UserCheck className="h-4 w-4 mr-2" />
                            Activate
                          </DropdownMenuItem>
                        )}
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

async function BoardMembersList() {
  try {
    const members = await boardMembersRepo.findAll();
    
    // Sort by displayOrder, then by name
    const sortedMembers = members.sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return a.name.localeCompare(b.name);
    });

    return <BoardMembersTable members={sortedMembers} />;
  } catch (error) {
    console.error('Error loading board members:', error);
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Error loading board members</p>
        </CardContent>
      </Card>
    );
  }
}

function BoardMembersLoadingSkeleton() {
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

export default function AdminBoardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Board Members</h1>
          <p className="text-muted-foreground">
            Manage your club's board members and leadership team
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/board/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">---</div>
            <p className="text-xs text-muted-foreground">Currently serving</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leadership Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">---</div>
            <p className="text-xs text-muted-foreground">Executive positions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">---</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Members</CardTitle>
          <CardDescription>
            Search and filter your board members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search members..."
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

      {/* Board Members Table */}
      <Suspense fallback={<BoardMembersLoadingSkeleton />}>
        <BoardMembersList />
      </Suspense>
    </div>
  );
} 