import { ReactNode } from "react";
import { IUser } from "./auth";

export interface IUsersTableProps {
  users: IUser[];
  currentUser: IUser | null;
  updateRole: (data: { id: string; role: string }) => void;
  deactivateUser: (id: string) => void;
  activateUser: (id: string) => void;
  deleteUser: (id: string) => void;
  restoreUser: (id: string) => void;
  isUpdatingRole: boolean;
  isDeactivating: boolean;
  isActivating: boolean;
  isDeleting: boolean;
  isRestoring: boolean;
}

export interface IEmptyStateProps {
  message: string;
  colSpan?: number;
}

export interface IStatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconContainerClass: string;
}

export interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export interface IAuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export interface IQuickActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  color?: "indigo" | "emerald" | "purple" | "amber" | "rose" | "blue" | "gray";
}

export interface IDashboardHeaderProps {
  userName?: string;
  subtitle?: string;
  statusLabel?: string;
  statusValue?: string;
  children?: ReactNode;
}

export interface ISidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export interface IHeaderProps {
  onMenuClick: () => void;
}

export interface ITableSkeletonProps {
  rows?: number;
  columns?: number;
}

export interface IDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export interface IDashboardStatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: "indigo" | "emerald" | "purple" | "amber" | "rose" | "blue" | "teal";
  className?: string;
  trend?: string;
}
