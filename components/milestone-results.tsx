"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MilestoneResult } from "@/lib/milestone-calculator";

interface MilestoneResultsProps {
  result: MilestoneResult;
}

export function MilestoneResults({ result }: MilestoneResultsProps) {
  return (
    <div className="space-y-6">
      {/* First Transaction Date */}
      <Card>
        <CardHeader>
          <CardTitle>First Positive Transaction</CardTitle>
          <CardDescription>
            Started tracking on {result.firstPositiveTransactionDate}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Milestones Table */}
      <Card>
        <CardHeader>
          <CardTitle>Milestone Summary</CardTitle>
          <CardDescription>
            This table shows every ${result.milestoneAmount.toLocaleString()}{" "}
            milestone you&apos;ve reached. For each milestone, you can see how
            many days it took to reach it and the exact date you reached it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result.milestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No milestones reached yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">
                      Milestone
                    </th>
                    <th className="text-left py-2 px-4 font-medium">
                      Days to Reach
                    </th>
                    <th className="text-left py-2 px-4 font-medium">
                      Date Reached
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.milestones.map((milestone, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-2 px-4">
                        ${milestone.amountReached.toLocaleString()}
                      </td>
                      <td className="py-2 px-4">
                        {milestone.daysToGetThisK} days
                      </td>
                      <td className="py-2 px-4">{milestone.dateReached}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Current Progress</CardTitle>
          <CardDescription>
            Progress towards the next ${result.milestoneAmount.toLocaleString()}{" "}
            milestone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Current cumulative gain:
              </span>
              <span className="font-medium">
                ${result.currentCumulativeSum.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Progress towards next milestone:
              </span>
              <span className="font-medium">
                ${result.progressTowardsNextK.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Remaining to reach $
                {result.nextMilestoneTarget.toLocaleString()}:
              </span>
              <Badge
                variant={result.remainingToNextK > 0 ? "default" : "secondary"}
              >
                ${result.remainingToNextK.toFixed(2)}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pt-2">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all"
                style={{
                  width: `${Math.min(
                    (result.progressTowardsNextK / result.milestoneAmount) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Days Since Last Milestone */}
      {result.daysSinceLastMilestone !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Time Since Last Milestone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">
              {result.daysSinceLastMilestone} days
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
