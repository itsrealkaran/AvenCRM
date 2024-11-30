"use client"

import { DonutChart } from "../lib/graphComp/DonutChart"


const data = [
  {
    name: "Income",
    amount: 4890,
  },
  {
    name: "Outcome",
    amount: 2103,
  },
  {
    name: "Others",
    amount: 2050,
  }

]

export const DonutChartHero = () => (
  <div className="h-full ">
      <div className="flex flex-col items-center justify-center gap-4">
      <DonutChart
        data={data}
        variant="pie"
        category="name"
        value="amount"
        valueFormatter={(number: number) =>
          `$${Intl.NumberFormat("us").format(number).toString()}`
        }
      />
    </div>


  </div>
)