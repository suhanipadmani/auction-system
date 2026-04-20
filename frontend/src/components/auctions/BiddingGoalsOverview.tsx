"use client";

import { useState } from "react";
import { 
    useBudgets, 
    useCreateBudget 
} from "@/hooks/useBudget";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { PlusCircle, Target, TrendingUp, Info, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Label } from "@/components/ui/Label";
import Link from "next/link";

export function BiddingGoalsOverview() {
    const { data: budgetsResponse, isLoading } = useBudgets();
    const { mutate: createGoal, isPending: isCreating } = useCreateBudget();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newBudget, setNewBudget] = useState("");

    const goals = budgetsResponse?.data || [];
    const totalExposure = goals.reduce((sum, g) => sum + g.currentExposure, 0);
    const totalLimit = goals.reduce((sum, g) => sum + g.maxBudget, 0);
    const remaining = totalLimit - totalExposure;

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

    if (isLoading) return null;

    return (
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-white/10 overflow-hidden shadow-2xl">
            <CardContent className="p-0">
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                            <Target className="w-3 h-3" />
                            Smart Bidding Strategy
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                            Manage Your Bidding Goals
                        </h2>
                        <p className="text-muted-foreground text-sm max-w-lg mx-auto md:mx-0">
                            Set maximum spending limits for different categories to ensure you stay 
                            within your strategy and never overspend on impulse.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full md:w-auto">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Goals</p>
                            <p className="text-xl font-bold text-white">{goals.length}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Exposure</p>
                            <p className="text-xl font-bold text-indigo-400">{formatCurrency(totalExposure)}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1 hidden lg:block">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Available</p>
                            <p className="text-xl font-bold text-emerald-400">{formatCurrency(remaining > 0 ? remaining : 0)}</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
                        <Link href="/user/goals">
                            <Button 
                                variant="ghost" 
                                className="w-full text-white/70 hover:text-white hover:bg-white/5 font-bold h-12"
                            >
                                Create your goal
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>

            {/* Create Goal Modal */}
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
                                placeholder="e.g., Luxury Watches, Electronics..."
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
        </Card>
    );
}
