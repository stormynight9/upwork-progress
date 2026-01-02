"use client";

import { useState, useMemo } from "react";
import { CSVUploader } from "@/components/csv-uploader";
import { MilestoneResults } from "@/components/milestone-results";
import {
  calculateMilestones,
  type Transaction,
} from "@/lib/milestone-calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BuyMeACoffee } from "@/components/buy-me-a-coffee";

export default function Page() {
  const [error, setError] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [milestoneAmountInput, setMilestoneAmountInput] =
    useState<string>("1000");

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

  const displayError = useMemo(() => {
    if (error) return error;
    if (transactions && transactions.length > 0 && !result) {
      return "No positive transactions found in the data.";
    }
    return "";
  }, [error, transactions, result]);

  const handleFileParsed = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    setError("");
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
            Upload your transaction CSV to see your milestone progress
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

        {result && <MilestoneResults result={result} />}

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

