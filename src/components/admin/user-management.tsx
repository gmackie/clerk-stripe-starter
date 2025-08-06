'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
  CreditCard,
  Ban,
  RefreshCw,
  Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Mock data - in production, fetch from API
  const users = [
    {
      id: '1',
      email: 'alice@example.com',
      name: 'Alice Johnson',
      status: 'active',
      subscription: 'Pro',
      lastActive: '2 hours ago',
      apiCalls: 1234,
    },
    // Add more mock users...
  ];

  const handleUserAction = async (userId: string, action: string) => {
    try {
      // Call API endpoint
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success(`User ${action} successful`);
      } else {
        toast.error(`Failed to ${action} user`);
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error('No users selected');
      return;
    }

    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: selectedUsers,
          action,
        }),
      });

      if (response.ok) {
        toast.success(`Bulk ${action} successful`);
        setSelectedUsers([]);
      } else {
        toast.error(`Failed to ${action} users`);
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Search, filter, and manage all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter: {filter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('active')}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('trial')}>
                  Trial
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('canceled')}>
                  Canceled
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('banned')}>
                  Banned
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {selectedUsers.length} selected
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('export')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('email')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(users.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      checked={selectedUsers.length === users.length}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>API Usage</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.subscription}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {user.lastActive}
                    </TableCell>
                    <TableCell className="text-sm">
                      {user.apiCalls.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleUserAction(user.id, 'impersonate')}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Impersonate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUserAction(user.id, 'email')}>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUserAction(user.id, 'reset-password')}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUserAction(user.id, 'manage-subscription')}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Manage Subscription
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleUserAction(user.id, 'ban')}
                            className="text-red-600"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Ban User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              Showing 1 to 10 of 156 users
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}