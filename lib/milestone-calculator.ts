export type TransactionType =
  | "Hourly"
  | "Fixed-price"
  | "Service Fee"
  | "Withdrawal"
  | "Withdrawal Fee"
  | "Bonus";

export interface Transaction {
  date: Date;
  amount: number;
  transactionType?: TransactionType;
  client?: string;
  project?: string;
}

export interface Milestone {
  amountReached: number;
  daysToGetThisK: number;
  dateReached: string;
}

export interface MilestoneResult {
  firstPositiveTransactionDate: string;
  milestones: Milestone[];
  currentCumulativeSum: number;
  lastMilestoneAmount: number;
  progressTowardsNextK: number;
  remainingToNextK: number;
  nextMilestoneTarget: number;
  daysSinceLastMilestone: number | null;
  milestoneAmount: number;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function calculateMilestones(
  transactions: Transaction[],
  milestoneAmount: number = 1000
): MilestoneResult | null {
  const positiveTransactions = transactions
    .filter((t) => t.amount > 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (positiveTransactions.length === 0) {
    return null;
  }

  let cumulativeSum = 0;
  const cumulativeData = positiveTransactions.map((t) => {
    cumulativeSum += t.amount;
    return {
      date: t.date,
      cumulativeSum: cumulativeSum,
    };
  });

  const milestones: Milestone[] = [];
  let threshold = milestoneAmount;
  let previousDate = cumulativeData[0].date;
  let finalCumulativeSum = 0;

  while (true) {
    const target = cumulativeData.find((d) => d.cumulativeSum >= threshold);

    if (target) {
      const daysTaken = Math.floor(
        (target.date.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      milestones.push({
        amountReached: threshold,
        daysToGetThisK: daysTaken,
        dateReached: formatDate(target.date),
      });

      previousDate = target.date;
      threshold += milestoneAmount;
      finalCumulativeSum = target.cumulativeSum;
    } else {
      finalCumulativeSum =
        cumulativeData[cumulativeData.length - 1].cumulativeSum;
      break;
    }
  }

  const lastMilestoneAmount =
    milestones.length > 0 ? milestones[milestones.length - 1].amountReached : 0;
  const progressTowardsNextK = finalCumulativeSum - lastMilestoneAmount;
  const remainingToNextK = milestoneAmount - progressTowardsNextK;
  const nextMilestoneTarget = lastMilestoneAmount + milestoneAmount;

  // Calculate days since last milestone
  let daysSinceLastMilestone: number | null = null;
  if (milestones.length > 0) {
    const lastMilestoneDate = new Date(
      milestones[milestones.length - 1].dateReached
    );
    const currentDate = new Date();
    daysSinceLastMilestone = Math.floor(
      (currentDate.getTime() - lastMilestoneDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
  }

  return {
    firstPositiveTransactionDate: formatDate(cumulativeData[0].date),
    milestones,
    currentCumulativeSum: finalCumulativeSum,
    lastMilestoneAmount,
    progressTowardsNextK,
    remainingToNextK,
    nextMilestoneTarget,
    daysSinceLastMilestone,
    milestoneAmount,
  };
}
