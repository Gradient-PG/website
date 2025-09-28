'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Plus, Eye, Search, Filter, Trash2, Edit, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { BoardMember } from '@/lib/types';
import Avatar from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SortableList } from '@/components/ui/sortable-list';

interface BoardMembersTableProps {
  members: BoardMember[];
  onMembersChange: () => void;
}

function MemberStatusBadge({ active }: { active: boolean }) {
  return (
    <Badge className={active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
      {active ? 'Active' : 'Inactive'}
    </Badge>
  );
}

function MemberRoleTypeBadge({ roleType }: { roleType: 'board_member' | 'coordinator' | 'member' }) {
  const getBadgeStyle = () => {
    switch (roleType) {
      case 'board_member':
        return 'bg-blue-100 text-blue-800';
      case 'coordinator':
        return 'bg-purple-100 text-purple-800';
      case 'member':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisplayName = () => {
    switch (roleType) {
      case 'board_member':
        return 'Board Member';
      case 'coordinator':
        return 'Coordinator';
      case 'member':
        return 'Member';
      default:
        return roleType;
    }
  };

  return (
    <Badge className={getBadgeStyle()}>
      {getDisplayName()}
    </Badge>
  );
}

function BoardMembersTable({ members, onMembersChange }: BoardMembersTableProps) {
  const { toast } = useToast();
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const handleSelectMember = (memberId: string, checked: boolean) => {
    const newSelected = new Set(selectedMembers);
    if (checked) {
      newSelected.add(memberId);
    } else {
      newSelected.delete(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(new Set(members.map(m => m.id)));
    } else {
      setSelectedMembers(new Set());
    }
  };

  const handleReorder = async (reorderedMembers: BoardMember[]) => {
    try {
      // Create updates array with new display orders
      const updates = reorderedMembers.map((member, index) => ({
        id: member.id,
        displayOrder: index + 1
      }));

      const response = await fetch('/api/admin/board/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateDisplayOrder',
          memberIds: updates.map(u => u.id),
          data: { updates }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update member order');
      }

      toast({
        title: "Success",
        description: "Member order updated successfully.",
      });

      // Only refresh data from server after successful save
      onMembersChange();
    } catch (error) {
      console.error('Error updating member order:', error);
      toast({
        title: "Error",
        description: "Failed to update member order. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to let SortableList handle the revert
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/board/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete member');
      }

      toast({
        title: "Success",
        description: "Board member deleted successfully.",
      });

      onMembersChange();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: "Error",
        description: "Failed to delete member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setMemberToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setIsBulkDeleting(true);
      const response = await fetch('/api/admin/board/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          memberIds: Array.from(selectedMembers),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete members');
      }

      const result = await response.json();
      
      if (result.errors && result.errors.length > 0) {
        toast({
          title: "Partial Success",
          description: `${result.success.length} members deleted, but ${result.errors.length} failed.`,
          variant: "destructive",
        });
      } else {
      toast({
          title: "Success",
          description: `${selectedMembers.size} members deleted successfully.`,
      });
      }

      setSelectedMembers(new Set());
      onMembersChange();
    } catch (error) {
      console.error('Error deleting members:', error);
      toast({
        title: "Error",
        description: "Failed to delete members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkStatusUpdate = async (active: boolean) => {
    try {
      setIsBulkUpdating(true);
      const response = await fetch('/api/admin/board/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateStatus',
          memberIds: Array.from(selectedMembers),
          data: { active },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update member status');
      }

      const result = await response.json();
      
      if (result.errors && result.errors.length > 0) {
        toast({
          title: "Partial Success",
          description: `Updated ${result.success.length} members, ${result.errors.length} failed.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Updated ${result.success.length} members to ${active ? 'active' : 'inactive'}.`,
        });
      }

      setSelectedMembers(new Set());
      onMembersChange();
    } catch (error) {
      console.error('Error updating member status:', error);
      toast({
        title: "Error",
        description: "Failed to update member status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkRoleTypeUpdate = async (roleType: 'board_member' | 'coordinator' | 'member') => {
    try {
      setIsBulkUpdating(true);
      const response = await fetch('/api/admin/board/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateRoleType',
          memberIds: Array.from(selectedMembers),
          data: { roleType },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update member role type');
      }

      const result = await response.json();
      
      if (result.errors && result.errors.length > 0) {
        toast({
          title: "Partial Success",
          description: `Updated ${result.success.length} members, ${result.errors.length} failed.`,
          variant: "destructive",
        });
      } else {
        const roleTypeNames = {
          'board_member': 'Board Member',
          'coordinator': 'Coordinator',
          'member': 'Member'
        };
        toast({
          title: "Success",
          description: `Updated ${result.success.length} members to ${roleTypeNames[roleType]}.`,
        });
      }

      setSelectedMembers(new Set());
      onMembersChange();
    } catch (error) {
      console.error('Error updating member role type:', error);
      toast({
        title: "Error",
        description: "Failed to update member role type. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Board Members</CardTitle>
              <CardDescription>
                Manage your board members and coordinators. Drag and drop to reorder.
              </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
              {selectedMembers.size > 0 && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" disabled={isBulkUpdating}>
                        Update Status ({selectedMembers.size})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate(true)}>
                        Set to Active
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate(false)}>
                        Set to Inactive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" disabled={isBulkUpdating}>
                        Change Role ({selectedMembers.size})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBulkRoleTypeUpdate('board_member')}>
                        Set to Board Member
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkRoleTypeUpdate('coordinator')}>
                        Set to Coordinator
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkRoleTypeUpdate('member')}>
                        Set to Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isBulkDeleting}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete ({selectedMembers.size})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Board Members</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {selectedMembers.size} selected members? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleBulkDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Members
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
              
              <Button asChild>
                <Link href="/admin/board/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Member
                </Link>
                </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No board members found.</p>
              <Button asChild>
                <Link href="/admin/board/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first member
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All */}
              <div className="flex items-center space-x-2 pb-2 border-b">
                    <Checkbox
                  checked={selectedMembers.size === members.length && members.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                <span className="text-sm font-medium">
                  Select All ({members.length} members)
                </span>
              </div>

              {/* Sortable Members List */}
              <SortableList
                items={members}
                onReorder={handleReorder}
                getItemId={(member) => member.id}
                className="space-y-2"
              >
                {(member) => (
                  <div className="flex items-center space-x-4 p-4 border rounded-lg bg-white hover:bg-gray-50">
                      <Checkbox
                        checked={selectedMembers.has(member.id)}
                        onCheckedChange={(checked) => 
                          handleSelectMember(member.id, checked as boolean)
                        }
                      />
                    
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <Avatar
                          src={member.photoUrl}
                          base64={member.photoBase64}
                          name={member.name}
                          size="md"
                        />
                      <div className="flex-1">
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                          {member.bio && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {member.bio}
                          </p>
                          )}
                        <div className="flex items-center space-x-2 mt-1">
                          <MemberStatusBadge active={member.active} />
                          <MemberRoleTypeBadge roleType={member.roleType} />
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {new Date(member.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/board/${member.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/board/${member.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setMemberToDelete(member.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}
              </SortableList>
          </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this board member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToDelete && handleDeleteMember(memberToDelete)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function BoardMembersManager() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const { toast } = useToast();

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/board');
      
      if (!response.ok) {
        throw new Error('Failed to load board members');
      }

      const data = await response.json();
      const sortedMembers = data.members.sort((a: BoardMember, b: BoardMember) => {
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

      setMembers(sortedMembers);
    } catch (error) {
      console.error('Error loading board members:', error);
      toast({
        title: "Error",
        description: "Failed to load board members. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  // Apply filters whenever members, searchTerm, statusFilter, or roleFilter changes
  useEffect(() => {
    let filtered = members;

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(search) ||
        member.role.toLowerCase().includes(search) ||
        (member.bio && member.bio.toLowerCase().includes(search))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => 
        statusFilter === 'active' ? member.active : !member.active
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.roleType === roleFilter);
    }

    setFilteredMembers(filtered);
  }, [members, searchTerm, statusFilter, roleFilter]);

  if (isLoading) {
    return <BoardMembersLoadingSkeleton />;
  }

  // Calculate stats by member type
  const boardMembers = members.filter(m => m.roleType === 'board_member');
  const coordinators = members.filter(m => m.roleType === 'coordinator');
  const regularMembers = members.filter(m => m.roleType === 'member');
  const activeMembers = members.filter(m => m.active).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground">
            Manage your club's board members, coordinators, and team members
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Board Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boardMembers.filter(m => m.active).length}</div>
            <p className="text-xs text-muted-foreground">{boardMembers.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coordinators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coordinators.filter(m => m.active).length}</div>
            <p className="text-xs text-muted-foreground">{coordinators.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regularMembers.filter(m => m.active).length}</div>
            <p className="text-xs text-muted-foreground">{regularMembers.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMembers}</div>
            <p className="text-xs text-muted-foreground">{members.length} total</p>
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
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="board_member">Board Member</SelectItem>
                <SelectItem value="coordinator">Coordinator</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(searchTerm || statusFilter !== 'all' || roleFilter !== 'all') && (
            <div className="mt-2 text-sm text-muted-foreground">
              Showing {filteredMembers.length} of {members.length} members
            </div>
          )}
        </CardContent>
      </Card>

      {/* Board Members Table */}
      <BoardMembersTable members={filteredMembers} onMembersChange={loadMembers} />
    </div>
  );
}

function BoardMembersLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
    </div>
  );
}

export default function AdminBoardPage() {
  return <BoardMembersManager />;
} 