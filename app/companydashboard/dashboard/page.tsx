"use client"
import React from "react";
import SalesStatic from "@/components/dashboard/SalesStatic";
import PlansStatic from "@/components/dashboard/PlansStatus";
import { ArrowRight } from "lucide-react";
import RenewalGraph from "@/components/dashboard/RenewalGraph";
import { Card, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
export default function Page() {
  const router = useRouter();
  return (
    <div className="pb-20 px-4 flex flex-col gap-8 h-screen overflow-y-scroll no-scrollbar">
      <div className=" w-full flex gap-10 ">
        <SalesStatic />
        <PlansStatic />
      </div>

      <div className="h-[500px]">
        <RenewalGraph/>
      </div>

      <Card onClick={() => router.push('./dashboard/companystatus')} className="py-8 px-6 text-2xl w-full justify-between rounded-2xl flex">
        <CardTitle>Company Stats</CardTitle>
        <ArrowRight/>
      </Card>
    </div>
  );
}
