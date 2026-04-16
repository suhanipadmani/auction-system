export interface IBudgetGoal {
  _id: string;
  userId: string;
  name: string;
  maxBudget: number;
  currentExposure: number;
  auctionIds: string[];
  createdAt: string;
  updatedAt: string;
}
