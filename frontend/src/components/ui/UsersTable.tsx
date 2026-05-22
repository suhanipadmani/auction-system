"use client";

import { useState } from "react";
import { Mail, Calendar, UserX, UserMinus, UserCheck, ShieldCheck, RotateCcw } from "lucide-react";
import { Dropdown } from "./Dropdown";
import { Button } from "./Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";
import { Badge } from "./Badge";
import { UserConfirmModal } from "./UserConfirmModal";
import { IUsersTableProps } from "@/types/components";
import { IUser } from "@/types/auth";
import { USER_ACTIONS } from "@/enums/user.enum";
import { useTranslations } from "next-intl";
import { cn, formatDate } from "@/lib/utils";
import { Card, CardContent } from "./Card";
import { Pagination } from "./Pagination";
import { USER_ROLES, USER_STATUS } from "@/constants/user.constants";

//  Main table 
export function UsersTable({
  users,
  currentUser,
  updateRole,
  deactivateUser,
  activateUser,
  deleteUser,
  restoreUser,
  isUpdatingRole,
  isDeactivating,
  isActivating,
  isDeleting,
  isRestoring,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: IUsersTableProps) {
  const t = useTranslations("admin_users.table");
  const [pendingAction, setPendingAction] = useState<{
    user: IUser;
    action: USER_ACTIONS;
  } | null>(null);

  const handleConfirm = () => {
    if (!pendingAction) return;
    const { id } = { id: pendingAction.user._id };
    
    switch (pendingAction.action) {
      case USER_ACTIONS.DELETE: deleteUser(id); break;
      case USER_ACTIONS.RESTORE: restoreUser(id); break;
      case USER_ACTIONS.DEACTIVATE: deactivateUser(id); break;
      case USER_ACTIONS.ACTIVATE: activateUser(id); break;
    }
    
    setPendingAction(null);
  };

  const columns = [
    { key: "userInfo", label: t('userInfo'), className: "" },
    { key: "role", label: t('role'), className: "" },
    { key: "status", label: t('status'), className: "hidden min-[450px]:table-cell" },
    { key: "joined", label: t('joined'), className: "hidden md:table-cell" },
    { key: "actions", label: t('actions'), className: "text-right" },
  ];

  return (
    <>
      {/* Confirmation modal */}
      <UserConfirmModal
        user={pendingAction?.user ?? null}
        action={pendingAction?.action ?? null}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
        isLoading={isDeleting || isRestoring || isDeactivating || isActivating}
      />

      <Card className="border-border/50 bg-card/30 backdrop-blur-sm shadow-xl overflow-hidden mt-8">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.className}>
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((user) => {
                const isAdmin   = user.role === USER_ROLES.ADMIN;
                const isSelf    = user._id === currentUser?._id;
                const isDeleted = user.status === USER_STATUS.DELETED;

                return (
                  <TableRow
                    key={user._id}
                    className={cn("transition-colors", isDeleted && "opacity-60")}
                  >
                    {/* User info */}
                    <TableCell>
                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* Mini avatar */}
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-[10px] sm:text-xs flex-shrink-0 ${
                          isDeleted
                            ? "bg-red-500/10 text-red-400"
                            : "bg-indigo-500/20 text-indigo-300"
                        }`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground text-sm sm:text-base truncate max-w-[100px] sm:max-w-none">{user.name}</div>
                          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs mt-0.5 text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                            <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      {isAdmin ? (
                        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border-primary/20 whitespace-nowrap">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {t('roles.admin')}
                        </Badge>
                      ) : (
                        <div className="w-28 sm:w-40">
                          <Dropdown
                            value={user.role}
                            onChange={(value) => value && updateRole({ id: user._id, role: value })}
                            disabled={isUpdatingRole || isSelf || isDeleted}
                            placeholder={t('selectRole')}
                            options={[
                              { label: t('roles.bidder'), value: USER_ROLES.BIDDER },
                              { label: t('roles.seller'), value: USER_ROLES.SELLER },
                              { label: t('roles.admin'), value: USER_ROLES.ADMIN }
                            ]}
                            triggerClassName="w-full text-xs sm:text-sm h-9 sm:h-10"
                            showSearch={false}
                          />
                        </div>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="hidden min-[450px]:table-cell">
                      {isDeleted ? (
                        <Badge variant="outline" className="gap-1.5 bg-red-500/10 text-red-400 border-red-500/20 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          {t('statuses.deleted')}
                        </Badge>
                      ) : user.status === USER_STATUS.INACTIVE ? (
                        <Badge variant="outline" className="gap-1.5 bg-amber-500/10 text-amber-400 border-amber-500/20 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {t('statuses.inactive')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {t('statuses.active')}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Joined */}
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
                        <Calendar className="w-4 h-4" />
                        {user.createdAt ? formatDate(user.createdAt, "date") : "N/A"}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      {isSelf || isAdmin ? (
                        <span className="text-xs text-muted-foreground italic">{t('noActions')}</span>
                      ) : isDeleted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPendingAction({ user, action: USER_ACTIONS.RESTORE })}
                          isLoading={isRestoring}
                          className="py-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-2" />
                          {t('restore')}
                        </Button>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {user.status === USER_STATUS.INACTIVE ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPendingAction({ user, action: USER_ACTIONS.ACTIVATE })}
                              isLoading={isActivating}
                              className="py-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            >
                              <UserCheck className="w-3.5 h-3.5 mr-2" />
                              {t('activate')}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPendingAction({ user, action: USER_ACTIONS.DEACTIVATE })}
                              isLoading={isDeactivating}
                              className="py-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                            >
                              <UserMinus className="w-3.5 h-3.5 mr-2" />
                              {t('deactivate')}
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setPendingAction({ user, action: USER_ACTIONS.DELETE })}
                            isLoading={isDeleting}
                            className="py-1.5"
                          >
                            <UserX className="w-3.5 h-3.5 mr-2" />
                            {t('delete')}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    {t('noUsers')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {onPageChange && totalPages && totalPages > 1 && (
            <Pagination
              currentPage={currentPage || 1}
              totalPages={totalPages}
              totalItems={totalItems || 0}
              showingCount={users.length}
              onPageChange={onPageChange}
              typeLabel={t('pagination.users') || "Users"}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}

