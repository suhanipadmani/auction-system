"use client";

import { useState } from "react";
import Link from "next/link";
import { Target, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	useBudgets,
	useCreateBudget
} from "@/hooks/useBudget";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Label } from "@/components/ui/Label";
import { useCurrency } from "@/hooks/useCurrency";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { budgetGoalSchema, type BudgetGoalInput, type BudgetGoalForm } from "@/validations/budget.validation";

export function BiddingGoalsOverview() {
	const { formatCurrency } = useCurrency();
	const t = useTranslations("auction.goals");
	const tc = useTranslations("common");
	const { data: budgetsResponse, isLoading } = useBudgets();
	const { mutate: createGoal, isPending: isCreating } = useCreateBudget();

	const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
	
	const { 
		register, 
		handleSubmit, 
		reset, 
		formState: { errors, isValid } 
	} = useForm<BudgetGoalForm>({
		resolver: zodResolver(budgetGoalSchema),
		mode: "onChange",
		defaultValues: {
			name: "",
			maxBudget: "" as any
		}
	});

	const goals = budgetsResponse?.data || [];
	const totalExposure = goals.reduce((sum, g) => sum + g.currentExposure, 0);
	const totalLimit = goals.reduce((sum, g) => sum + g.maxBudget, 0);
	const remaining = totalLimit - totalExposure;

	const handleCreate = (data: BudgetGoalForm) => {
		createGoal(data as BudgetGoalInput, {
			onSuccess: () => {
				setIsCreateModalOpen(false);
				reset();
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
							{t("strategyLabel")}
						</div>
						<h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
							{t("title")}
						</h2>
						<p className="text-muted-foreground text-sm max-w-lg mx-auto md:mx-0">
							{t("subtitle")}
						</p>
					</div>

					<div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full md:w-auto">
						<div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
							<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("activeGoals")}</p>
							<p className="text-xl font-bold text-white">{goals.length}</p>
						</div>
						<div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
							<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("exposure")}</p>
							<p className="text-xl font-bold text-indigo-400">{formatCurrency(totalExposure)}</p>
						</div>
						<div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1 hidden lg:block">
							<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("available")}</p>
							<p className="text-xl font-bold text-emerald-400">{formatCurrency(remaining > 0 ? remaining : 0)}</p>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
						<Link href="/user/goals">
							<Button
								variant="ghost"
								className="w-full text-white/70 hover:text-white hover:bg-white/5 font-bold h-12"
							>
								{t("createGoal")}
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
				title={t("modal.title")}
			>
				<form onSubmit={handleSubmit(handleCreate)} className="space-y-6 pt-4">
					<div className="space-y-4">
						<div className="space-y-2">
							<Label required>{t("modal.nameLabel")}</Label>
							<input
								type="text"
								className={cn(
									"w-full h-12 px-4 rounded-xl bg-white/5 border text-white focus:outline-none transition-colors",
									errors.name ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-primary"
								)}
								placeholder={t("modal.namePlaceholder")}
								{...register("name")}
							/>
							{errors.name && (
								<p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
									{errors.name.message}
								</p>
							)}
						</div>
						<div className="space-y-2">
							<Label required>{t("modal.budgetLabel")}</Label>
							<input
								type="number"
								className={cn(
									"w-full h-12 px-4 rounded-xl bg-white/5 border text-white focus:outline-none transition-colors",
									errors.maxBudget ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-primary"
								)}
								placeholder={t("modal.budgetPlaceholder")}
								{...register("maxBudget")}
							/>
							{errors.maxBudget && (
								<p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
									{errors.maxBudget.message}
								</p>
							)}
						</div>
					</div>
					<div className="flex gap-4 pt-4">
						<Button
							type="button"
							variant="ghost"
							className="flex-1"
							onClick={() => setIsCreateModalOpen(false)}
						>
							{tc("cancel")}
						</Button>
						<Button
							type="submit"
							className="flex-1 bg-primary text-white"
							isLoading={isCreating}
							disabled={!isValid}
						>
							{t("modal.submit")}
						</Button>
					</div>
				</form>
			</Modal>
		</Card>
	);
}
