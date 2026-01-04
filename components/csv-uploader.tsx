"use client";

import { useCallback, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CSVUploaderProps {
  onFileParsed: (transactions: Array<{ date: Date; amount: number }>) => void;
  onError: (error: string) => void;
}

export function CSVUploader({ onFileParsed, onError }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      onError("");

      try {
        // Dynamically import papaparse
        const Papa = (await import("papaparse")).default;

        const text = await file.text();

        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            try {
              // Check if required columns exist
              if (results.data.length === 0) {
                onError("CSV file is empty or has no valid data.");
                setIsProcessing(false);
                return;
              }

              const firstRow = results.data[0] as Record<string, unknown>;
              if (!firstRow["Date"] && !firstRow["date"]) {
                onError('CSV file must contain a "Date" column.');
                setIsProcessing(false);
                return;
              }

              const amountKey =
                firstRow["Amount $"] !== undefined
                  ? "Amount $"
                  : firstRow["amount"] !== undefined
                  ? "amount"
                  : null;

              if (!amountKey) {
                onError(
                  'CSV file must contain an "Amount $" or "amount" column.'
                );
                setIsProcessing(false);
                return;
              }

              const transactions = (results.data as Record<string, unknown>[])
                .map((record) => {
                  const dateStr = (record["Date"] || record["date"]) as
                    | string
                    | undefined;
                  const amountStr = record[amountKey] as
                    | string
                    | number
                    | undefined;

                  if (
                    !dateStr ||
                    amountStr === undefined ||
                    amountStr === null ||
                    amountStr === ""
                  ) {
                    return null;
                  }

                  const date = new Date(dateStr);
                  const amount = parseFloat(String(amountStr));

                  if (isNaN(date.getTime()) || isNaN(amount)) {
                    return null;
                  }

                  return {
                    date,
                    amount,
                  };
                })
                .filter((t): t is { date: Date; amount: number } => t !== null);

              if (transactions.length === 0) {
                onError("No valid transactions found in the CSV file.");
                setIsProcessing(false);
                return;
              }

              onFileParsed(transactions);
              setIsInstructionsOpen(false);
              setIsProcessing(false);
            } catch (error) {
              onError(
                `Error processing CSV data: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`
              );
              setIsProcessing(false);
            }
          },
          error: (error: Error) => {
            onError(`Error parsing CSV: ${error.message}`);
            setIsProcessing(false);
          },
        });
      } catch (error) {
        onError(
          `Error reading file: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        setIsProcessing(false);
      }
    },
    [onFileParsed, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
        parseCSV(file);
      } else {
        onError("Please upload a CSV file.");
      }
    },
    [parseCSV, onError]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        parseCSV(file);
      }
    },
    [parseCSV]
  );

  return (
    <Card>
      <CardContent>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border border-dashed rounded-lg p-12 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            isProcessing && "opacity-50 pointer-events-none"
          )}
        >
          {isProcessing ? (
            <div className="space-y-2">
              <div className="text-lg font-medium">Processing CSV file...</div>
              <div className="text-sm text-muted-foreground">Please wait</div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-lg font-medium">
                  Drop your CSV file here
                </div>
                <div className="text-sm text-muted-foreground">
                  or click to browse
                </div>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden"
                  id="csv-upload"
                  disabled={isProcessing}
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  Choose File
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                All calculations happen in your browser. Nothing is sent to any
                server.
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 pt-6 border-t">
          <details className="group" open={isInstructionsOpen}>
            <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-primary transition-colors">
              How to download your CSV from Upwork (Desktop only)
            </summary>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>
                  Go to <strong>Manage Finances</strong> then{" "}
                  <strong>Transactions</strong>
                </li>
                <li>
                  Set <strong>Date range</strong> to <strong>All time</strong>
                </li>
                <li>
                  Set <strong>Transaction type</strong> to{" "}
                  <strong>All type</strong>
                </li>
                <li>
                  Set <strong>Client</strong> to <strong>All clients</strong>
                </li>
                <li>
                  Set <strong>Contract</strong> to{" "}
                  <strong>All contracts</strong>
                </li>
                <li>
                  Click <strong>Select download</strong> and then click{" "}
                  <strong>Download CSV</strong>
                </li>
              </ol>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
