import { RoleGate } from "@/components/common/RoleGate";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <RoleGate allowedRoles={["admin", "seller", "bidder"]}>{children}</RoleGate>;
}
