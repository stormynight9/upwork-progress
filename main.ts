// To run this script, you will need to have Node.js and TypeScript installed.
// 1. Save the code as a file, for example: `milestone_calculator.ts`
// 2. Install the 'csv-parse' and '@types/node' packages: `npm install csv-parse @types/node`
// 3. Compile the script: `tsc milestone_calculator.ts`
// 4. Run the compiled JavaScript file with your CSV file as an argument: `node milestone_calculator.js your_file.csv`

import * as fs from "fs";
import { parse } from "csv-parse";

interface Transaction {
  date: Date;
  amount: number;
}

interface Milestone {
  amountReached: number;
  daysToGetThisK: number;
  dateReached: string;
}

function calculateMilestones(transactions: Transaction[]) {
  const positiveTransactions = transactions
    .filter((t) => t.amount > 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (positiveTransactions.length === 0) {
    console.log("No positive transactions found in the data.");
    return;
  }

  // Helper function to format dates nicely
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  let cumulativeSum = 0;
  const cumulativeData = positiveTransactions.map((t) => {
    cumulativeSum += t.amount;
    return {
      date: t.date,
      cumulativeSum: cumulativeSum,
    };
  });

  const milestones: Milestone[] = [];
  let threshold = 1000;
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
      threshold += 1000;
      finalCumulativeSum = target.cumulativeSum;
    } else {
      finalCumulativeSum =
        cumulativeData[cumulativeData.length - 1].cumulativeSum;
      break;
    }
  }

  console.log(
    `First positive transaction date: ${formatDate(cumulativeData[0].date)}`
  );

  // Display milestones in a table format
  console.log("\nMilestone Summary Table:");
  console.log(
    "┌─────────────┬─────────────────────┬─────────────────────────────┐"
  );
  console.log(
    "│ Milestone   │ Days to Reach       │ Date Reached                │"
  );
  console.log(
    "├─────────────┼─────────────────────┼─────────────────────────────┤"
  );

  milestones.forEach((m) => {
    const milestoneStr = `$${m.amountReached.toLocaleString()}`;
    const daysStr = `${m.daysToGetThisK} days`;
    const dateStr = m.dateReached;

    console.log(
      `│ ${milestoneStr.padEnd(11)} │ ${daysStr.padEnd(19)} │ ${dateStr.padEnd(
        27
      )} │`
    );
  });

  console.log(
    "└─────────────┴─────────────────────┴─────────────────────────────┘"
  );

  console.log("\nCurrent progress for the next $1000 milestone:\n");
  const lastMilestoneAmount =
    milestones.length > 0 ? milestones[milestones.length - 1].amountReached : 0;
  const progressTowardsNextK = finalCumulativeSum - lastMilestoneAmount;
  const remainingToNextK = 1000 - progressTowardsNextK;

  console.log(`Current cumulative gain: $${finalCumulativeSum.toFixed(2)}`);
  console.log(
    `Progress towards the next $1000 milestone: $${progressTowardsNextK.toFixed(
      2
    )}`
  );
  console.log(
    `Remaining to reach ${
      lastMilestoneAmount + 1000
    }: $${remainingToNextK.toFixed(2)}`
  );

  // Calculate days since last milestone
  if (milestones.length > 0) {
    const lastMilestoneDate = new Date(
      milestones[milestones.length - 1].dateReached
    );
    const currentDate = new Date();
    const daysSinceLastMilestone = Math.floor(
      (currentDate.getTime() - lastMilestoneDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    console.log(`\nDays since last milestone: ${daysSinceLastMilestone} days`);
  }
}

const filePath = process.argv[2];
if (!filePath) {
  console.error("Please provide the path to your CSV file as an argument.");
  process.exit(1);
}

fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error(`Error reading the file: ${err}`);
    return;
  }

  parse(
    data,
    {
      columns: true,
      skip_empty_lines: true,
    },
    (err, records) => {
      if (err) {
        console.error(`Error parsing CSV: ${err}`);
        return;
      }

      const transactions = records.map((record: any) => ({
        date: new Date(record.Date),
        amount: parseFloat(record["Amount $"]),
      }));

      calculateMilestones(transactions);
    }
  );
});
