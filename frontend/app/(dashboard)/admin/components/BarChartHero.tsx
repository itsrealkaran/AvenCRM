"use client"

import { BarChart } from "../lib/graphComp/BarChart"




const chartdata = [
  {
    date: "Jan 23",
    Income: 2890,
    Outcome: 2338,
    Others:3303
  },

  {
    date: "Feb 23",
    Income: 2756,
    Outcome: 2103,
    Others:1303
  },
  {
    date: "Mar 23",
    Income: 3322,
    Outcome: 2194,
    Others:2303
  },
  {
    date: "Apr 23",
    Income: 3470,
    Outcome: 2108,
    Others:4303
  },
  {
    date: "May 23",
    Income: 3475,
    Outcome: 1812,
    Others:2003
  },
  {
    date: "Jun 23",
    Income: 3129,
    Outcome: 1726,
    Others:1903
  },
  {
    date: "Jul 23",
    Income: 3490,
    Outcome: 1982,
    Others:4573
  },
  {
    date: "Aug 23",
    Income: 2903,
    Outcome: 2012,
    Others:1000
  },
  {
    date: "Sep 23",
    Income: 2643,
    Outcome: 2342,
    Others:2503
  },
  {
    date: "Oct 23",
    Income: 2837,
    Outcome: 2473,
    Others:4003
  },
  {
    date: "Nov 23",
    Income: 2954,
    Outcome: 3848,
    Others:1303
  },
  {
    date: "Dec 23",
    Income: 3239,
    Outcome: 3736,
    Others:2993
  },
]

export const BarChartHero = () => (
  <BarChart
    className="h-full"
    data={chartdata}
    index="date"
    categories={["Income", "Outcome" , "Others"]}
    valueFormatter={(number: number) =>
      `$${Intl.NumberFormat("us").format(number).toString()}`
    }
    onValueChange={(v) => console.log(v)}
  />
)