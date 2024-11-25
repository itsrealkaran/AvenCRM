import Link from '@/node_modules/next/link';
import React from 'react';
import { FaAngleRight } from "react-icons/fa6";

interface MenuProps {
  icons: React.ComponentType; 
  heading: string;
  reff: string; 
  isActive: boolean; // New prop to check if it's active
  onClick: () => void; // Function to handle click event
}

const Menu: React.FC<MenuProps> = ({ icons: Icon, heading, reff, isActive, onClick }) => {
  return (
    <Link 
      href={reff} 
      className={`w-full flex justify-between py-[10px] rounded-[9px] pl-3 pr-[3px] items-center h-fit 
        ${isActive ? 'bg-[#5932ea] text-white' : 'opacity-45 hover:opacity-100 hover:bg-[#5932ea] hover:text-white'}`}
      onClick={onClick} // Trigger onClick when the menu item is clicked
    >
      {/* inner div for the logo and text */}
      <div className="capitalize h-full font-semibold flex gap-[15px] items-center">
        {/* this is the svg container */}
        <div className="text-[1.2rem]">{Icon && <Icon />}</div>
        <h1 className="text-[0.95rem]">{heading}</h1>
      </div>

      <div>
        <FaAngleRight />
      </div>
    </Link>
  );
};

export default Menu;
