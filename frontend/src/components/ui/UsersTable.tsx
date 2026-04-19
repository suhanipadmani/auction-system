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


function ConfirmModal({ user, action, onConfirm, onCancel, isLoading }: IConfirmModalProps) {
  const isDelete = action === "delete";
  const isDeactivate = action === "deactivate";
  const isRestore = action === "restore";
  const isActivate = action === "activate";

  let title = "Action";
  if (isDelete) title = "Delete User";
  if (isRestore) title = "Restore User";
  if (isDeactivate) title = "Deactivate User";
  if (isActivate) title = "Activate User";

  return (
    <Modal
      isOpen={!!user && !!action}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={isDelete || isDeactivate ? "destructive" : "default"}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {isDelete && <><UserX className="w-3.5 h-3.5 mr-2" /> Yes, Delete</>}
            {isRestore && <><RotateCcw className="w-3.5 h-3.5 mr-2" /> Yes, Restore</>}
            {isDeactivate && <><UserMinus className="w-3.5 h-3.5 mr-2" /> Yes, Deactivate</>}
            {isActivate && <><UserCheck className="w-3.5 h-3.5 mr-2" /> Yes, Activate</>}
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
              {isDelete && "This user will be hidden from the system. Their data is preserved and can be restored later."}
              {isDeactivate && "This user will be blocked from logging in, but will remain visible in the list."}
              {isRestore && "This user will be restored and can log in again."}
              {isActivate && "This user's login access will be restored."}
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
  const [pendingAction, setPendingAction] = useState<{
    user: IUser;
    action: "delete" | "restore" | "deactivate" | "activate";
  } | null>(null);

  const handleConfirm = () => {
    if (!pendingAction) return;
    const { id } = { id: pendingAction.user._id };
    
    switch (pendingAction.action) {
      case "delete": deleteUser(id); break;
      case "restore": restoreUser(id); break;
      case "deactivate": deactivateUser(id); break;
      case "activate": activateUser(id); break;
    }
    
    setPendingAction(null);
  };

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
                <TableHead className="px-4 sm:px-6 py-5">User Info</TableHead>
                <TableHead className="px-4 sm:px-6 py-5">Role</TableHead>
                <TableHead className="px-4 sm:px-6 py-5 hidden min-[450px]:table-cell">Status</TableHead>
                <TableHead className="px-6 py-5 hidden md:table-cell">Joined</TableHead>
                <TableHead className="px-4 sm:px-6 py-5 text-right">Actions</TableHead>
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
                          Admin
                        </Badge>
                      ) : (
                        <div className="w-28 sm:w-40">
                          <Select
                            value={user.role}
                            onValueChange={(value) => value && updateRole({ id: user._id, role: value })}
                            disabled={isUpdatingRole || isSelf || isDeleted}
                          >
                            <SelectTrigger className="w-full text-xs sm:text-sm h-9 sm:h-10">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bidder">Bidder</SelectItem>
                              <SelectItem value="seller">Seller</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
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
                          Deleted
                        </Badge>
                      ) : user.status === "inactive" ? (
                        <Badge variant="outline" className="gap-1.5 bg-amber-500/10 text-amber-400 border-amber-500/20 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Inactive
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </Badge>
                      )}
                    </TableCell>

                    {/* Joined */}
                    <TableCell className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
                        <Calendar className="w-4 h-4" />
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-6 py-4 text-right">
                      {isSelf || isAdmin ? (
                        <span className="text-xs text-muted-foreground italic">No actions available</span>
                      ) : isDeleted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPendingAction({ user, action: "restore" })}
                          isLoading={isRestoring}
                          className="py-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-2" />
                          Restore
                        </Button>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {user.status === "inactive" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPendingAction({ user, action: "activate" })}
                              isLoading={isActivating}
                              className="py-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            >
                              <UserCheck className="w-3.5 h-3.5 mr-2" />
                              Activate
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPendingAction({ user, action: "deactivate" })}
                              isLoading={isDeactivating}
                              className="py-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                            >
                              <UserMinus className="w-3.5 h-3.5 mr-2" />
                              Deactivate
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setPendingAction({ user, action: "delete" })}
                            isLoading={isDeleting}
                            className="py-1.5"
                          >
                            <UserX className="w-3.5 h-3.5 mr-2" />
                            Delete
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
                    No users found.
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
