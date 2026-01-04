import type { Transaction, TransactionType } from "./milestone-calculator";

export interface ClientEarnings {
  client: string;
  total: number;
  percentage: number;
  transactionCount: number;
}

export interface ProjectEarnings {
  project: string;
  total: number;
  percentage: number;
  transactionCount: number;
}

export interface TypeEarnings {
  type: TransactionType;
  total: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlyEarnings {
  month: string; // Format: "YYYY-MM"
  monthLabel: string; // Format: "Jan 2025"
  total: number;
  transactionCount: number;
}

export interface EarningsRate {
  perDay: number;
  perWeek: number;
  perMonth: number;
}

export interface BestWorstMonths {
  best: MonthlyEarnings | null;
  worst: MonthlyEarnings | null;
}

export interface StatisticsResult {
  grossEarnings: number;
  totalServiceFees: number;
  netEarnings: number;
  totalWithdrawals: number;
  earningsByClient: ClientEarnings[];
  earningsByProject: ProjectEarnings[];
  earningsByType: TypeEarnings[];
  monthlyEarnings: MonthlyEarnings[];
  earningsRate: EarningsRate;
  bestWorstMonths: BestWorstMonths;
  averageTransactionSize: number;
  totalTransactions: number;
  transactionCountsByType: Record<TransactionType, number>;
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function calculateStatistics(
  transactions: Transaction[]
): StatisticsResult {
  // Filter to only positive transactions for earnings calculations
  const positiveTransactions = transactions.filter((t) => t.amount > 0);
  const allTransactions = transactions;

  // Calculate gross earnings (sum of all positive transactions)
  const grossEarnings = positiveTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  // Calculate service fees (negative amounts where type is "Service Fee")
  const serviceFeeTransactions = allTransactions.filter(
    (t) => t.transactionType === "Service Fee"
  );
  const totalServiceFees = Math.abs(
    serviceFeeTransactions.reduce((sum, t) => sum + t.amount, 0)
  );

  // Calculate withdrawals (negative amounts where type is "Withdrawal" or "Withdrawal Fee")
  const withdrawalTransactions = allTransactions.filter(
    (t) =>
      t.transactionType === "Withdrawal" ||
      t.transactionType === "Withdrawal Fee"
  );
  const totalWithdrawals = Math.abs(
    withdrawalTransactions.reduce((sum, t) => sum + t.amount, 0)
  );

  // Net earnings (gross minus service fees)
  const netEarnings = grossEarnings - totalServiceFees;

  // Earnings by client
  const clientMap = new Map<string, { total: number; count: number }>();
  positiveTransactions.forEach((t) => {
    const client = t.client || "Unknown";
    const existing = clientMap.get(client) || { total: 0, count: 0 };
    clientMap.set(client, {
      total: existing.total + t.amount,
      count: existing.count + 1,
    });
  });

  const earningsByClient: ClientEarnings[] = Array.from(clientMap.entries())
    .map(([client, data]) => ({
      client,
      total: data.total,
      percentage: (data.total / grossEarnings) * 100,
      transactionCount: data.count,
    }))
    .sort((a, b) => b.total - a.total);

  // Earnings by project
  const projectMap = new Map<string, { total: number; count: number }>();
  positiveTransactions.forEach((t) => {
    const project = t.project || "Unknown";
    const existing = projectMap.get(project) || { total: 0, count: 0 };
    projectMap.set(project, {
      total: existing.total + t.amount,
      count: existing.count + 1,
    });
  });

  const earningsByProject: ProjectEarnings[] = Array.from(projectMap.entries())
    .map(([project, data]) => ({
      project,
      total: data.total,
      percentage: (data.total / grossEarnings) * 100,
      transactionCount: data.count,
    }))
    .sort((a, b) => b.total - a.total);

  // Earnings by type
  const typeMap = new Map<TransactionType, { total: number; count: number }>();
  positiveTransactions.forEach((t) => {
    const type = t.transactionType;
    if (
      type &&
      type !== "Service Fee" &&
      type !== "Withdrawal" &&
      type !== "Withdrawal Fee"
    ) {
      const existing = typeMap.get(type) || { total: 0, count: 0 };
      typeMap.set(type, {
        total: existing.total + t.amount,
        count: existing.count + 1,
      });
    }
  });

  const earningsByType: TypeEarnings[] = Array.from(typeMap.entries())
    .map(([type, data]) => ({
      type,
      total: data.total,
      percentage: (data.total / grossEarnings) * 100,
      transactionCount: data.count,
    }))
    .sort((a, b) => b.total - a.total);

  // Monthly earnings
  const monthlyMap = new Map<
    string,
    { total: number; count: number; date: Date }
  >();
  positiveTransactions.forEach((t) => {
    const monthKey = getMonthKey(t.date);
    const existing = monthlyMap.get(monthKey) || {
      total: 0,
      count: 0,
      date: t.date,
    };
    monthlyMap.set(monthKey, {
      total: existing.total + t.amount,
      count: existing.count + 1,
      date: t.date,
    });
  });

  const monthlyEarnings: MonthlyEarnings[] = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      monthLabel: formatMonthLabel(data.date),
      total: data.total,
      transactionCount: data.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Earnings rate
  if (positiveTransactions.length === 0) {
    return {
      grossEarnings: 0,
      totalServiceFees: 0,
      netEarnings: 0,
      totalWithdrawals: 0,
      earningsByClient: [],
      earningsByProject: [],
      earningsByType: [],
      monthlyEarnings: [],
      earningsRate: { perDay: 0, perWeek: 0, perMonth: 0 },
      bestWorstMonths: { best: null, worst: null },
      averageTransactionSize: 0,
      totalTransactions: 0,
      transactionCountsByType: {
        Hourly: 0,
        "Fixed-price": 0,
        "Service Fee": 0,
        Withdrawal: 0,
        "Withdrawal Fee": 0,
        Bonus: 0,
      },
    };
  }

  const sortedTransactions = [...positiveTransactions].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  const firstDate = sortedTransactions[0].date;
  const lastDate = sortedTransactions[sortedTransactions.length - 1].date;
  const daysDiff =
    Math.max(
      1,
      Math.floor(
        (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    ) + 1; // +1 to include both start and end day
  const weeksDiff = daysDiff / 7;
  const monthsDiff = daysDiff / 30.44; // Average days per month

  const earningsRate: EarningsRate = {
    perDay: grossEarnings / daysDiff,
    perWeek: grossEarnings / weeksDiff,
    perMonth: grossEarnings / monthsDiff,
  };

  // Best and worst months
  let best: MonthlyEarnings | null = null;
  let worst: MonthlyEarnings | null = null;
  monthlyEarnings.forEach((month) => {
    if (!best || month.total > best.total) {
      best = month;
    }
    if (!worst || month.total < worst.total) {
      worst = month;
    }
  });

  // Average transaction size
  const averageTransactionSize =
    positiveTransactions.length > 0
      ? grossEarnings / positiveTransactions.length
      : 0;

  // Transaction counts by type
  const transactionCountsByType: Record<TransactionType, number> = {
    Hourly: 0,
    "Fixed-price": 0,
    "Service Fee": 0,
    Withdrawal: 0,
    "Withdrawal Fee": 0,
    Bonus: 0,
  };

  allTransactions.forEach((t) => {
    if (t.transactionType) {
      transactionCountsByType[t.transactionType] =
        (transactionCountsByType[t.transactionType] || 0) + 1;
    }
  });

  return {
    grossEarnings,
    totalServiceFees,
    netEarnings,
    totalWithdrawals,
    earningsByClient,
    earningsByProject,
    earningsByType,
    monthlyEarnings,
    earningsRate,
    bestWorstMonths: { best, worst },
    averageTransactionSize,
    totalTransactions: allTransactions.length,
    transactionCountsByType,
  };
}
