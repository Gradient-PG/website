'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, UserCheck, UserX, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Avatar from '@/components/ui/avatar';
import type { BoardMember } from '@/lib/types';

interface BoardMembersTableProps {
  members: BoardMember[];
  onMembersChange: () => void;
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

function BoardMembersTable({ members, onMembersChange }: BoardMembersTableProps) {
  const { toast } = useToast();
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<BoardMember | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteMember = async (member: BoardMember) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/board/${memberToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete board member');
      }

      toast({
        title: "Board member deleted",
        description: `${memberToDelete.name} has been deleted successfully.`,
      });

      onMembersChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete board member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  const handleBulkDelete = () => {
    if (selectedMembers.size === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkAction = (action: string) => {
    if (selectedMembers.size === 0) {
      toast({
        title: "No selection",
        description: "Please select board members first.",
        variant: "destructive",
      });
      return;
    }

    if (action === 'delete') {
      handleBulkDelete();
      return;
    }

    // Handle status changes
    performBulkAction(action);
  };

  const performBulkAction = async (action: string) => {
    try {
      const response = await fetch('/api/admin/board/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          memberIds: Array.from(selectedMembers),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} board members`);
      }

      const data = await response.json();
      
      toast({
        title: "Bulk operation completed",
        description: `${data.summary.successful} board members ${action}d successfully.`,
      });

      setSelectedMembers(new Set());
      onMembersChange();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} board members. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const confirmBulkDelete = async () => {
    await performBulkAction('delete');
    setBulkDeleteDialogOpen(false);
  };

  const handleToggleStatus = async (member: BoardMember) => {
    try {
      const action = member.active ? 'deactivate' : 'activate';
      
      // Call the bulk API with just this member's ID
      const response = await fetch('/api/admin/board/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          memberIds: [member.id],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} board member`);
      }

      const data = await response.json();
      
      toast({
        title: `Board member ${action}d`,
        description: `${member.name} has been ${action}d successfully.`,
      });

      onMembersChange();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${member.active ? 'deactivate' : 'activate'} board member.`,
        variant: "destructive",
      });
    }
  };

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

  const isIndeterminate = selectedMembers.size > 0 && selectedMembers.size < members.length;
  const isAllSelected = selectedMembers.size === members.length && members.length > 0;

  return (
    <>
      <Card>
        <CardContent className="p-0">
          {/* Bulk Actions Bar */}
          {selectedMembers.size > 0 && (
            <div className="flex items-center justify-between p-4 bg-muted/50 border-b">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {selectedMembers.size} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMembers(new Set())}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium w-12">
                    <Checkbox
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) (el as any).indeterminate = isIndeterminate;
                      }}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
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
                      <Checkbox
                        checked={selectedMembers.has(member.id)}
                        onCheckedChange={(checked) => 
                          handleSelectMember(member.id, checked as boolean)
                        }
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={member.photoUrl}
                          base64={member.photoBase64}
                          name={member.name}
                          size="md"
                        />
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
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(member)}
                            className={member.active ? "text-orange-600" : "text-green-600"}
                          >
                            {member.active ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteMember(member)}
                            className="text-red-600"
                          >
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{memberToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMember}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Board Members</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedMembers.size} board member(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {selectedMembers.size} Member(s)
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
      filtered = filtered.filter(member => member.role === roleFilter);
    }

    setFilteredMembers(filtered);
  }, [members, searchTerm, statusFilter, roleFilter]);

  if (isLoading) {
    return <BoardMembersLoadingSkeleton />;
  }

  // Get unique roles for filter
  const uniqueRoles = Array.from(new Set(members.map(m => m.role))).sort();

  // Calculate stats
  const activeMembers = members.filter(m => m.active).length;
  const leadershipRoles = ['President', 'Vice President', 'Secretary', 'Treasurer'];
  const leadershipCount = members.filter(m => 
    leadershipRoles.includes(m.role) && m.active
  ).length;

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
            <div className="text-2xl font-bold">{activeMembers}</div>
            <p className="text-xs text-muted-foreground">Currently serving</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leadership Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadershipCount}</div>
            <p className="text-xs text-muted-foreground">Executive positions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
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
                {uniqueRoles.map(role => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
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