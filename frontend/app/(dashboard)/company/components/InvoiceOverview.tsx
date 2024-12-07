import React from 'react';
import { FiDownload } from 'react-icons/fi';

interface InvoiceProps {
  func: () => void;
  open: boolean;
}

const InvoiceOverview: React.FC<InvoiceProps> = ({ func, open }) => {
  return (
    <>
      <div
        onClick={func}
        className='group hover:bg-gray-50 transition-colors duration-200 cursor-pointer'
      >
        <div className='grid grid-cols-4 gap-4 p-6 items-center'>
          <div className='text-sm text-gray-900'>Feb 2, 2023</div>
          
          <div>
            <h3 className='text-sm font-medium text-gray-900'>Quarterly true-up</h3>
            <p className='text-xs text-gray-500 mt-1'>July 14, 2023 - July 5, 2024</p>
          </div>
          
          <div className='text-sm font-medium text-gray-900'>₹50,000.00</div>
          
          <div className='flex items-center justify-between'>
            <div>
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                Paid
              </span>
              <button className='text-sm text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-1'>
                View Invoice
                <FiDownload className='w-3 h-3' />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {open && (
        <div className='fixed inset-0 bg-white z-50'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            <button
              onClick={func}
              className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Back to Invoices
            </button>
            {/* Add detailed invoice view content here */}
          </div>
        </div>
      )}
    </>
  );
};

export default InvoiceOverview;
