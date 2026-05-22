"use client";

import { UserX, UserMinus, UserCheck, RotateCcw, AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Badge } from "./Badge";
import { IConfirmModalProps } from "@/types/components";
import { useTranslations } from "next-intl";

export function UserConfirmModal({ user, action, onConfirm, onCancel, isLoading }: IConfirmModalProps) {
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
      cancelText={t('cancel')}
      confirmText={
        <>
          {isDelete && <><UserX className="w-3.5 h-3.5 mr-2" /> {t('yesDelete')}</>}
          {isRestore && <><RotateCcw className="w-3.5 h-3.5 mr-2" /> {t('yesRestore')}</>}
          {isDeactivate && <><UserMinus className="w-3.5 h-3.5 mr-2" /> {t('yesDeactivate')}</>}
          {isActivate && <><UserCheck className="w-3.5 h-3.5 mr-2" /> {t('yesActivate')}</>}
        </>
      }
      onConfirm={onConfirm}
      onCancel={onCancel}
      isConfirmLoading={isLoading}
      isDanger={isDelete || isDeactivate}
    >
      {user && (
        <div className="space-y-4">
          <div className={`flex items-center justify-center w-14 h-14 rounded-2xl mx-auto ${
            isDelete || isDeactivate ? "bg-red-500/10" : "bg-emerald-500/10"
          }`}>
            {isDelete && <AlertTriangle className="w-7 h-7 text-red-400" />}
            {isDeactivate && <UserMinus className="w-7 h-7 text-red-400" />}
            {isRestore && <RotateCcw className="w-7 h-7 text-emerald-400" />}
            {isActivate && <UserCheck className="w-7 h-7 text-emerald-400" />}
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">
              {isDelete && t('deleteDesc')}
              {isDeactivate && t('deactivateDesc')}
              {isRestore && t('restoreDesc')}
              {isActivate && t('activateDesc')}
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-border/40">
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
