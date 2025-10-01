import { Suspense } from 'react';
import Link from 'next/link';
import { 
  Users, 
  FolderOpen, 
  Activity, 
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Calendar,
  UserCheck,
  User,
  Users2,
  Handshake
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { projectsRepo, boardMembersRepo } from '@/lib/repositories';
import { partnershipsRepo } from '@/lib/repositories/partnerships';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    positive: boolean;
  };
}

function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

async function DashboardStats() {
  try {
    // Get all data in parallel
    const [
      allProjects,
      activeProjects,
      completedProjects,
      memberStats,
      allPartnerships,
      activePartnerships
    ] = await Promise.all([
      projectsRepo.findAll(),
      projectsRepo.findAll('active'),
      projectsRepo.findAll('completed'),
      boardMembersRepo.getStatsByRoleType(),
      partnershipsRepo.findAll(),
      partnershipsRepo.findActive()
    ]);

    const stats = [
      {
        title: 'Total Projects',
        value: allProjects.length,
        description: `${activeProjects.length} active, ${completedProjects.length} completed`,
        icon: FolderOpen,
      },
      {
        title: 'Board Members',
        value: memberStats.boardMembers.active,
        description: `${memberStats.boardMembers.total} total`,
        icon: Users,
      },
      {
        title: 'Coordinators',
        value: memberStats.coordinators.active,
        description: `${memberStats.coordinators.total} total`,
        icon: UserCheck,
      },
      {
        title: 'Members',
        value: memberStats.members.active,
        description: `${memberStats.members.total} total`,
        icon: User,
      },
      {
        title: 'Total Team',
        value: memberStats.total.active,
        description: `${memberStats.total.total} total members`,
        icon: Users2,
      },
      {
        title: 'Active Projects',
        value: activeProjects.length,
        description: 'Currently in progress',
        icon: Activity,
      },
      {
        title: 'Partnerships',
        value: activePartnerships.length,
        description: `${allPartnerships.length} total`,
        icon: Handshake,
      },
    ];

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Error loading dashboard stats</p>
          </CardContent>
        </Card>
      </div>
    );
  }
}

async function RecentActivity() {
  try {
    const [recentProjects, recentBoardMembers] = await Promise.all([
      projectsRepo.findAll(),
      boardMembersRepo.findAll()
    ]);

    // Sort by updatedAt and take the most recent 5 items
    const allItems = [
      ...recentProjects.map(p => ({
        type: 'project' as const,
        title: p.title,
        status: p.status,
        updatedAt: p.updatedAt,
        href: `/admin/projects`,
      })),
      ...recentBoardMembers.map(m => ({
        type: 'member' as const,
        title: m.name,
        status: m.active ? 'active' : 'inactive',
        updatedAt: m.updatedAt,
        href: `/admin/board`,
      })),
    ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
     .slice(0, 5);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates to your content</CardDescription>
        </CardHeader>
        <CardContent>
          {allItems.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {allItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {item.type === 'project' ? (
                      <FolderOpen className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Users className="h-4 w-4 text-green-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.type === 'project' ? 'Project' : 'Board Member'} • {item.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error loading recent activity:', error);
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Error loading recent activity</p>
        </CardContent>
      </Card>
    );
  }
}

function QuickActions() {
  const actions = [
    {
      title: 'Add New Project',
      description: 'Create a new club project',
      href: '/admin/projects/new',
      icon: FolderOpen,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Add Board Member',
      description: 'Add a new board member',
      href: '/admin/board/new',
      icon: Users,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'View Website',
      description: 'See the public website',
      href: '/',
      icon: Eye,
      color: 'bg-purple-500 hover:bg-purple-600',
      external: true,
    },
    {
      title: 'Site Settings',
      description: 'Configure site settings',
      href: '/admin/settings',
      icon: Edit,
      color: 'bg-gray-500 hover:bg-gray-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 justify-start"
              asChild
            >
              <Link 
                href={action.href}
                target={action.external ? '_blank' : undefined}
                className="flex items-start space-x-3"
              >
                <div className={`p-2 rounded-md text-white ${action.color}`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your website.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/" target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              View Site
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsLoadingSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<Card><CardContent className="p-6"><div className="animate-pulse h-32 bg-gray-200 rounded"></div></CardContent></Card>}>
          <RecentActivity />
        </Suspense>
        <QuickActions />
      </div>
    </div>
  );
} 