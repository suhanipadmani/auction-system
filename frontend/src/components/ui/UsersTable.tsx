"use client";

import { Mail, Calendar, UserX, ShieldCheck } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./Select";
import { Button } from "./Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Badge } from "./badge";

interface UsersTableProps {
  users: any[];
  currentUser: any;
  updateRole: (data: { id: string; role: string }) => void;
  deactivateUser: (id: string) => void;
  isUpdatingRole: boolean;
  isDeactivating: boolean;
}

export function UsersTable({
  users,
  currentUser,
  updateRole,
  deactivateUser,
  isUpdatingRole,
  isDeactivating,
}: UsersTableProps) {
  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl mt-8">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="px-6 py-5">User Info</TableHead>
              <TableHead className="px-6 py-5">Role</TableHead>
              <TableHead className="px-6 py-5">Status</TableHead>
              <TableHead className="px-6 py-5">Joined</TableHead>
              <TableHead className="px-6 py-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isAdmin = user.role === "admin";
              const isSelf = user._id === currentUser?._id;
              
              return (
                <TableRow key={user._id} className="hover:bg-muted/50 transition-colors border-border">
                  <TableCell className="px-6 py-4">
                    <div className="font-medium text-foreground">{user.name}</div>
                    <div className="flex items-center gap-1.5 text-xs mt-1 text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      {user.email}
                    </div>
                  </TableCell>
                  
                  <TableCell className="px-6 py-4">
                    {!isAdmin || user.role !== "admin" ? (
                      <div className="w-40">
                        <Select
                          value={user.role}
                          onValueChange={(value) => updateRole({ id: user._id, role: value })}
                          disabled={isUpdatingRole || isSelf}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bidder">Bidder</SelectItem>
                            <SelectItem value="seller">Seller</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <Badge variant="outline" className="gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border-primary/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Super Admin
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    {user.status === "active" ? (
                      <Badge variant="outline" className="gap-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white opacity-50"></span>
                        Deactivated
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
                      <Calendar className="w-4 h-4" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right">
                    {user.status === "active" && !isAdmin ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if(confirm("Are you sure you want to deactivate this user? They will not be able to log in.")) {
                            deactivateUser(user._id);
                          }
                        }}
                        isLoading={isDeactivating}
                        disabled={isSelf}
                        className="py-1.5"
                      >
                        <UserX className="w-3.5 h-3.5 mr-2" />
                        Deactivate
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No actions available</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No users found in the database.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
