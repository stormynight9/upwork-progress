"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/stat-card";
import type { StatisticsResult } from "@/lib/statistics-calculator";

interface StatisticsDashboardProps {
  stats: StatisticsResult;
}

export function StatisticsDashboard({ stats }: StatisticsDashboardProps) {
  const [blurClients, setBlurClients] = useState(false);
  const [blurProjects, setBlurProjects] = useState(false);
  const [earningsView, setEarningsView] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const yearlyEarnings = stats.monthlyEarnings
    .reduce((acc, month) => {
      const year = month.month.split("-")[0] || month.monthLabel.slice(-4);
      const existing = acc.get(year) || { total: 0, count: 0 };
      acc.set(year, {
        total: existing.total + month.total,
        count: existing.count + month.transactionCount,
      });
      return acc;
    }, new Map<string, { total: number; count: number }>())
    .entries();

  const yearlyEarningsArray = Array.from(yearlyEarnings)
    .map(([year, data]) => ({
      year,
      total: data.total,
      transactionCount: data.count,
    }))
    .sort((a, b) => a.year.localeCompare(b.year));

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Gross Earnings"
            value={stats.grossEarnings}
            description="Total earnings before fees"
          />
          <StatCard
            title="Service Fees"
            value={stats.totalServiceFees}
            description="Total fees paid to Upwork"
          />
          <StatCard
            title="Net Earnings"
            value={stats.netEarnings}
            description="Earnings after service fees"
          />
          <StatCard
            title="Total Withdrawals"
            value={stats.totalWithdrawals}
            description="Total amount withdrawn"
          />
        </div>
      </div>
      {/* Best/Worst Months */}
      {(stats.bestWorstMonths.best || stats.bestWorstMonths.worst) && (
        <Card>
          <CardHeader>
            <CardTitle>Best & Worst Months</CardTitle>
            <CardDescription>
              Your highest and lowest earning months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.bestWorstMonths.best && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Best Month
                  </div>
                  <div className="text-xl font-bold">
                    {stats.bestWorstMonths.best.monthLabel}
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    $
                    {stats.bestWorstMonths.best.total.toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stats.bestWorstMonths.best.transactionCount} transactions
                  </div>
                </div>
              )}
              {stats.bestWorstMonths.worst && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Worst Month
                  </div>
                  <div className="text-xl font-bold">
                    {stats.bestWorstMonths.worst.monthLabel}
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    $
                    {stats.bestWorstMonths.worst.total.toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stats.bestWorstMonths.worst.transactionCount} transactions
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Withdrawals by Payment Method */}
      {stats.withdrawalsByMethod.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Withdrawals by Payment Method</CardTitle>
            <CardDescription>
              Breakdown of withdrawals by payment method (
              {stats.withdrawalsByMethod.length}{" "}
              {stats.withdrawalsByMethod.length === 1 ? "method" : "methods"})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">
                      Payment Method
                    </th>
                    <th className="text-right py-2 px-4 font-medium">
                      Total Withdrawn
                    </th>
                    <th className="text-right py-2 px-4 font-medium">Fees</th>
                    <th className="text-right py-2 px-4 font-medium">
                      Net Amount
                    </th>
                    <th className="text-right py-2 px-4 font-medium">
                      Transactions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.withdrawalsByMethod.map((method, index) => (
                    <tr
                      key={index}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-2 px-4">{method.method}</td>
                      <td className="py-2 px-4 text-right font-medium">
                        $
                        {method.total.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-2 px-4 text-right">
                        $
                        {method.feeTotal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-2 px-4 text-right font-medium">
                        $
                        {method.netTotal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-2 px-4 text-right">
                        {method.transactionCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Earnings by Client */}
      {stats.earningsByClient.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Earnings by Client</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBlurClients(!blurClients)}
              >
                {blurClients ? "Show names" : "Hide names"}
              </Button>
            </div>
            <CardDescription>
              Breakdown of earnings by client team (
              {stats.earningsByClient.length}{" "}
              {stats.earningsByClient.length === 1 ? "client" : "clients"})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Client</th>
                    <th className="text-right py-2 px-4 font-medium">
                      Earnings
                    </th>
                    <th className="text-right py-2 px-4 font-medium">
                      Percentage
                    </th>
                    <th className="text-right py-2 px-4 font-medium">
                      Transactions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.earningsByClient.map((client, index) => (
                    <tr
                      key={index}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td
                        className={`py-2 px-4 ${
                          blurClients ? "blur-xs select-none" : ""
                        }`}
                      >
                        {client.client}
                      </td>
                      <td className="py-2 px-4 text-right font-medium">
                        $
                        {client.total.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-2 px-4 text-right">
                        {client.percentage.toFixed(1)}%
                      </td>
                      <td className="py-2 px-4 text-right">
                        {client.transactionCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Earnings by Project */}
      {stats.earningsByProject.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Earnings by Project</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBlurProjects(!blurProjects)}
              >
                {blurProjects ? "Show names" : "Hide names"}
              </Button>
            </div>
            <CardDescription>
              Breakdown of earnings by project/contract (
              {stats.earningsByProject.length}{" "}
              {stats.earningsByProject.length === 1 ? "project" : "projects"})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Project</th>
                    <th className="text-right py-2 px-4 font-medium">
                      Earnings
                    </th>
                    <th className="text-right py-2 px-4 font-medium">
                      Percentage
                    </th>
                    <th className="text-right py-2 px-4 font-medium">
                      Transactions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.earningsByProject.map((project, index) => (
                    <tr
                      key={index}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td
                        className={`py-2 px-4 ${
                          blurProjects ? "blur-xs select-none" : ""
                        }`}
                      >
                        {project.project}
                      </td>
                      <td className="py-2 px-4 text-right font-medium">
                        $
                        {project.total.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-2 px-4 text-right">
                        {project.percentage.toFixed(1)}%
                      </td>
                      <td className="py-2 px-4 text-right">
                        {project.transactionCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Earnings by Type */}
      {stats.earningsByType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Earnings by Transaction Type</CardTitle>
            <CardDescription>
              Breakdown of earnings by transaction type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.earningsByType.map((type, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{type.type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {type.transactionCount} transactions
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        $
                        {type.total.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {type.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{
                        width: `${type.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Earnings */}
      {stats.monthlyEarnings.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>
                {earningsView === "monthly"
                  ? "Monthly Earnings Trend"
                  : "Yearly Earnings Trend"}
              </CardTitle>
              <Select
                defaultValue="monthly"
                onValueChange={(value) =>
                  setEarningsView(value as "monthly" | "yearly")
                }
              >
                <SelectTrigger size="sm" className="min-w-[120px]">
                  <SelectValue className="capitalize" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              {earningsView === "monthly"
                ? "Earnings breakdown by month (sorted chronologically)"
                : "Earnings breakdown by year (sorted chronologically)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">
                      {earningsView === "monthly" ? "Month" : "Year"}
                    </th>
                    <th className="text-right py-2 px-4 font-medium">
                      Earnings
                    </th>
                    <th className="text-right py-2 px-4 font-medium">
                      Transactions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(earningsView === "monthly"
                    ? stats.monthlyEarnings
                    : yearlyEarningsArray
                  ).map((period, index) => (
                    <tr
                      key={index}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-2 px-4">
                        {"monthLabel" in period
                          ? period.monthLabel
                          : period.year}
                      </td>
                      <td className="py-2 px-4 text-right font-medium">
                        $
                        {period.total.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-2 px-4 text-right">
                        {period.transactionCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
