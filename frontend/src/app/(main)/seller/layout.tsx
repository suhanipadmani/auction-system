import { RoleGate } from "@/components/common/RoleGate";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return <RoleGate allowedRoles={["seller"]}>{children}</RoleGate>;
}
