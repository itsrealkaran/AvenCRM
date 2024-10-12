"use client";
import React, { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation"; 
import dashboardIcon from '../../public/dashboard/dashboard.svg';
import calendarIcon from '../../public/dashboard/calender.svg';
import crashReportIcon from '../../public/dashboard/crashReport.svg';
import paymentIcon from '../../public/dashboard/payment.svg';
import emailIcon from '../../public/dashboard/email.svg';
import settingsIcon from '../../public/dashboard/settings.svg';
import sidebarLogo from '../../public/dashboard/Sidebar.svg';

interface MenuItems { 
  name: string;
  icon: StaticImageData;
  path: string;
}

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const router = useRouter();

  const menuItems: MenuItems[] = [
    { name: "Dashboard", icon: dashboardIcon, path: "/companydashboard/dashboard" },
    { name: "Calendar", icon: calendarIcon, path: "/companydashboard/calendar" },
    { name: "Crash Report", icon: crashReportIcon, path: "/companydashboard/crashreport" },
    { name: "Payments", icon: paymentIcon, path: "/companydashboard/payments" },
    { name: "Email", icon: emailIcon, path: "/companydashboard/email" },
    { name: "Settings", icon: settingsIcon, path: "/companydashboard/settings" },
  ];

  const handleNavigation = (path: string, name: React.SetStateAction<string>) => {
    setActiveTab(name);
    router.push(path);
  };

  return (
    <div className="w-[17%] px-8 gap-10 flex flex-col items-center py-9 pt-7 border border-y-0 border-l-0 static border-r h-screen bg-white">
      <div className="text-2xl mr-auto ml-3 font-semibold flex gap-2 items-center">
        <span>
          <Image
            height={50}
            width={50}
            alt="Dashboard Logo"
            src={sidebarLogo}
            className="size-9"
          />
        </span>
        Dashboard
      </div>

      <div className="w-full flex gap-4 text-sm font-medium flex-col items-center">
        {menuItems.map((item) => (
          <div
            key={item.name}
            onClick={() => handleNavigation(item.path, item.name)}
            className={`flex justify-between w-full duration-500 transition-all items-center p-5 py-1 rounded-lg ${
              activeTab === item.name
                ? "bg-[#5932EA] text-white"
                : "text-gray-400"
            } cursor-pointer`}
          >
            <div className="flex gap-4 items-center">
              <Image
                width={25}
                height={25}
                alt={`${item.name} Icon`}
                className="size-7"
                src={item.icon}
                style={{
                  filter: activeTab === item.name ? "invert(1)" : "none",
                  transition: "filter 0.3s ease-in-out",
                }}
              />
              <p>{item.name}</p>
            </div>
            <p className="text-2xl">{">"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
