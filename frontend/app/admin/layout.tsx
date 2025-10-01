import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Users, 
  FolderOpen, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Handshake
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Gradient Science Club',
  description: 'Content management system for Gradient Science Club website',
  robots: 'noindex, nofollow', // Don't index admin pages
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
  },
  {
    name: 'Projects',
    href: '/admin/projects',
    icon: FolderOpen,
  },
  {
    name: 'Board Members',
    href: '/admin/board',
    icon: Users,
  },
  {
    name: 'Partnerships',
    href: '/admin/partnerships',
    icon: Handshake,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

function AdminSidebar({ className }: { className?: string }) {
  return (
    <nav className={`space-y-2 ${className}`}>
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
        >
          <item.icon className="h-5 w-5" />
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  );
}

function MobileNavigation() {
  return (
    <div className="md:hidden">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
        </div>
        <div className="mt-3">
          <AdminSidebar />
        </div>
      </div>
    </div>
  );
}

function AdminHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex justify-between items-center px-4 md:px-6 py-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-xs md:text-sm text-gray-600">Gradient Science Club CMS</p>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/" target="_blank" className="flex items-center space-x-2">
              <span className="hidden sm:inline">View Site</span>
              <span className="sm:hidden">Site</span>
            </Link>
          </Button>
          
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="h-4 w-4 mr-0 md:mr-2" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      {/* Mobile Navigation */}
      <MobileNavigation />
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-shrink-0 md:w-64">
          <div className="flex flex-col w-full">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
              <div className="px-3">
                <AdminSidebar />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-4 md:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
} 