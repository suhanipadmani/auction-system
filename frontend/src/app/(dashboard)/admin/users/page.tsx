"use client";

import { useState } from "react";
import { useUsers, useUpdateRole, useDeactivateUser } from "@/hooks/useUsers";
import { Loader2, ShieldAlert, Search } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { UsersTable } from "@/components/ui/UsersTable";
import { Input } from "@/components/ui/Input";

export default function AdminUsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: response, isLoading, error } = useUsers();
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateRole();
  const { mutate: deactivateUser, isPending: isDeactivating } = useDeactivateUser();

  const users = response?.data || [];
  
  // Filter users based on search query
  const filteredUsers = users.filter((u: any) => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex items-center gap-4 max-w-2xl mt-12 shadow-[0_0_40px_-10px_rgba(239,68,68,0.2)]">
        <ShieldAlert className="w-8 h-8 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-lg">Access Denied</h3>
          <p className="text-sm opacity-80 mt-1">Failed to load users. Please ensure you have Admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">Manage roles, permissions, and active statuses across the platform.</p>
        </div>
        
        {/* Search Bar */}
        <div className="w-full md:w-72">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            className="bg-[#11131a] border-gray-800"
          />
        </div>
      </div>

      {/* Main Table Component */}
      <UsersTable 
        users={filteredUsers}
        currentUser={currentUser}
        updateRole={updateRole}
        deactivateUser={deactivateUser}
        isUpdatingRole={isUpdatingRole}
        isDeactivating={isDeactivating}
      />
    </div>
  );
}
