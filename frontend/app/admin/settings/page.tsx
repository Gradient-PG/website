import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your website configuration and preferences
        </p>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Database</CardTitle>
            <CardDescription>MongoDB connection and data management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Type</span>
              <span className="text-sm text-muted-foreground">MongoDB Atlas</span>
            </div>
            <Button variant="outline" size="sm" className="w-full" disabled>
              Test Connection
            </Button>
          </CardContent>
        </Card>

        {/* Authentication */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Admin access and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Method</span>
              <span className="text-sm text-muted-foreground">HTTP Basic Auth</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Admin User</span>
              <span className="text-sm text-muted-foreground">Configured</span>
            </div>
            <Button variant="outline" size="sm" className="w-full" disabled>
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Site Information */}
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
            <CardDescription>Basic website configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Site Name</span>
              <span className="text-sm text-muted-foreground">Gradient Science Club</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Environment</span>
              <Badge variant="outline">Development</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full" disabled>
              Edit Site Info
            </Button>
          </CardContent>
        </Card>

        {/* Backup & Export */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Backup, export, and import data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Backup</span>
              <span className="text-sm text-muted-foreground">Never</span>
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full" disabled>
                Export Data
              </Button>
              <Button variant="outline" size="sm" className="w-full" disabled>
                Import Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Technical details about your installation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-sm font-medium">Framework</div>
              <div className="text-sm text-muted-foreground">Next.js 14</div>
            </div>
            <div>
              <div className="text-sm font-medium">Runtime</div>
              <div className="text-sm text-muted-foreground">Node.js</div>
            </div>
            <div>
              <div className="text-sm font-medium">Database</div>
              <div className="text-sm text-muted-foreground">MongoDB</div>
            </div>
            <div>
              <div className="text-sm font-medium">Version</div>
              <div className="text-sm text-muted-foreground">1.0.0</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 