import type { Metadata } from "next";
import SideNavBar from "./components/SideNavbar";
import { TopNavbar } from "./components/TopNavbar";

export const metadata: Metadata = {
  title: "Second Dashboard",
  description: "Professional Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{display:"flex" , height:"100vh"}} className="w-[100vw]   overflow-hidden">
        <div className="w-[18%]  h-full">
          <SideNavBar />
        </div>
        <div className="w-[82%] h-full overflow-y-auto">
          <TopNavbar />
          <div className="w-full h-full">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
