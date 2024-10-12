import React from "react";
import { Search, RefreshCw, ArrowDown, Filter } from "lucide-react";

const companies = [
  { company: "Emaar Properties", plan: "Luxury", dueDate: "Oct 30, 24", assignee: "Aisha Al-Mansoori", employee: "High" },
  { company: "Nakheel", plan: "Premium", dueDate: "Nov 15, 24", assignee: "Omar Al-Farsi", employee: "Medium" },
  { company: "Deyaar Development", plan: "Standard", dueDate: "Dec 01, 24", assignee: "Fatima Al-Sayed", employee: "Low" },
  { company: "Damac Properties", plan: "Luxury", dueDate: "Jan 10, 25", assignee: "Saeed Al-Nasr", employee: "High" },
  { company: "Azizi Developments", plan: "Premium", dueDate: "Feb 20, 25", assignee: "Layla Al-Hamadi", employee: "Medium" },
];

export default function Page() {
  return (
    <div className="py-8 flex flex-col gap-8 px-4 text-[#242533]">
      <div className="px-4 bg-white rounded-xl flex justify-between w-full py-4 shadow-sm">
        <p className="text-2xl font-medium">Company Stats</p>
        <div className="flex gap-3 items-center">
          <Search className="size-5" />
          <RefreshCw className="size-5" />
          <ArrowDown className="size-5" />
          <Filter className="size-5" />
        </div>
      </div>

      {companies.map((data, index) => (
        <div key={index} className="px-4 bg-white rounded-xl justify-between py-4 shadow-sm flex w-full">
          <div className="flex-1 text-center space-y-1">
            <p className="text-[#91929E]">Company</p>
            <p>{data.company}</p>
          </div>
          <div className="flex-1 text-center space-y-1">
            <p className="text-[#91929E]">Plan</p>
            <p>{data.plan}</p>
          </div>
          <div className="flex-1 text-center space-y-1">
            <p className="text-[#91929E]">Next Due</p>
            <p>{data.dueDate}</p>
          </div>
          <div className="flex-1 text-center space-y-1">
            <p className="text-[#91929E]">Assignee</p>
            <p>{data.assignee}</p>
          </div>
          <div className="flex-1 text-center space-y-1">
            <p className="text-[#91929E]">Employee</p>
            <p className={`text-lg ${data.employee === "High" ? "text-green-500" : data.employee === "Medium" ? "text-orange-400" : "text-red-500"}`}>
              {data.employee}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
