"use client";

import { useState } from "react";
import { Mail, Calendar, UserX, UserMinus, UserCheck, ShieldCheck, RotateCcw, AlertTriangle } from "lucide-react";
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
} from "./Table";
import { Badge } from "./Badge";
import { Modal } from "./Modal";
import { IUsersTableProps, IConfirmModalProps } from "@/types/components";
import { IUser } from "@/types/auth";
import { USER_ACTIONS } from "@/enums/user.enum";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/utils";



function ConfirmModal({ user, action, onConfirm, onCancel, isLoading }: IConfirmModalProps) {
  const t = useTranslations("admin_users.modals");
  const isDelete = action === "delete";
  const isDeactivate = action === "deactivate";
  const isRestore = action === "restore";
  const isActivate = action === "activate";

  let title = "Action";
  if (isDelete) title = t('deleteTitle');
  if (isRestore) title = t('restoreTitle');
  if (isDeactivate) title = t('deactivateTitle');
  if (isActivate) title = t('activateTitle');

  return (
    <Modal
      isOpen={!!user && !!action}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button
            variant={isDelete || isDeactivate ? "destructive" : "default"}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {isDelete && <><UserX className="w-3.5 h-3.5 mr-2" /> {t('yesDelete')}</>}
            {isRestore && <><RotateCcw className="w-3.5 h-3.5 mr-2" /> {t('yesRestore')}</>}
            {isDeactivate && <><UserMinus className="w-3.5 h-3.5 mr-2" /> {t('yesDeactivate')}</>}
            {isActivate && <><UserCheck className="w-3.5 h-3.5 mr-2" /> {t('yesActivate')}</>}
          </Button>
        </>
      }
    >
      {user && (
        <div className="space-y-4">
          {/* Icon banner */}
          <div className={`flex items-center justify-center w-14 h-14 rounded-2xl mx-auto ${
            isDelete || isDeactivate ? "bg-red-500/10" : "bg-emerald-500/10"
          }`}>
            {isDelete && <AlertTriangle className="w-7 h-7 text-red-400" />}
            {isDeactivate && <UserMinus className="w-7 h-7 text-red-400" />}
            {isRestore && <RotateCcw className="w-7 h-7 text-emerald-400" />}
            {isActivate && <UserCheck className="w-7 h-7 text-emerald-400" />}
          </div>

          {/* Description */}
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">
              {isDelete && t('deleteDesc')}
              {isDeactivate && t('deactivateDesc')}
              {isRestore && t('restoreDesc')}
              {isActivate && t('activateDesc')}
            </p>
          </div>

          {/* User card */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-border/40">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-semibold text-sm flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-white text-sm truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <Badge variant="outline" className="ml-auto text-xs capitalize bg-white/5 border-border/40 shrink-0">
              {user.role}
            </Badge>
          </div>
        </div>
      )}
    </Modal>
  );
}

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
    { key: "userInfo", label: t('userInfo'), className: "px-4 sm:px-6 py-5" },
    { key: "role", label: t('role'), className: "px-4 sm:px-6 py-5" },
    { key: "status", label: t('status'), className: "px-4 sm:px-6 py-5 hidden min-[450px]:table-cell" },
    { key: "joined", label: t('joined'), className: "px-6 py-5 hidden md:table-cell" },
    { key: "actions", label: t('actions'), className: "px-4 sm:px-6 py-5 text-right" },
  ];


  return (
    <>
      {/* Confirmation modal */}
      <ConfirmModal
        user={pendingAction?.user ?? null}
        action={pendingAction?.action ?? null}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
        isLoading={isDeleting || isRestoring || isDeactivating || isActivating}
      />

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl mt-8">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-none">
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.className}>
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((user) => {
                const isAdmin   = user.role === "admin";
                const isSelf    = user._id === currentUser?._id;
                const isDeleted = user.status === "deleted";

                return (
                  <TableRow
                    key={user._id}
                    className={`hover:bg-muted/50 transition-colors border-border ${isDeleted ? "opacity-60" : ""}`}
                  >
                    {/* User info */}
                    <TableCell className="px-4 sm:px-6 py-4">
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
                    <TableCell className="px-4 sm:px-6 py-4">
                      {isAdmin ? (
                        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border-primary/20 whitespace-nowrap">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {t('roles.admin')}
                        </Badge>
                      ) : (
                        <div className="w-28 sm:w-40">
                          <Select
                            value={user.role}
                            onValueChange={(value) => value && updateRole({ id: user._id, role: value })}
                            disabled={isUpdatingRole || isSelf || isDeleted}
                          >
                            <SelectTrigger className="w-full text-xs sm:text-sm h-9 sm:h-10">
                              <SelectValue placeholder={t('selectRole')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bidder">{t('roles.bidder')}</SelectItem>
                              <SelectItem value="seller">{t('roles.seller')}</SelectItem>
                              <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-4 sm:px-6 py-4 hidden min-[450px]:table-cell">
                      {isDeleted ? (
                        <Badge variant="outline" className="gap-1.5 bg-red-500/10 text-red-400 border-red-500/20 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          {t('statuses.deleted')}
                        </Badge>
                      ) : user.status === "inactive" ? (
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
                    <TableCell className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
                        <Calendar className="w-4 h-4" />
                        {user.createdAt ? formatDate(user.createdAt, "date") : "N/A"}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-6 py-4 text-right">
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
                          {user.status === "inactive" ? (
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
        </div>
      </div>
    </>
  );
}
