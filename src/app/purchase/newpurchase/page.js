"use client";

import { Button, Select, Switch, Table, message } from "antd";
import { PenIcon, Trash } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ReactToPrint from "react-to-print";
import PrintableInvoice from "@/app/components/PrintableInvoice";
import Search from "antd/es/input/Search";

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
  const [offsetValue, setOffsetValue] = useState("N/A");
  const [purchaseNumber, setPurchaseNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isNewView, setIsNewView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const calcFooterPos = (count) => {
  if (count <= 9)  return 880;
  if (count <= 14) return 1150;
  if (count <= 30) return 385 + count * 55;
  if (count <= 35) return 2300;
  return 385 + count * 55;
};

const footerPos = useMemo(
  () => calcFooterPos(invoiceItems.length),
  [invoiceItems]
);
  //Temporary Code Area starts Here
  const columns = [
    {
      title: "Invoice No",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
    },
    {
      title: "Party Name",
      dataIndex: "partyName",
      key: "partyName",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
  ];

  const dummyData = [
    {
      key: "1",
      invoiceNo: "INV001",
      partyName: "ABC Medicals",
      date: "2025-05-24",
      amount: "₹15,000",
    },
    {
      key: "2",
      invoiceNo: "INV002",
      partyName: "XYZ Pharma",
      date: "2025-05-23",
      amount: "₹22,500",
    },
    // Add more rows as needed
  ];

  //Temporary Code Area ends Here

  const dataFiltered = dummyData.filter(
    (item) =>
      item.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePOChange = (e) => {
    setPoNumber(e.target.value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowPicker(false);
  };

 const fetchPurchaseNumber = async () => {
  try {
    const res  = await fetch("/api/purchaseentries/next-number");   // ① new endpoint
    const data = await res.json();
    console.log("New Purchase Number:", data.purchaseNumber);        // 🐞 DEBUG
    setPurchaseNumber(data.purchaseNumber);                          // ② state setter
  } catch (err) {
    toast.error("❌ Failed to fetch purchase number");
    console.error("Purchase fetch failed:", err);
  }
};
  useEffect(() => {
    fetchPurchaseNumber();
  }, []);

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
      // console.log("Fetched Item Details", data);
      setItemOptions(data);
    };
    fetchItems();
  }, []);
  const MAX_ITEMS = 35; // upper limit
  const handleAddItem = () => {
    if (!currentItem.name || !currentItem.qty || !currentItem.rate) return;

    const selectedItem = itemOptions.find(
      (item) => item.name === currentItem.name
    );

    const itemToAdd = {
      ...currentItem,
      hsn: selectedItem?.hsn ?? null,
      tax: selectedItem?.tax ?? null,
      mrp: selectedItem?.mrp ?? null,
    };

    // Duplicate‑name guard (ignore if we’re just editing the same row)
    const isDuplicate = invoiceItems.some(
      (item, index) => item.name === itemToAdd.name && index !== editIndex
    );
    if (isDuplicate) {
      toast.error("❌ Item already added!");
      return;
    }

    /** ───────────────────────────────
     * NEW: enforce the 50‑item limit
     *  • When editing (`editIndex !== null`) the count doesn’t change.
     *  • When adding (`editIndex === null`) the count will grow by 1.
     * ─────────────────────────────── */
    const nextCount =
      editIndex === null ? invoiceItems.length + 1 : invoiceItems.length;

    if (nextCount > MAX_ITEMS) {
      toast.error(
        "❌ Cannot add more than 50 products. Please create a new bill."
      );
      return;
    }

    // Build the new array
    const updatedItems =
      editIndex !== null
        ? invoiceItems.map((it, i) => (i === editIndex ? itemToAdd : it))
        : [...invoiceItems, itemToAdd];

    // Compute offset and update state
    const offset = 385 + updatedItems.length * 55;
    toast.success(`✅ Item added successfully! ${offset}`);

    setInvoiceItems(updatedItems);
    setEditIndex(null);
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

  // import { useEffect } from "react";

  const taxSummary = [];

  invoiceItems.forEach((item) => {
    const taxRate = item.tax;
    const taxableValue = item.rate * item.qty;
    const existing = taxSummary.find((t) => t.taxRate === taxRate);

    if (existing) {
      existing.taxableValue += taxableValue;
    } else {
      taxSummary.push({
        taxRate,
        hsn: item.hsn,
        taxableValue,
      });
    }
  });

  // Sort by taxRate (ascending)
  taxSummary.sort((a, b) => a.taxRate - b.taxRate);

  // Add calculated CGST/SGST
  taxSummary.forEach((t) => {
    const taxAmount = (t.taxableValue * t.taxRate) / 100;
    t.cgst = taxAmount / 2;
    t.sgst = taxAmount / 2;
    t.totalTax = taxAmount;
  });

  function numberToWordsIndian(num) {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const scales = ["", "Thousand", "Lakh", "Crore"];

    function getWords(n) {
      if (n === 0) return "";
      if (n < 20) return ones[n];
      if (n < 100)
        return (
          tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
        );
      if (n < 1000)
        return (
          ones[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 !== 0 ? " and " + getWords(n % 100) : "")
        );

      let result = "";
      const parts = [
        { divisor: 10000000, label: "Crore" },
        { divisor: 100000, label: "Lakh" },
        { divisor: 1000, label: "Thousand" },
        { divisor: 100, label: "Hundred" },
      ];

      for (const part of parts) {
        if (n >= part.divisor) {
          const quotient = Math.floor(n / part.divisor);
          result += getWords(quotient) + " " + part.label + " ";
          n %= part.divisor;
        }
      }

      if (n > 0) result += getWords(n);
      return result.trim();
    }

    const [rupees, paise] = num.toFixed(2).split(".").map(Number);

    let words = "";
    if (rupees > 0) {
      words += getWords(rupees) + " Rupees";
    }
    if (paise > 0) {
      words += (rupees > 0 ? " and " : "") + getWords(paise) + " Paise";
    }
    if (!words) {
      words = "Zero Rupees";
    }

    return words + " Only";
  }

  const total = invoiceItems.reduce(
    (acc, item) => acc + item.qty * item.rate,
    0
  );
  const taxAmount = invoiceItems.reduce(
    (acc, item) => acc + (item.qty * item.rate * item.tax) / 100,
    0
  );

  const grandTotal = total + taxAmount;
  const roundOff = Math.round(grandTotal) - grandTotal;
  const finalTotal = Math.round(grandTotal);
  const totalInWords = numberToWordsIndian(finalTotal);

  const handleSaveInvoice = async () => {
    const printableContent = document.getElementById("printable-invoice");
    if (!printableContent) {
      console.error("Printable content not found");
      return;
    }

    const printWindow = window.open("", "_blank", "width=800,height=1000");
    if (!printWindow) {
      alert("Popup blocked. Please allow popups and try again.");
      return;
    }

    const headerImageUrl = "/HeaderPNG1.png"; // top background
    const footerImageUrl = "/FooterPNG.png"; // second image (positioned lower)

    // Count how many .invoice-item elements exist
    // const itemCount = printableContent.querySelectorAll(".invoice-item").length;
    const itemCount = invoiceItems.length;

    // ─── tweak here if your layout ever changes ───────────────────────
    const OFFSET = 880; // ≤ 9 items
    const SMALL_MAX = 9; // inclusive
    const MEDIUM_MAX = 14; // inclusive
    const MID_RANGE_MAX = 30; // inclusive
    const MID_RANGE_POSITION = 1150; // 10‑14 items
    const BIG_CLAMP_MAX = 35; // inclusive
    const BIG_CLAMP_POSITION = 2300; // 31‑35 items
    const DYNAMIC_BASE = 385; // for dynamic formula
    const ROW_HEIGHT = 55; // per‑item increment
    // ──────────────────────────────────────────────────────────────────

    let footerPosition;

    if (itemCount <= SMALL_MAX) {
      // 0–9
      footerPosition = OFFSET;
    } else if (itemCount <= MEDIUM_MAX) {
      // 10–14
      footerPosition = MID_RANGE_POSITION;
    } else if (itemCount <= MID_RANGE_MAX) {
      // 15–30
      footerPosition = DYNAMIC_BASE + itemCount * ROW_HEIGHT;
    } else if (itemCount <= BIG_CLAMP_MAX) {
      // 31–35
      footerPosition = BIG_CLAMP_POSITION;
    } else {
      // 36+
      footerPosition = DYNAMIC_BASE + itemCount * ROW_HEIGHT;
    }
      //  footerPos.current = footerPosition;
    toast.success(`footerPosition = ${footerPosition} `);

    // toast.success(`✅ footerPosition! ${footerPosition} checkValue ${checkValue} itemCount ${itemCount} `);
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice</title>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              height: 100%;
              font-family: Arial, sans-serif;
              background-image: url('${headerImageUrl}');
              background-size: cover;
              background-repeat: no-repeat;
              background-position: top center;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
  
            .content {
              position: relative;
              z-index: 10;
              padding: 40px;
            }
  
            .footer-image {
              position: absolute;
              left: 10px;
              top: ${footerPosition}px;
              width: 774px;
            }
  
            @media print {
              html, body {
                background-image: url('${headerImageUrl}') !important;
                background-size: cover !important;
                background-repeat: no-repeat !important;
                background-position: top center !important;
              }
  
              /* Trigger page break if the footer position exceeds the page limit */
              .footer-image {
                page-break-before: always; /* Ensure footer is pushed to a new page if needed */
              }
            }
          </style>
        </head>
        <body>
          <div class="content">
            ${printableContent.innerHTML}
            <img class="footer-image" src="${footerImageUrl}" />
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  // Function to reset the form fields
  const resetFields = () => {
    // fetchInvoiceNumber();
    setPartyName(""); // Reset party name
    setSelectedDate(null); // Reset selected date
    setPoNumber(""); // Reset PO number
    setSelectedShippingAddress(""); // Reset shipping address
    setInvoiceItems([]); // Clear the invoice items list
  };

  const handleSave = async () => {
    if (
      !invoiceNumber ||
      !partyName ||
      !selectedDate ||
      invoiceItems.length === 0
    ) {
      toast.error("❌ Please complete all invoice details.");
      return;
    }

    setIsSaving(true);

    const invoicePayload = {
      invoiceNumber,
      partyName,
      invoiceDate: selectedDate.toISOString(),
      poNumber,
      poDate: selectedDate.toISOString(),
      shippingAddress: selectedShippingAddress || "",
      items: invoiceItems.map((item) => ({
        name: item.name,
        hsn: item.hsn,
        tax: item.tax,
        qty: item.qty,
        rate: item.rate,
        total: (item.rate * (1 + item.tax / 100) * item.qty).toFixed(2),
      })),
      totals: {
        total,
        sgst: taxAmount / 2,
        cgst: taxAmount / 2,
        roundOff,
        grandTotal: finalTotal,
      },
      summary: taxSummary,
    };

    try {
      const res = await fetch("/api/purchaseentries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoicePayload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Purchase saved successfully.");

        try {
          resetFields();
          console.log("✅ resetFields succeeded");

          await fetchPurchaseNumber();
          console.log("✅ fetchInvoiceNumber succeeded");
        } catch (innerErr) {
          console.error("❌ Post-save error:", innerErr);
          toast.error(
            "⚠️ Invoice saved, but failed to reset form or fetch new invoice number."
          );
        }
      } else {
        toast.error(
          `❌ Error saving invoice: ${data.message || "Unknown error"}`
        );
      }
    } catch (err) {
      toast.error("❌ Failed to save invoice. Please try again.");
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex md:flex-row flex-col gap-4 h-[calc(100vh-100px)]">
      {/* Input Section */}

      {isNewView ? (
        <div className="md:w-1/2 bg-white shadow rounded-2xl p-6 space-y-6 overflow-y-auto h-full">
          <div className="mb-4 flex items-center gap-3">
            <Switch
              checked={isNewView}
              onChange={() => setIsNewView(!isNewView)}
            />
            <span className="text-gray-700 font-medium">
              {isNewView
                ? "Go To New Invoice"
                : "Click to Show Slips & Saved Invoices"}
            </span>
          </div>
          {/* Slip and Saved Bill Section */}
          <Search
            className="mb-4"
            placeholder="Search By Party Name/Slip Number"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Table
            columns={columns}
            dataSource={dataFiltered}
            pagination={{ pageSize: 5 }}
          />
        </div>
      ) : (
        <div className="md:w-1/2 bg-white shadow rounded-2xl p-6 space-y-6 overflow-y-auto h-full">
          <div className="mb-4 flex items-center gap-3">
            <Switch
              checked={isNewView}
              onChange={() => setIsNewView(!isNewView)}
            />
            <span className="text-gray-700 font-medium">
              {isNewView
                ? "Go To New Invoice "
                : "Click to Show Slips & Saved Invoices"}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Create New Purchase
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
      )}

      {/* Preview Section */}
      <div className="md:w-1/2 bg-white shadow rounded-xl p-6 space-y-6 overflow-y-auto h-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Purchase Preview
        </h2>

        {/* Invoice Header Details */}
        <div className="border p-6 rounded-lg bg-gray-50">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <p className="text-black-600">
                <span className="text-gray-600 font-semibold">
                  Purchase Number: {purchaseNumber || "N/A"}
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
                    Purchase Date:
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
                <tr key={index} className="invoice-item hover:bg-gray-50">
                  <td className="border p-3">{index + 1}</td>
                  <td className="border p-3">{item.name}</td>
                  <td className="border p-3">{item.hsn}</td>
                  <td className="border p-3">{item.tax}%</td>
                  <td className="border p-3">{item.mrp ?? "N/A"}</td>
                  <td className="border p-3"></td>
                  <td className="border p-3">{item.qty}</td>
                  <td className="border p-3">{item.rate}</td>
                  <td className="border p-3">
                    {(item.rate * (1 + item.tax / 100) * item.qty).toFixed(2)}
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

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-sm leading-relaxed border border-gray-300 p-4 rounded-md">
            <strong>Declaration:</strong>
            <p className="mt-1 ml-2">
              We declare that this invoice shows the actual price of the goods
              described and that all particulars are true and correct.
            </p>
            <p className="mt-4 font-semibold">Rupees in Words:</p>
            <p className="ml-2 italic">{totalInWords}</p>
          </div>

          <div className="border border-gray-300 rounded-md p-4 text-sm">
            <div className="flex justify-between py-1 border-b">
              <span>Total</span>
              <span>{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span>SGST</span>
              <span>{(taxAmount / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span>CGST</span>
              <span>{(taxAmount / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span>Round Off</span>
              <span>{roundOff.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base py-1">
              <span>Grand Total</span>
              <span>{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-10 border border-gray-300 rounded">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-t border-gray-300">
              <thead className="bg-gray-100">
                <tr className="text-gray-700">
                  <th className="border p-2">Tax</th>
                  <th className="border p-2">HSN/SAC</th>
                  <th className="border p-2">Taxable Value</th>
                  <th className="border p-2">Central Tax Rate</th>
                  <th className="border p-2">Central Tax Amount</th>
                  <th className="border p-2">State Tax Rate</th>
                  <th className="border p-2">State Tax Amount</th>
                  <th className="border p-2">Total Tax Amount</th>
                </tr>
              </thead>
              <tbody>
                {taxSummary.map((t, idx) => (
                  <tr key={idx}>
                    <td className="border p-2">{t.taxRate}%</td>
                    <td className="border p-2">{t.hsn}</td>
                    <td className="border p-2">{t.taxableValue.toFixed(2)}</td>
                    <td className="border p-2">
                      {(t.taxRate / 2).toFixed(2)}%
                    </td>
                    <td className="border p-2">{t.cgst.toFixed(2)}</td>
                    <td className="border p-2">
                      {(t.taxRate / 2).toFixed(2)}%
                    </td>
                    <td className="border p-2">{t.sgst.toFixed(2)}</td>
                    <td className="border p-2">{t.totalTax.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold">
                  <td className="border p-2 text-right" colSpan={2}>
                    Total
                  </td>
                  <td className="border p-2">
                    {taxSummary
                      .reduce((sum, t) => sum + t.taxableValue, 0)
                      .toFixed(2)}
                  </td>
                  <td className="border p-2"></td>
                  <td className="border p-2">
                    {taxSummary.reduce((sum, t) => sum + t.cgst, 0).toFixed(2)}
                  </td>
                  <td className="border p-2"></td>
                  <td className="border p-2">
                    {taxSummary.reduce((sum, t) => sum + t.sgst, 0).toFixed(2)}
                  </td>
                  <td className="border p-2">
                    {taxSummary
                      .reduce((sum, t) => sum + t.totalTax, 0)
                      .toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <Button onClick={handleSaveInvoice}>Print Purchase</Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Purchase"}
        </Button>
      </div>

      {/* For Printing Block */}
      <div
        id="printable-invoice"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "794px", // A4 width in px
          height: "1123px", // A4 height in px
          zIndex: 9999,
          backgroundImage: "url('/HeaderPNG1.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "top left",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
          display: "none",
        }}
        className="print:block"
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Example: Party Name */}
          <div
            style={{
              position: "absolute",
              top: "112px",
              left: "0px",
              fontSize: "14px",
              fontWeight: "500",
              maxWidth: "200px", // or any suitable width
              whiteSpace: "normal", // allows wrapping
              wordWrap: "break-word", // breaks long words if needed
            }}
          >
            {partyName}
          </div>

          {/* Example: Bill Address */}
          <div
            style={{
              position: "absolute",
              top: "155px",
              left: "0px",
              fontSize: "12px",
              fontWeight: "500",
              maxWidth: "195px", // or any suitable width
              whiteSpace: "normal", // allows wrapping
              wordWrap: "break-word", // breaks long words if needed
            }}
          >
            {selectedParty?.address}
          </div>

          {/* Example: GSTIN */}
          <div
            style={{
              position: "absolute",
              top: "110px",
              left: "250px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {selectedParty?.gst}
          </div>

          {/* Example: Phone Number */}
          <div
            style={{
              position: "absolute",
              top: "250px",
              left: "0px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            PH: {selectedParty?.contact || "N/A"}
          </div>

          {/* Example: State */}
          <div
            style={{
              position: "absolute",
              top: "200px",
              left: "510px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {selectedParty?.state || "N/A"}
          </div>

          {/* Example: State Code */}
          <div
            style={{
              position: "absolute",
              top: "200px",
              left: "650px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {selectedParty?.code || "N/A"}
          </div>

          {/* Example: Shipping Address */}
          <div
            style={{
              position: "absolute",
              top: "205px",
              left: "250px",
              fontSize: "12px",
              fontWeight: "500",
              maxWidth: "200px", // or any suitable width
              whiteSpace: "normal", // allows wrapping
              wordWrap: "break-word", // breaks long words if needed
            }}
          >
            {selectedShippingAddress}
          </div>

          {/* Example: Invoice Date */}
          <div
            style={{
              position: "absolute",
              top: "110px",
              left: "630px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {format(selectedDate, "dd-MM-yyyy")}
          </div>

          {invoiceItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                position: "absolute",
                top: `${335 + idx * 55}px`,
                left: "-30px",
                display: "flex",
                width: "774px",
                fontSize: "12px",
                fontWeight: "500",
                height: "55px",
                borderBottom: "1px solid #dddddd",
              }}
            >
              <div
                style={{
                  width: "45px",
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                  borderRight: "1px solid #dddddd",
                }}
              >
                {idx + 1}
              </div>
              <div
                style={{
                  width: "300px",
                  padding: "10px 4px",
                  borderRight: "1px solid #dddddd",
                }}
              >
                {item.name}
              </div>
              <div
                style={{
                  width: "74px",
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                  borderRight: "1px solid #dddddd",
                }}
              >
                {item.hsn || ""}
              </div>
              <div
                style={{
                  width: "36px",
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                  borderRight: "1px solid #dddddd",
                }}
              >
                {item.tax || ""}%
              </div>
              <div
                style={{
                  width: "45px",
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                  borderRight: "1px solid #dddddd",
                }}
              >
                1250
              </div>
              <div
                style={{
                  width: "50px",
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                  borderRight: "1px solid #dddddd",
                }}
              >
                20%
              </div>
              <div
                style={{
                  width: "62px",
                  borderRight: "1px solid #dddddd",
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                }}
              >
                {item.qty}
              </div>
              <div
                style={{
                  width: "62px",
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                  borderRight: "0.01px solid #dddddd",
                }}
              >
                {item.rate}
              </div>
              <div
                style={{
                  width: "90px",
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                }}
              >
                {(item.qty * item.rate).toFixed(2)}
              </div>
            </div>
          ))}

          {/* Render empty rows to ensure 9 total */}
          {Array.from({ length: Math.max(0, 9 - invoiceItems.length) }).map(
            (_, idx) => (
              <div
                key={`empty-${idx}`}
                style={{
                  position: "absolute",
                  top: `${335 + (invoiceItems.length + idx) * 55}px`,
                  left: "-30px",
                  display: "flex",
                  width: "774px",
                  fontSize: "12px",
                  fontWeight: "500",
                  height: "55px",
                  borderBottom: "1px solid #dddddd",
                }}
              >
                {[45, 306, 74, 35, 45, 50, 60, 62, 90].map((w, i) => (
                  <div
                    key={i}
                    style={{
                      width: `${w}px`,
                      borderRight: i !== 8 ? "1px solid #dddddd" : "none",
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                    }}
                  >
                    &nbsp;
                  </div>
                ))}
              </div>
            )
          )}

          {taxSummary.map((t, idx) => (
            <div
              key={idx}
              style={{
                position: "absolute",
                top: `${(footerPos+8) + idx * 16}px`, // 55 px is the row‑height you’re already using
                left: "-30px",
                display: "flex",
                fontSize: "10px",
                fontWeight: 500,
              }}
            >
              {/* TAX % */}
              <div
                style={{
                  width: "50px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                }}
              >
                {t.taxRate}%
              </div>

              {/* TAXABLE VALUE */}
              <div
                style={{
                  width: "115px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  marginLeft: "12px",
                  zIndex: 10,
                }}
              >
                {t.taxableValue.toFixed(2)}
              </div>
              {/* Central Tax Rate*/}
              <div
                style={{
                  width: "50px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  

                  zIndex: 10,
                }}
              >
                {(t.taxRate / 2).toFixed(2)}%
              </div>

              {/* CGST*/}
              <div
                style={{
                  width: "75px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: "2px",
                  zIndex: 10,
                }}
              >
                {t.cgst.toFixed(2)}
              </div>

              {/* State Tax Rate*/}
              <div
                style={{
                  width: "50px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  zIndex: 10,
                }}
              >
                {(t.taxRate / 2).toFixed(2)}%
              </div>

              {/* SGST*/}
              <div
                style={{
                  width: "70px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  // marginLeft: "2px",

                  zIndex: 10,
                }}
              >
                {t.sgst.toFixed(2)}
              </div>

              {/* Total Tax*/}
              <div
                style={{
                  width: "120px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                 
                  zIndex: 10,
                }}
              >
                {t.totalTax.toFixed(2)}
              </div>
            </div>
          ))}
          {/* Total */}
          <div
            style={{
              position: "absolute",
              top: footerPos-35,
              // top: "1150px",

              left: "650px",
              fontSize: "12px",
              fontWeight: "500",
              maxWidth: "200px", // or any suitable width
              whiteSpace: "normal", // allows wrapping
              wordWrap: "break-word", // breaks long words if needed
              zIndex: 10,
            }}
          >
         {taxSummary.reduce((sum, t) => sum + t.taxableValue, 0).toFixed(2)}
          </div>

          {/* CGST */}
          <div
            style={{
              position: "absolute",
              top: footerPos-12,
              left: "650px",
              fontSize: "12px",
              fontWeight: "500",
              maxWidth: "200px", // or any suitable width
              whiteSpace: "normal", // allows wrapping
              wordWrap: "break-word", // breaks long words if needed
              zIndex: 10,
            }}
          >
            {(taxAmount / 2).toFixed(2)}
          </div>
          {/* SGST */}
          <div
            style={{
              position: "absolute",
              top: footerPos+10,
              left: "650px",
              fontSize: "12px",
              fontWeight: "500",
              maxWidth: "200px", // or any suitable width
              whiteSpace: "normal", // allows wrapping
              wordWrap: "break-word", // breaks long words if needed
              zIndex: 10,
            }}
          >
            {(taxAmount / 2).toFixed(2)}
          </div>

          {/* Roundoff */}
          <div
            style={{
              position: "absolute",
              top: footerPos+31,
              left: "650px",
              fontSize: "12px",
              fontWeight: "500",
              maxWidth: "200px", // or any suitable width
              whiteSpace: "normal", // allows wrapping
              wordWrap: "break-word", // breaks long words if needed
              zIndex: 10,
            }}
          >
            {roundOff.toFixed(2)}
          </div>

          {/* Grand Total */}
          <div
            style={{
              position: "absolute",
              top: footerPos+52,
              left: "650px",
              fontSize: "12px",
              fontWeight: "500",
              maxWidth: "200px", // or any suitable width
              whiteSpace: "normal", // allows wrapping
              wordWrap: "break-word", // breaks long words if needed
              zIndex: 10,
            }}
          >
            {finalTotal.toFixed(2)}
          </div>

          {/* Total In Words */}
          <div
            style={{
              position: "absolute",
              top: footerPos+90,
              left: "30px",
              fontSize: "10px",
              fontWeight: "500",
              // width:"600",
              maxWidth: "800px", // or any suitable width
              whiteSpace: "normal", // allows wrapping
              wordWrap: "break-word", // breaks long words if needed
              zIndex: 10,
            }}
          >
            {totalInWords}
          </div>
        </div>
      </div>
    </div>
  );
}
