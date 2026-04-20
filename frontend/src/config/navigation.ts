import { LayoutDashboard, Users, Wallet, Gavel, ShieldAlert, History } from "lucide-react";
import { INavLink } from "@/types/navigation";
import { USER_ROLES } from "@/enums/user.enum";

export const NAV_LINKS: INavLink[] = [
  { 
    name: "Dashboard", 
    href: "/dashboard", 
    icon: LayoutDashboard, 
    roles: [USER_ROLES.ADMIN, USER_ROLES.SELLER, USER_ROLES.BIDDER] 
  },
  { 
    name: "Marketplace", 
    href: "/auctions", 
    icon: Gavel, 
    roles: [USER_ROLES.BIDDER] 
  },
  { 
    name: "My Wallet", 
    href: "/user/wallet", 
    icon: Wallet, 
    roles: [USER_ROLES.BIDDER] 
  },
  { 
    name: "Wallet Control", 
    href: "/admin/wallet", 
    icon: ShieldAlert, 
    roles: [USER_ROLES.ADMIN] 
  },
  { 
    name: "Payout Requests", 
    href: "/admin/payouts", 
    icon: Wallet, 
    roles: [USER_ROLES.ADMIN] 
  },
  { 
    name: "Auction Management", 
    href: "/admin/auctions", 
    icon: Gavel, 
    roles: [USER_ROLES.ADMIN] 
  },
  { 
    name: "User Management", 
    href: "/admin/users", 
    icon: Users, 
    roles: [USER_ROLES.ADMIN] 
  },
  { 
    name: "Bidding history", 
    href: "/user/auctions", 
    icon: Gavel, 
    roles: [USER_ROLES.BIDDER] 
  },
  { 
    name: "My Auctions", 
    href: "/seller/auctions", 
    icon: Gavel, 
    roles: [USER_ROLES.SELLER] 
  },
  { 
    name: "Payout Account", 
    href: "/user/wallet", 
    icon: Wallet, 
    roles: [USER_ROLES.SELLER] 
  },
  { 
    name: "Audit Logs", 
    href: "/admin/audit-logs", 
    icon: History, 
    roles: [USER_ROLES.ADMIN] 
  },
];

export const getVisibleLinks = (role?: string) => {
  if (!role) return [];
  return NAV_LINKS.filter(link => (link.roles as string[]).includes(role));
};
