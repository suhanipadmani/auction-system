"use client";

import { useState } from "react";

// External
import { Loader2, ShieldAlert, Search, Eye, EyeOff } from "lucide-react";

// Hooks
import { useUsers, useUpdateRole, useDeleteUser, useRestoreUser, useDeactivateUser, useActivateUser } from "@/hooks/useUsers";
import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// State (Auth Store)
import { useAuthStore } from "@/store/auth.store";

// UI Components
import { UsersTable } from "@/components/ui/UsersTable";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AdminUsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [page, setPage] = useState(1);

  // Debounce search 
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: response, isLoading, error } = useUsers(showDeleted, page, 20, debouncedSearch);
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateRole();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { mutate: restoreUser, isPending: isRestoring } = useRestoreUser();
  const { mutate: deactivateUser, isPending: isDeactivating } = useDeactivateUser();
  const { mutate: activateUser, isPending: isActivating } = useActivateUser();

  const users = response?.data || [];
  const totalPages = response?.totalPages || 1;
  const totalUsers = response?.total || 0;

  // Filtering logic now happens mainly on backend, 
  // but we still filter out admins for safety if needed
  const displayUsers = users.filter((u: any) => u.role !== "admin");

  const activeCount = users.filter((u: any) => u.status !== "deleted").length;
  const deletedCount = users.filter((u: any) => u.status === "deleted").length;

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

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">
            Manage roles, permissions, and user visibility across the platform.
          </p>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="w-full md:w-64">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="bg-[#11131a] border-gray-800"
            />
          </div>

          {/* Show deleted toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleted((v) => !v)}
            className={`whitespace-nowrap transition-colors ${
              showDeleted
                ? "border-red-500/40 text-red-400 bg-red-500/10 hover:bg-red-500/20"
                : "border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
            }`}
          >
            {showDeleted ? (
              <><EyeOff className="w-4 h-4 mr-2" />Hide Deleted</>
            ) : (
              <><Eye className="w-4 h-4 mr-2" />Show Deleted</>
            )}
          </Button>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex items-center gap-4 -mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>{activeCount} active</span>
        </div>
        {showDeleted && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            <span>{deletedCount} deleted</span>
          </div>
        )}
      </div>

      {/*  Table */}
      <UsersTable
        users={displayUsers}
        currentUser={currentUser}
        updateRole={updateRole}
        deleteUser={deleteUser}
        restoreUser={restoreUser}
        isUpdatingRole={isUpdatingRole}
        isDeleting={isDeleting}
        isRestoring={isRestoring}
        deactivateUser={(id) => deactivateUser(id)}
        activateUser={(id) => activateUser(id)}
        isDeactivating={isDeactivating}
        isActivating={isActivating}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
          <p className="text-sm text-gray-500">
            Showing <span className="text-white font-medium">{displayUsers.length}</span> of <span className="text-white font-medium">{totalUsers}</span> users
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border-gray-800 text-gray-400"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <div className="text-sm text-gray-400 px-4">
              Page <span className="text-white font-bold">{page}</span> of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="border-gray-800 text-gray-400"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
