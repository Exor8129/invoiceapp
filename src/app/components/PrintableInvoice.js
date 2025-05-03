// components/PrintableInvoice.js
import React from 'react';

const PrintableInvoice = ({ invoiceData }) => {
  return (
    <div
      className="w-[794px] h-[1123px] p-12 bg-white bg-no-repeat bg-cover"
      style={{
        backgroundImage: `url('/invoice-template.png')`, // move the PNG to public folder
      }}
    >
      {/* Overlaying dynamic data */}
      <div className="relative text-xs font-medium">
        <div className="absolute top-[100px] left-[100px]">
          {invoiceData.date}
        </div>
        <div className="absolute top-[130px] left-[100px]">
          {invoiceData.partyName}
        </div>

        {/* Loop for item rows */}
        {invoiceData.items.map((item, index) => (
          <div key={index} className="absolute" style={{ top: `${200 + index * 30}px`, left: '100px' }}>
            {item.name} - Qty: {item.qty} - ₹{item.rate}
          </div>
        ))}

        {/* Total */}
        <div className="absolute bottom-[100px] right-[100px] text-right">
          ₹{invoiceData.total}
        </div>
      </div>
    </div>
  );
};

export default PrintableInvoice;
