"use client";

import { useState } from "react";
import { 
    useBudgets, 
    useCreateBudget, 
    useDeleteBudget 
} from "@/hooks/useBudget";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PlusCircle, Target, Trash2, TrendingUp, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";

export default function MyGoalsPage() {
    const { data: budgetsResponse, isLoading } = useBudgets();
    const { mutate: createGoal, isPending: isCreating } = useCreateBudget();
    const { mutate: deleteGoal } = useDeleteBudget();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newBudget, setNewBudget] = useState("");

    const goals = budgetsResponse?.data || [];

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createGoal({ name: newName, maxBudget: Number(newBudget) }, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setNewName("");
                setNewBudget("");
            }
        });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <DashboardHeader
                    title="Bidding Goals"
                    subtitle="Organize your bids and prevent overspending"
                    statusValue="Strategy"
                />
                <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full md:w-auto gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                    <PlusCircle className="w-4 h-4" />
                    New Goal
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-indigo-500/10">
                            <Target className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Total Goals</p>
                            <p className="text-2xl font-bold text-white">{goals.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500/10">
                            <TrendingUp className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Active Exposure</p>
                            <p className="text-2xl font-bold text-white">
                                {formatCurrency(goals.reduce((sum, g) => sum + g.currentExposure, 0))}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-500/10">
                            <Info className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Total Limits</p>
                            <p className="text-2xl font-bold text-white">
                                {formatCurrency(goals.reduce((sum, g) => sum + g.maxBudget, 0))}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Goals List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                {isLoading ? (
                    <p className="text-muted-foreground animate-pulse">Loading goals...</p>
                ) : goals.length > 0 ? (
                    goals.map((goal) => {
                        const progress = Math.min((goal.currentExposure / goal.maxBudget) * 100, 100);
                        const isNearingLimit = progress > 80;

                        return (
                            <Card key={goal._id} className="group bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                                <CardHeader className="p-6 flex flex-row items-center justify-between border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                                            isNearingLimit ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
                                        )}>
                                            <Target className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-white text-lg">{goal.name}</h3>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => deleteGoal(goal._id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Current Exposure</p>
                                            <p className={cn("text-2xl font-bold", isNearingLimit ? "text-red-400" : "text-white")}>
                                                {formatCurrency(goal.currentExposure)}
                                            </p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Max Budget</p>
                                            <p className="text-lg font-semibold text-white/70">{formatCurrency(goal.maxBudget)}</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className={cn(
                                                    "h-full transition-all duration-1000",
                                                    isNearingLimit ? "bg-gradient-to-r from-red-600 to-red-400" : "bg-gradient-to-r from-primary to-indigo-400"
                                                )}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                            <span>{Math.round(progress)}% Assigned</span>
                                            <span>{formatCurrency(goal.maxBudget - goal.currentExposure)} Remaining</span>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Info className="w-4 h-4 text-primary/60" />
                                            <span>{goal.auctionIds.length} Auctions tracked in this goal</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                ) : (
                    <div className="col-span-full py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
                        <Target className="w-12 h-12 text-muted-foreground/30" />
                        <div>
                            <p className="text-white font-semibold">No Bidding Goals yet</p>
                            <p className="text-sm text-muted-foreground mt-1 max-w-xs"> Create goals to organize your spending and keep your bids safe.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Bidding Goal"
            >
                <form onSubmit={handleCreate} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Goal Name</Label>
                            <input 
                                type="text"
                                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary transition-colors"
                                placeholder="e.g., Luxury Watches, Office Furniture..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Maximum Budget</Label>
                            <input 
                                type="number"
                                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary transition-colors"
                                placeholder="Total spending limit"
                                value={newBudget}
                                onChange={(e) => setNewBudget(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            className="flex-1" 
                            onClick={() => setIsCreateModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            className="flex-1 bg-primary text-white"
                            isLoading={isCreating}
                        >
                            Create Goal
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
