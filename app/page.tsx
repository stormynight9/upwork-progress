"use client";

import { useState, useMemo } from "react";
import { CSVUploader } from "@/components/csv-uploader";
import { MilestoneResults } from "@/components/milestone-results";
import { StatisticsDashboard } from "@/components/statistics-dashboard";
import {
  calculateMilestones,
  type Transaction,
} from "@/lib/milestone-calculator";
import { calculateStatistics } from "@/lib/statistics-calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BuyMeACoffee } from "@/components/buy-me-a-coffee";
import { Button } from "@/components/ui/button";

type ViewMode = "milestones" | "statistics";

export default function Page() {
  const [error, setError] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [milestoneAmountInput, setMilestoneAmountInput] =
    useState<string>("1000");
  const [viewMode, setViewMode] = useState<ViewMode>("milestones");

  const result = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return null;
    }
    // Only calculate if milestone amount is valid (>= 1000)
    const parsed = parseFloat(milestoneAmountInput);
    if (isNaN(parsed) || parsed < 1000) {
      return null;
    }
    const calculated = calculateMilestones(transactions, parsed);
    if (!calculated) {
      return null;
    }
    return calculated;
  }, [transactions, milestoneAmountInput]);

  const statistics = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return null;
    }
    return calculateStatistics(transactions);
  }, [transactions]);

  const displayError = useMemo(() => {
    if (error) return error;
    if (transactions && transactions.length > 0 && !result) {
      return "No positive transactions found in the data.";
    }
    return "";
  }, [error, transactions, result]);

  // Calculate dynamic milestone based on total earnings
  const calculateDefaultMilestone = (totalEarnings: number): number => {
    // Thresholds in descending order: [100k, 50k, 20k]
    // Milestone = threshold / 10
    const thresholds = [
      { threshold: 100000, milestone: 10000 },
      { threshold: 50000, milestone: 5000 },
      { threshold: 20000, milestone: 2000 },
    ];

    // Find the first threshold the user has crossed
    for (const { threshold, milestone } of thresholds) {
      if (totalEarnings >= threshold) {
        return milestone;
      }
    }

    // Default to $1k if below all thresholds
    return 1000;
  };

  const handleFileParsed = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    setError("");

    // Calculate total earnings (sum of positive transactions)
    const totalEarnings = newTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    // Set default milestone dynamically based on earnings
    const defaultMilestone = calculateDefaultMilestone(totalEarnings);
    setMilestoneAmountInput(defaultMilestone.toString());
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTransactions(null);
  };

  const handleMilestoneAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMilestoneAmountInput(e.target.value);
  };

  const isValidMilestoneAmount = useMemo(() => {
    const parsed = parseFloat(milestoneAmountInput);
    return !isNaN(parsed) && parsed >= 1000;
  }, [milestoneAmountInput]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Upwork Progress Tracker</h1>
          <p className="text-muted-foreground">
            Upload your transaction CSV to see your milestone progress and
            detailed statistics
          </p>
        </div>

        <CSVUploader onFileParsed={handleFileParsed} onError={handleError} />

        {transactions && transactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Milestone Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="milestone-amount">Milestone Amount ($)</Label>
                <Input
                  id="milestone-amount"
                  type="number"
                  min="1000"
                  step="1"
                  value={milestoneAmountInput}
                  onChange={handleMilestoneAmountChange}
                  className="max-w-xs"
                />
                {!isValidMilestoneAmount && milestoneAmountInput !== "" && (
                  <p className="text-xs text-destructive">
                    Minimum milestone amount is $1,000
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Set the milestone increment amount (minimum: $1,000, e.g.,
                  1000, 2000, 5000)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {displayError && (
          <Card>
            <CardContent className="p-4">
              <div className="text-destructive text-sm">{displayError}</div>
            </CardContent>
          </Card>
        )}

        {transactions && transactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>View Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "milestones" ? "default" : "outline"}
                  onClick={() => setViewMode("milestones")}
                >
                  Milestones
                </Button>
                <Button
                  variant={viewMode === "statistics" ? "default" : "outline"}
                  onClick={() => setViewMode("statistics")}
                >
                  Statistics
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === "milestones" && result && (
          <MilestoneResults result={result} />
        )}

        {viewMode === "statistics" && statistics && (
          <StatisticsDashboard stats={statistics} />
        )}

        {transactions && transactions.length > 0 && (
          <div className="pt-6 border-t space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Enjoying this tool? If it helped you track your progress,
                consider supporting me!{" "}
                <span className="animate-heartbeat">❤️</span>
              </p>
            </div>
            <div className="flex justify-center">
              <BuyMeACoffee username="naderferjani" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

