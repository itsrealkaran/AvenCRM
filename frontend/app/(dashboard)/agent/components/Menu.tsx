import React from 'react';
import Link from '@/node_modules/next/link';
import { FaAngleRight } from 'react-icons/fa6';

interface MenuProps {
  className?: string;
  icons: React.ComponentType;
  heading: string;
  reff: string;
  isActive: boolean;
  onClick: () => void;
}

const Menu: React.FC<MenuProps> = ({
  icons: Icon,
  heading,
  reff,
  isActive,
  onClick,
  className,
}) => {
  return (
    <Link
      href={reff}
      className={`${className} group flex w-full items-center justify-between rounded-lg px-3 py-2 transition-all duration-200 ease-in-out
        ${
          isActive
            ? 'bg-primary text-white'
            : 'text-gray-600 hover:bg-primary/10 hover:text-primary'
        }`}
      onClick={onClick}
    >
      <div className='flex items-center gap-3'>
        <div className='flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-200'></div>
        <span
          className={`text-sm font-medium capitalize whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-primary'}`}
        >
          {heading}
        </span>
      </div>
      <FaAngleRight
        className={`h-4 w-4 transition-transform duration-200 
        ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'} 
        ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`}
      />
    </Link>
  );
};

export default Menu;
