"use client"

import { LineChart } from "../lib/graphComp/LineChart"

const chartdata = [
  {
    date: "Jan 23",
    Completed: 2890,
    InProgress: 2338,
    On_hold: 2556
  },
  {
    date: "Feb 23",
    Completed: 2756,
    InProgress: 2103,
    On_hold: 3556
  },
  {
    date: "Mar 23",
    Completed: 3322,
    InProgress: 2194,
    On_hold: 1556
  },
  {
    date: "Apr 23",
    Completed: 3470,
    InProgress: 2108,
    On_hold: 3056
  },
  {
    date: "May 23",
    Completed: 3475,
    InProgress: 1812,
    On_hold: 1056
  },
  {
    date: "Jun 23",
    Completed: 3129,
    InProgress: 1726,
    On_hold: 2056
  },
  {
    date: "Jul 23",
    Completed: 3490,
    InProgress: 1982,
    On_hold: 2016
  },
  {
    date: "Aug 23",
    Completed: 2903,
    InProgress: 2012,
    On_hold: 4046
  },
  {
    date: "Sep 23",
    Completed: 2643,
    InProgress: 2342,
    On_hold: 2916
  },
  {
    date: "Oct 23",
    Completed: 2837,
    InProgress: 2473,
    On_hold: 4056
  },
  {
    date: "Nov 23",
    Completed: 2954,
    InProgress: 3848,
    On_hold: 2006
  },
  {
    date: "Dec 23",
    Completed: 3239,
    InProgress: 3736,
    On_hold: 1256
  },
  {
    date: "Dec 23",
    Completed: 2239,
    InProgress: 4736,
    On_hold: 4056
  },
]




export const LineChartHero = () => (
  <LineChart
    className="h-full w-full text-[11px]"
    data={chartdata}
    index="date"
    categories={["Completed", "InProgress" , "On_hold"]}
    valueFormatter={(number: number) =>
      `$${Intl.NumberFormat("us").format(number).toString()}`
    }
    onValueChange={(v) => console.log(v)}
  />
)