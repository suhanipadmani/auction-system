import { LayoutDashboard, Users, Wallet, Gavel, ShieldAlert, History } from "lucide-react";
import { INavLink } from "@/types/navigation";


export const NAV_LINKS: INavLink[] = [
  { 
    name: "Dashboard", 
    href: "/dashboard", 
    icon: LayoutDashboard, 
    roles: ["admin", "seller", "bidder"] 
  },
  { 
    name: "My Wallet", 
    href: "/user/wallet", 
    icon: Wallet, 
    roles: ["bidder"] 
  },
  { 
    name: "Wallet", 
    href: "/user/wallet", 
    icon: Wallet, 
    roles: ["seller"] 
  },
  { 
    name: "Wallet Control", 
    href: "/admin/wallet", 
    icon: ShieldAlert, 
    roles: ["admin"] 
  },
  { 
    name: "Auction Management", 
    href: "/admin/auctions", 
    icon: Gavel, 
    roles: ["admin"] 
  },
  { 
    name: "User Management", 
    href: "/admin/users", 
    icon: Users, 
    roles: ["admin"] 
  },
  { 
    name: "Bidding history", 
    href: "/user/auctions", 
    icon: Gavel, 
    roles: ["bidder"] 
  },
  { 
    name: "My Auctions", 
    href: "/seller/auctions", 
    icon: Gavel, 
    roles: ["seller"] 
  },
  { 
    name: "Audit Logs", 
    href: "/admin/audit-logs", 
    icon: History, 
    roles: ["admin"] 
  },
];

export const getVisibleLinks = (role?: string) => {
  if (!role) return [];
  return NAV_LINKS.filter(link => link.roles.includes(role));
};
