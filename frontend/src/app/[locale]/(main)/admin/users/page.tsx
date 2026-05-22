"use client";

import { useState, useEffect } from "react";
// External
import { Loader2, ShieldAlert, Search, Eye, EyeOff } from "lucide-react";
// Hooks
import { useUsers, useUpdateRole, useDeleteUser, useRestoreUser, useDeactivateUser, useActivateUser } from "@/hooks/useUsers";
import { useDebounce } from "@/hooks/useDebounce";
// State (Auth Store)
import { useAuthStore } from "@/store/auth.store";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { UsersTable } from "@/components/ui/UsersTable";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Table, TableBody } from "@/components/ui/Table";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { USER_ROLES, USER_STATUS } from "@/constants/user.constants";

export default function AdminUsersPage() {
  const t = useTranslations("admin_users");
  const currentUser = useAuthStore((state) => state.user);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDeleted, setShowDeleted] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const debouncedSearch = useDebounce(searchQuery, 500);
  
  const { data: response, isLoading, error } = useUsers(showDeleted, page, 20, debouncedSearch);
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateRole();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { mutate: restoreUser, isPending: isRestoring } = useRestoreUser();
  const { mutate: deactivateUser, isPending: isDeactivating } = useDeactivateUser();
  const { mutate: activateUser, isPending: isActivating } = useActivateUser();

  // Reset page on search or filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, showDeleted]);

  const users = response?.data || [];
  const totalPages = response?.totalPages || 1;
  const totalUsers = response?.total || 0;
  
  // Use constants for role and status checks
  const displayUsers = users.filter((u: any) => u.role !== USER_ROLES.ADMIN);
  const activeCount = users.filter((u: any) => u.status !== USER_STATUS.DELETED).length;
  const deletedCount = users.filter((u: any) => u.status === USER_STATUS.DELETED).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-4">

      <DashboardHeader
        title={t('title')}
        subtitle={t('subtitle')}
      >
        <div className="flex items-center gap-3">
          <div className="w-full md:w-64">
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="bg-white/5 border-white/10"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleted((v) => !v)}
            className={cn(
              "whitespace-nowrap transition-colors",
              showDeleted
                ? "border-red-500/40 text-red-400 bg-red-500/10 hover:bg-red-500/20"
                : "border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            {showDeleted ? (
              <><EyeOff className="w-4 h-4 mr-2" />{t('hideDeleted')}</>
            ) : (
              <><Eye className="w-4 h-4 mr-2" />{t('showDeleted')}</>
            )}
          </Button>
        </div>
      </DashboardHeader>

      {/* Summary chips */}
      <div className="flex items-center gap-4 -mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>{t('stats.active', { count: activeCount })}</span>
        </div>
        {showDeleted && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            <span>{t('stats.deleted', { count: deletedCount })}</span>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex items-center gap-4 max-w-2xl mt-12 shadow-[0_0_40px_-10px_rgba(239,68,68,0.2)]">
          <ShieldAlert className="w-8 h-8 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-lg">
              {((error as any)?.response?.status === 429) 
                ? t('error.tooManyRequests') 
                : ((error as any)?.response?.status === 403)
                  ? t('error.accessDenied')
                  : t('error.failedToLoad')}
            </h3>
            <p className="text-sm opacity-80 mt-1">
              {((error as any)?.response?.status === 429) 
                ? t('error.tryAgainLater') 
                : ((error as any)?.response?.status === 403)
                  ? t('error.accessDeniedDesc') || "You don't have the required permissions to view this page."
                  : t('error.genericError') || "Something went wrong while fetching users."}
            </p>
          </div>
        </div>
      )}

      {/* Table & Pagination */}
      {!error && (
        <>
          {isLoading ? (
            <Card className="border-border/50 bg-card/30 backdrop-blur-sm shadow-xl overflow-hidden mt-8">
              <CardContent className="p-0">
                <Table>
                  <TableBody>
                    <TableSkeleton cols={["userInfo", "role", "status", "joined", "actions"]} rows={8} />
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <UsersTable
              users={displayUsers}
              currentUser={currentUser}
              updateRole={updateRole}
              deleteUser={deleteUser}
              restoreUser={restoreUser}
              isUpdatingRole={isUpdatingRole}
              isDeleting={isDeleting}
              isRestoring={isRestoring}
              deactivateUser={(id: string) => deactivateUser(id)}
              activateUser={(id: string) => activateUser(id)}
              isDeactivating={isDeactivating}
              isActivating={isActivating}
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalUsers}
              onPageChange={setPage}
            />
          )}
        </>
      )}

    </div>
  );
}

