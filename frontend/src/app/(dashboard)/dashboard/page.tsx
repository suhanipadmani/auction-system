"use client";

import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import { LogOut, Wallet, Gavel, Trophy, Loader2, UsersRound, UserCheck, Zap, BadgeDollarSign, Tags } from "lucide-react";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { mutate: logout } = useLogout();
  
  // Fetch real user data for admin stats
  const { data: usersResponse, isLoading: isLoadingUsers } = useUsers();
  const users = usersResponse?.data || [];
  const activeUsersCount = users.filter((u: any) => u.status === "active").length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="text-gray-400 mt-1">Here's what's happening in your <strong className="text-indigo-400 capitalize">{user?.role}</strong> account today.</p>
        </div>
      </div>

      {user?.role === "admin" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-[#11131a] border border-gray-800 rounded-3xl p-6 shadow-xl flex items-center justify-between group hover:border-gray-700 transition">
            <div>
              <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Users</h3>
              {isLoadingUsers ? <Loader2 className="w-5 h-5 animate-spin text-indigo-500 my-2" /> : (
                <p className="text-3xl font-bold text-white">{users.length}</p>
              )}
            </div>
            <div className="opacity-50 group-hover:opacity-100 transition">
              <UsersRound className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-[#11131a] border border-gray-800 rounded-3xl p-6 shadow-xl flex items-center justify-between group hover:border-gray-700 transition">
            <div>
              <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Active Users</h3>
              {isLoadingUsers ? <Loader2 className="w-5 h-5 animate-spin text-emerald-500 my-2" /> : (
                <p className="text-3xl font-bold text-emerald-400">{activeUsersCount}</p>
              )}
            </div>
            <div className="opacity-50 group-hover:opacity-100 transition">
              <UserCheck className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          <div className="bg-[#11131a] border border-gray-800 rounded-3xl p-6 shadow-xl flex items-center justify-between group hover:border-gray-700 transition">
            <div>
              <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Auctions</h3>
              <p className="text-3xl font-bold text-white">0</p>
            </div>
            <div className="opacity-50 group-hover:opacity-100 transition">
              <Gavel className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-[#11131a] border border-gray-800 rounded-3xl p-6 shadow-xl flex items-center justify-between group hover:border-gray-700 transition">
            <div>
              <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Live Auctions</h3>
              <p className="text-3xl font-bold text-amber-400">0</p>
            </div>
            <div className="opacity-50 group-hover:opacity-100 transition">
              <Zap className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <div className="bg-[#11131a] border border-gray-800 rounded-3xl p-6 shadow-xl flex items-center justify-between group hover:border-gray-700 transition">
            <div>
              <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Revenue</h3>
              <p className="text-3xl font-bold text-indigo-400">₹0</p>
            </div>
            <div className="opacity-50 group-hover:opacity-100 transition">
              <BadgeDollarSign className="w-8 h-8 text-indigo-400" />
            </div>
          </div>

          <div className="bg-[#11131a] border border-gray-800 rounded-3xl p-6 shadow-xl flex items-center justify-between group hover:border-gray-700 transition">
            <div>
              <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Bids</h3>
              <p className="text-3xl font-bold text-purple-400">0</p>
            </div>
            <div className="opacity-50 group-hover:opacity-100 transition">
              <Tags className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#11131a] border border-gray-800 shadow-xl rounded-3xl p-6 flex flex-col justify-center">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Wallet Balance</h3>
            </div>
            <p className="text-4xl font-bold text-white">$0.00</p>
          </div>
          
          <div className="bg-[#11131a] border border-gray-800 shadow-xl rounded-3xl p-6 flex flex-col justify-center">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-purple-500/10 p-3 rounded-2xl border border-purple-500/20">
                <Gavel className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Active Bids</h3>
            </div>
            <p className="text-4xl font-bold text-white">0</p>
          </div>
          
          <div className="bg-[#11131a] border border-gray-800 shadow-xl rounded-3xl p-6 flex flex-col justify-center">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Auctions Won</h3>
            </div>
            <p className="text-4xl font-bold text-white">0</p>
          </div>
        </div>
      )}

    </div>
  );
}
