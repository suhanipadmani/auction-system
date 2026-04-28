import { ReactNode } from "react";
import { Switch as SwitchPrimitives } from "@base-ui/react/switch";
import { IUser } from "./auth";
import { IAuction } from "./auction";
import { IViewType, ITransaction, IDepositRequest, IAdjustmentData } from "./wallet";
import { USER_ACTIONS } from "@/enums/user.enum";
import { TRANSACTION_STATUSES, TRANSACTION_TYPES } from "@/enums/wallet.enum";


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
  className?: string;
}

export interface IDashboardHeaderProps {
  userName?: string;
  subtitle?: string;
  statusLabel?: string;
  statusValue?: string;
  children?: ReactNode;
  title?: string;
}

export interface ISidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
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



export interface IWalletModalsProps {
  // Adjustment Modal
  isAdjustmentOpen: boolean;
  onAdjustmentClose: () => void;
  adjustmentData: IAdjustmentData | null;
  onAdjustmentConfirm: () => void;
  isAdjusting: boolean;

  // Deposit Modal
  isDepositOpen: boolean;
  onDepositClose: () => void;
  selectedRequest: IDepositRequest | null;
  actionType: TRANSACTION_STATUSES.APPROVED | TRANSACTION_STATUSES.REJECTED;
  onDepositConfirm: (id: string, status: TRANSACTION_STATUSES.APPROVED | TRANSACTION_STATUSES.REJECTED) => void;
  isProcessing: boolean;
}

export interface IWalletHeaderProps {
  activeView: IViewType;
  onViewChange: (view: IViewType) => void;
}

export interface ITransactionLogRowProps {
  tx: ITransaction;
}

export interface IDepositRowProps {
  req: IDepositRequest;
  onProcessClick: (req: IDepositRequest, type: TRANSACTION_STATUSES.APPROVED | TRANSACTION_STATUSES.REJECTED) => void;
  isLoading: boolean;
  processingId?: string;
}

export interface IDepositRequestsSectionProps {
  onProcessClick: (req: IDepositRequest, type: TRANSACTION_STATUSES.APPROVED | TRANSACTION_STATUSES.REJECTED) => void;
  processingId?: string;
}

export interface IBalanceAdjustmentSectionProps {
  onReviewClick: (data: IAdjustmentData) => void;
  isAdjusting: boolean;
}

export interface IConfirmModalProps {
  user: IUser | null;
  action: USER_ACTIONS | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export type ISwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>;

export interface IRoleGateProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export interface IBiddingSectionProps {
  auction: IAuction;
  socketData: {
    highestBid: number | null;
    highestBidderId: string | null;
    isPending: boolean;
    placeBid: (amount: number) => void;
  };
}

export interface IAuctionCardProps {
  auction: IAuction;
  href?: string;
  showActions?: boolean;
}

export interface IProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
  showBlur?: boolean;
}

export interface IAnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  percentage?: number;
  color?: "indigo" | "emerald" | "purple" | "amber" | "rose" | "blue" | "teal";
  className?: string;
}

export interface IAnalyticsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export interface IBidHistoryProps {
  auctionId: string;
}

export interface IBidItemProps {
  bid: any;
  index: number;
  page: number;
}

export interface IFullHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  auctionId: string;
}

export interface IAuctionTimelineProps {
  startTime: string;
  endTime: string;
}

export interface IAuctionRulesProps {
  basePrice: number;
  minIncrement: number;
}

export interface IAdminControlsProps {
  onAction: (action: "approve" | "reject") => void;
  isProcessing: boolean;
}

export interface ITableColumn<T> {
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface IApprovalTableProps {
  data: IAuction[];
  onAction: any;
  isProcessing: boolean;
  t: any;
  formatCurrency: any;
}

export interface IInventoryTableProps {
  data: IAuction[];
  t: any;
  formatCurrency: any;
}











