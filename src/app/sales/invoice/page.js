"use client";

import { Select } from "antd";
import { PenIcon, Trash } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

export default function CreateInvoicePage() {
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    name: "",
    qty: "",
    rate: "",
  });
  const [itemOptions, setItemOptions] = useState([]);
  const [partyOptions, setPartyOptions] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [partyName, setPartyName] = useState("");
  const [selectedShippingAddress, setSelectedShippingAddress] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [isPOEditing, setIsPOEditing] = useState(false);
  const [poNumber, setPoNumber] = useState("N/A");

  const handlePOChange = (e) => {
    setPoNumber(e.target.value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowPicker(false);
  };

  useEffect(() => {
    const fetchParties = async () => {
      const res = await fetch("/api/parties");
      const data = await res.json();
      // console.log("Fetched Party Data",data);

      setPartyOptions(data);
    };
    fetchParties();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch("/api/items");
      const data = await res.json();
      console.log("Fetched Item Details",data);
      setItemOptions(data);
    };
    fetchItems();
  }, []);
  const handleAddItem = () => {
    if (!currentItem.name || !currentItem.qty || !currentItem.rate) return;

    // Find the selected item from itemOptions
    const selectedItem = itemOptions.find(
      (item) => item.name === currentItem.name
    );

    // If item found, update currentItem with hsn, tax, and mrp
    if (selectedItem) {
      setCurrentItem({
        ...currentItem,
        hsn: selectedItem.hsn,  // Add HSN code
        tax: selectedItem.tax,   // Add Tax percentage
        mrp: selectedItem.mrp,   // Add MRP
      });
    }

    if (editIndex !== null) {
      const updatedItems = [...invoiceItems];
      updatedItems[editIndex] = currentItem;
      setInvoiceItems(updatedItems);
      setEditIndex(null);
    } else {
      setInvoiceItems([...invoiceItems, currentItem]);
    }

    setCurrentItem({ name: "", qty: "", rate: "", hsn: "", tax: "", mrp: "" });
  };


  const handleDeleteItem = (index) => {
    const updatedItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(updatedItems);
    if (editIndex === index) {
      setEditIndex(null);
      setCurrentItem({ name: "", qty: "", rate: "" });
    }
  };

  const handleEditItem = (index) => {
    setCurrentItem(invoiceItems[index]);
    setEditIndex(index);
  };

  const handlePartyChange = (value) => {
    setPartyName(value);
    const selected = partyOptions.find((p) => p.name === value);
    setSelectedParty(selected);

    if (!selected?.shipping_address) {
      // If no shipping address, use billing address directly
      setShippingAddresses([]);
      setSelectedShippingAddress(selected?.address || "N/A");
    } else {
      const rawAddresses = selected.shipping_address
        .split("&")
        .map((addr) => addr.trim());

      const preparedAddresses = rawAddresses.map((addr) => ({
        address: addr.replace(/^\$/, "").trim(),
        isPrimary: addr.startsWith("$"),
      }));

      setShippingAddresses(preparedAddresses);

      const primary = preparedAddresses.find((addr) => addr.isPrimary);
      if (primary) {
        setSelectedShippingAddress(primary.address);
      } else {
        setSelectedShippingAddress(preparedAddresses[0].address);
      }
    }
  };



  // const itemOptions = ["Item A", "Item B", "Item C"];

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 min-h-screen bg-gray-50">
      {/* Input Section */}
      <div className="md:w-1/2 bg-white shadow rounded-2xl p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Create New Invoice
        </h2>

        {/* Party Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Party Name
          </label>
          <Select
            showSearch
            placeholder="Select Party"
            optionFilterProp="children"
            className="w-full"
            value={partyName}
            onChange={handlePartyChange}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {partyOptions.map((party) => (
              <Select.Option key={party.id} value={party.name}>
                {party.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Add Item */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Item
            </label>
            <Select
              showSearch
              placeholder="Select Item"
              className="w-full"
              value={currentItem.name}
              onChange={(value) =>
                setCurrentItem({ ...currentItem, name: value })
              }
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {itemOptions.map((item) => (
                <Select.Option key={item.id} value={item.name}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Qty
            </label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={currentItem.qty}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, qty: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Rate
            </label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={currentItem.rate}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, rate: e.target.value })
              }
            />
          </div>
        </div>

        {/* Add Item Button */}
        <button
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          onClick={handleAddItem}
        >
          {editIndex !== null ? "Update Item" : "Add Item"}
        </button>

        {/* Shipping Address Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Shipping Address
          </label>
          {shippingAddresses.length > 0 && (
            <Select
              className="w-full"
              value={selectedShippingAddress}
              onChange={(value) => setSelectedShippingAddress(value)}
            >
              {shippingAddresses.map((addrObj, index) => (
                <Select.Option key={index} value={addrObj.address}>
                  <div className="flex justify-between items-center">
                    <span>{addrObj.address}</span>
                    {addrObj.isPrimary && (
                      <span className="text-yellow-500 ml-2">⭐</span>
                    )}
                  </div>
                </Select.Option>
              ))}
            </Select>
          )}

          {selectedShippingAddress === "Same as Billing Address" && (
            <div className="mt-2 p-2 bg-green-100 text-green-800 rounded text-center text-sm">
              Shipping Address same as Billing Address
            </div>
          )}
        </div>

        {/* Credit Period */}
        <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg text-center text-sm font-semibold text-blue-800">
          Credit Period:{" "}
          {selectedParty ? selectedParty.credit_period || "N/A" : "N/A"} Days
        </div>

        {/* Current Item Quick Info */}
        {currentItem.name && (
          <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg text-sm space-y-1">
            <p>
              <strong>Quantity:</strong> {currentItem.qty}
            </p>
            <p>
              <strong>Rate:</strong> ₹{currentItem.rate}
            </p>
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div className="md:w-1/2 bg-white shadow rounded-xl p-6 space-y-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Invoice Preview
        </h2>

        {/* Invoice Header Details */}
        <div className="border p-6 rounded-lg bg-gray-50">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <p className="text-black-600">
                <span className="text-gray-600 font-semibold">
                  Invoice Number:
                </span>
              </p>
              <p className="text-black-600">
                <span className="text-gray-600 font-semibold">
                  Party Name:{" "}
                </span>
                {partyName || "N/A"}
              </p>
              
              <p className="text-black-600">
                <span className="text-gray-600 font-semibold">
                  Phone Number:
                </span>
                {selectedParty?.contact || "N/A"}
              </p>
              <p className="text-black-600">
                <span className="text-gray-600 font-semibold">
                  Billing Address:
                </span>
                {selectedParty?.address || "N/A"}
              </p>
              <p className="text-black-600">
                <span className="text-gray-600 font-semibold">State:</span>
                {selectedParty?.state || "N/A"}
              </p>
              <p className="text-black-600">
                <span className="text-gray-600 font-semibold">Code:</span>
                {selectedParty?.code || "N/A"}
              </p>
            </div>
            <div>
              <div className="relative">
                <p
                  className="text-black-600 cursor-pointer"
                  onClick={() => setShowPicker(true)}
                >
                  <span className="text-gray-600 font-semibold">
                    Invoice Date:
                  </span>{" "}
                  {format(selectedDate, "dd-MM-yyyy")}
                </p>

                {showPicker && (
                  <div className="absolute mt-2 bg-white p-2 rounded shadow-lg border z-10">
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      inline
                      dateFormat="dd-MM-yyyy"
                    />
                  </div>
                )}
              </div>

              <p className="text-black-600">
                <span className="text-gray-600 font-semibold">GSTIN:</span>
                {selectedParty?.gst || "N/A"}
              </p>
              <p className="text-black-600">
                <span className="text-gray-600 font-semibold">DL Number:</span>
                {selectedParty?.dlno || "N/A"}
              </p>
              <p className="text-black-600">
                <span className="text-gray-600 font-semibold">PO Number:</span>
                {/* Toggle PO Number input */}
                {isPOEditing ? (
                  <input
                    type="text"
                    value={poNumber === "N/A" ? "" : poNumber}
                    onChange={handlePOChange}
                    onBlur={() => setIsPOEditing(false)} // Close input field when user clicks away
                    className="border p-2 rounded"
                    placeholder="Enter PO Number"
                  />
                ) : (
                  <span
                    className="text-black-600 cursor-pointer"
                    onClick={() => setIsPOEditing(true)}
                  >
                    {poNumber}
                  </span>
                )}
              </p>
              <p
                className="text-black-600 cursor-pointer"
                onClick={() => setShowPicker(true)}
              >
                <span className="text-gray-600 font-semibold">PO Date:</span>{" "}
                {format(selectedDate, "dd-MM-yyyy")}
              </p>
              
              {selectedShippingAddress && (
                <p className="text-black-600">
                  <span className="text-gray-600 font-semibold">
                    Shipping Address:
                  </span>{" "}
                  {selectedShippingAddress}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr className="text-gray-700">
                <th className="border p-3">SL No</th>
                <th className="border p-3">Description of Goods</th>
                <th className="border p-3">HSN</th>
                <th className="border p-3">Tax</th>
                <th className="border p-3">MRP</th>
                <th className="border p-3">Disc</th>
                <th className="border p-3">Qty</th>
                <th className="border p-3">Rate</th>
                <th className="border p-3">Total</th>
                <th className="border p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border p-3">{index + 1}</td>
                  <td className="border p-3">{item.name}</td>
                  <td className="border p-3">{item.hsn}</td>
                  <td className="border p-3">{item.tax}%</td>
                  <td className="border p-3">{  "N/A" }</td>
                  <td className="border p-3">Disc</td>
                  <td className="border p-3">{item.qty}</td>
                  <td className="border p-3">{item.rate}</td>
                  <td className="border p-3">
                     {(item.qty * item.rate).toFixed(2)}
                  </td>
                  <td className="border p-3 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleEditItem(index)}
                        className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                        title="Edit"
                      >
                        <PenIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(index)}
                        className="p-2 rounded-full hover:bg-red-100 text-red-600 transition"
                        title="Delete"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grand Total */}
        <div className="flex justify-end">
          <div className="text-lg font-bold text-gray-800">
            Total: ₹{" "}
            {invoiceItems
              .reduce((sum, item) => sum + item.qty * item.rate, 0)
              .toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
