"use client"

import { DonutChart } from "../lib/graphComp/DonutChart"


const data = [
  {
    name: "SolarCells",
    amount: 4890,
  },
  {
    name: "Glass",
    amount: 2103,
  },
  {
    name: "JunctionBox",
    amount: 2050,
  },
  {
    name: "Adhesive",
    amount: 1300,
  },
  {
    name: "BackSheet",
    amount: 1100,
  },
  {
    name: "Frame",
    amount: 700,
  },
  {
    name: "Encapsulant",
    amount: 200,
  },
]

export const DonutChartHero = () => (
  <div className="flex flex-col gap-12 ">
    <div className="flex flex-col items-center overflow-y-auto  justify-center gap-4">
      <p className="text-gray-700 dark:text-gray-300">Variant: `donut`</p>
      <DonutChart
        data={data}
        category="name"
        value="amount"
        valueFormatter={(number: number) =>
          `$${Intl.NumberFormat("us").format(number).toString()}`
        }
      />
    </div>

  </div>
)