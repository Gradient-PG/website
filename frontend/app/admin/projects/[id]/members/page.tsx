'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { Avatar } from '@/components/ui/avatar';
import { Project, BoardMember } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ProjectMemberAssignment {
  id: string;
  projectId: string;
  memberId: string;
  role: 'member' | 'coordinator';
  joinedAt: string;
  member: {
    id: string;
    name: string;
    role: string;
    roleType: string;
    photoUrl: string;
    photoBase64: string;
    bio: string;
    socials: string;
    displayOrder: number;
    active: boolean;
  };
}

export default function ProjectMembersPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMemberAssignment[]>([]);
  const [availableMembers, setAvailableMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberRole, setMemberRole] = useState<'member' | 'coordinator'>('member');
  const [isAdding, setIsAdding] = useState(false);

  // Load project and members data
  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load project details
      const projectResponse = await fetch(`/api/admin/projects/${projectId}`);
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        setProject(projectData.project);
      }

      // Load project members
      const membersResponse = await fetch(`/api/admin/projects/${projectId}/members`);
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setProjectMembers(membersData.members || []);
      }

      // Load all available members
      const allMembersResponse = await fetch('/api/admin/board');
      if (allMembersResponse.ok) {
        const allMembersData = await allMembersResponse.json();
        setAvailableMembers(allMembersData.members || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load project data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedMemberId) {
      toast({
        title: "Error",
        description: "Please select a member",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: selectedMemberId,
          role: memberRole,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Member added to project successfully",
        });
        setIsAddDialogOpen(false);
        setSelectedMemberId('');
        setMemberRole('member');
        loadData(); // Reload data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add member');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add member to project",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/members?memberId=${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Member removed from project successfully",
        });
        loadData(); // Reload data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove member');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove member from project",
        variant: "destructive",
      });
    }
  };

  // Filter available members to exclude those already assigned
  const assignedMemberIds = new Set(projectMembers.map(pm => pm.memberId));
  const unassignedMembers = availableMembers.filter(member => 
    !assignedMemberIds.has(member.id) && member.active
  );

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project members...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button and header */}
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/admin/projects">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Project Team</h1>
            <p className="text-muted-foreground">
              {project ? `Manage team members for "${project.title}"` : 'Loading...'}
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Select a member to add to this project team.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="member-select">Select Member</Label>
                  <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <Avatar
                              src={member.photoUrl}
                              base64={member.photoBase64}
                              name={member.name}
                              size="sm"
                            />
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">{member.role}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="role-select">Role in Project</Label>
                  <Select value={memberRole} onValueChange={(value: 'member' | 'coordinator') => setMemberRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="coordinator">Coordinator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isAdding}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddMember} disabled={isAdding || !selectedMemberId}>
                  {isAdding ? 'Adding...' : 'Add Member'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Project Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members ({projectMembers.length})
          </CardTitle>
          <CardDescription>
            Members currently assigned to this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projectMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No team members assigned</h3>
              <p className="text-muted-foreground mb-4">
                Start building your project team by adding members.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Member
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {projectMembers.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={assignment.member.photoUrl}
                      base64={assignment.member.photoBase64}
                      name={assignment.member.name}
                      size="md"
                    />
                    <div>
                      <h3 className="font-medium">{assignment.member.name}</h3>
                      <p className="text-sm font-semibold text-primary capitalize">
                        {assignment.role}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {assignment.member.role} • Joined {new Date(assignment.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMember(assignment.memberId)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 