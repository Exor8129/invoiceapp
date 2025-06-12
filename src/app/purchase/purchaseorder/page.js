"use client";

import React, { useEffect, useState } from "react";
import {
  Checkbox,
  Select,
  Card,
  InputNumber,
  Button,
  Input,
  Modal,
} from "antd";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Merge } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ItemPurchaseSection() {
  const [items, setItems] = useState([]);
  const [selectedName, setSelectedName] = useState(null);
  const [itemDetails, setItemDetails] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [purchaseQty, setPurchaseQty] = useState(1);
  const [fySalesData, setFySalesData] = useState([]);
  const [totalQty, setTotalQty] = useState(0);
  const [avgQty, setAvgQty] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [reorderData, setReorderData] = useState([]);
  const [permanentData, setPermanentData] = useState([]);
  const [range, setRange] = useState("3months");
  const [searchText, setSearchText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [suggestedItems, setSuggestedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mergeSelected, setMergeSelected] = useState([]);

  // Fetch all items (names) from a dedicated API endpoint
  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch("/api/purchasehelperupload"); // create this API to return all stock items list
        if (!res.ok) throw new Error("Failed to fetch items");
        const data = await res.json();
        setItems(data); // expect array of { uid, name, ... }
      } catch (err) {
        console.error(err);
      }
    }
    fetchItems();
  }, []);

  //Fetch Stock and Re order data
  useEffect(() => {
    async function fetchStockData() {
      try {
        const res = await fetch("/api/purchasehelperupload");
        const res2 = await fetch("/api/permanentitem");

        if (!res.ok) throw new Error("Failed to Fetch Stock Data");
        const data = await res.json();
        // console.log("Data from API:", data);
        setReorderData(data);

        if (!res2.ok) throw new Error("Failed to fetch Permenant Data");
        const pdata = await res2.json();
        setPermanentData(pdata);
      } catch (error) {
        console.log("Error Fetching Item:", error);
      }
    }
    fetchStockData();
  }, []);

  const filteredData = reorderData.filter((item) => {
    const permItem = permanentData.find((p) => p.uid === item.uid);
    const orderStatus = "N/A"; // Replace with actual status if available

    return (
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (permItem?.supplier || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      orderStatus.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  //Fetch 2024-2025 sales data

  useEffect(() => {
    async function fetchdata() {
      try {
        const res = await fetch("/api/sale2425");
        if (!res.ok) throw new Error("Failed to Fetch Data");
        const data = await res.json();
        // console.log("Data from API:", data);
        setFySalesData(data); // store the fetched sales
      } catch (error) {
        console.log("Error Fetching Item:", error);
      }
    }

    fetchdata();
  }, []);

  const handleToggle = () => {
    setRange((prev) => (prev === "3months" ? "1year" : "3months"));
  };

  const onCancel = () => {
    setMergeSelected([]); // Clear selected items
    setShowModal(false); // Close the modal
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setMergeSelected(suggestedItems);
    } else {
      setMergeSelected([]);
    }
  };

  const isAllSelected =
    mergeSelected.length === suggestedItems.length && suggestedItems.length > 0;
  const isIndeterminate =
    mergeSelected.length > 0 && mergeSelected.length < suggestedItems.length;

  const toggleItem = (item) => {
    setMergeSelected((prevSelected) => {
      const exists = prevSelected.some((i) => i.id === item.id);
      if (exists) {
        return prevSelected.filter((i) => i.id !== item.id);
      } else {
        return [...prevSelected, item];
      }
    });
  };

  const handleMerge = async (mergedItem) => {
    try {
      if (!mergedItem) return;

      const rougedata = mergedItem[0]; // this is the item being merged INTO

      console.log(
        "Converting:",
        rougedata.item_name,
        "to",
        selectedName,
        "& UID",
        rougedata.uid,
        "to",
        itemDetails.uid
      );

      // Update local data
      const updatedSalesData = fySalesData.map((item) => {
        if (item.uid === rougedata.uid) {
          return {
            ...item,
            item_name: selectedName,
            uid: itemDetails.uid,
          };
        }
        return item;
      });

      setSalesData(updatedSalesData);

      // Update in DB
      const response = await fetch("/api/updateItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUid: rougedata.uid,
          originalName: rougedata.item_name,
          newName: selectedName,
          newUid: itemDetails.uid,
        }),
      });

      if (!response.ok) throw new Error("Failed to update item in database");

      await handleSelect(selectedName);

      setSelectedName(selectedName);
      setUid(itemDetails.uid);

      setShowModal(false);
      setSelectedItem(null);

      console.log("Merge successful");
    } catch (error) {
      console.error("Error merging items:", error);
    }
  };

  const handleSelect = async (name) => {
    console.log("Selected item:", name);
    setSelectedName(name);

    try {
      // Step 1: Fetch item details
      console.log("Fetching item details for:", name);
      const res = await fetch(`/api/itemdetails/${encodeURIComponent(name)}`);
      console.log("Item details fetch response:", res);

      if (!res.ok)
        throw new Error(`Error fetching item details: ${res.status}`);

      const data = await res.json();
      console.log("Item details fetched:", data);

      setItemDetails(data.item);
      setSalesData(data.sales || []);

      // Step 2: Check if item exists in SaleData2425
      console.log("Checking item existence in SaleData2425...");
      const checkRes = await fetch("/api/sale2425", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName: name }),
      });

      console.log("SaleData2425 check response:", checkRes);

      const checkData = await checkRes.json();
      console.log("SaleData2425 check data:", checkData);

      // Step 3: If no exact match, show suggestions
      if (!checkData.exactMatch && checkData.suggestions.length > 0) {
        console.log(
          "No exact match found. Showing suggestions:",
          checkData.suggestions
        );
        setSuggestedItems(checkData.suggestions);
        setShowModal(true);
      } else {
        console.log("Exact match found or no suggestions.");
      }
    } catch (error) {
      console.error("Error in handleSelect:", error);
      setItemDetails(null);
      setSalesData([]);
    }
  };

  const handleCreatePO = async () => {
    if (!selectedName) return alert("Select an item first");
    try {
      const res = await fetch("/api/createpo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedName, qty: purchaseQty }), // send name & qty
      });
      const result = await res.json();
      alert(result.message || "Purchase Order Created");
    } catch (error) {
      alert("Failed to create purchase order");
      console.error(error);
    }
  };

  const handleUpdateROL=()=>{
    console.log("Update Clicked")
  }

  const getChartData = () => {
    const monthlyTotals = {};
    salesData.forEach(({ date, qty }) => {
      const month = new Date(date).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthlyTotals[month] = (monthlyTotals[month] || 0) + qty;
    });
    const labels = Object.keys(monthlyTotals);
    const data = Object.values(monthlyTotals);
    return {
      labels,
      datasets: [
        {
          label: "Sales Qty",
          data,
          backgroundColor: "rgba(54, 162, 235, 0.5)",
        },
      ],
    };
  };

  const getCurrentFYChartData = () => {
    const monthlyTotals = {};

    // Filter only sales data for the selected item
    const filteredData = fySalesData.filter(
      (entry) => entry.item_name === selectedName
    );

    filteredData.forEach(({ invoice_date, quantity }) => {
      const date = new Date(invoice_date);
      if (date >= new Date("2024-04-01") && date <= new Date("2025-03-31")) {
        const label = date.toLocaleString("default", { month: "short" });
        monthlyTotals[label] = (monthlyTotals[label] || 0) + quantity;
      }
    });

    const labels = Object.keys(monthlyTotals);
    const data = Object.values(monthlyTotals);

    // console.log("Filtered Chart for:", selectedName);
    // console.log("Chart Labels:", labels);
    // console.log("Chart Data:", data);

    return {
      labels,
      datasets: [
        {
          label: `Sales Qty - ${selectedName}`,
          data,
          backgroundColor: "rgba(54, 162, 235, 0.5)",
        },
      ],
      plugins: [ChartDataLabels], // Optional, plugin auto-detects too
      options: {
        plugins: {
          datalabels: {
            anchor: "end",
            align: "start",
            color: "#333",
            font: {
              weight: "bold",
            },
            formatter: (value) => value,
          },
        },
      },
    };
  };

  useEffect(() => {
    if (!selectedName) {
      setTotalQty(0);
      setAvgQty(0);
      return;
    }

    const monthlyTotals = {};

    fySalesData
      .filter((entry) => entry.item_name === selectedName)
      .forEach(({ invoice_date, quantity }) => {
        const date = new Date(invoice_date);
        if (date >= new Date("2024-04-01") && date <= new Date("2025-03-31")) {
          const label = date.toLocaleString("default", { month: "short" });
          monthlyTotals[label] = (monthlyTotals[label] || 0) + quantity;
        }
      });

    const total = Object.values(monthlyTotals).reduce(
      (sum, val) => sum + val,
      0
    );
    const avg = (total / Object.keys(monthlyTotals).length || 0).toFixed(2);

    setTotalQty(total);
    setAvgQty(avg);
  }, [selectedName, fySalesData]);

  return (
    <div className="p-4 space-y-4">
      <Card title="Select Item">
        {/* Always visible search select */}
        <Input
          placeholder="Search by product name, supplier, or order status"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: "100%", marginBottom: 8 }}
        />

        {/* Expand toggle */}
        <div
          onClick={() => setExpanded(!expanded)}
          style={{
            cursor: "pointer",
            userSelect: "none",
            fontWeight: "bold",
            fontSize: "18px",
            display: "inline-flex",
            alignItems: "center",
          }}
          aria-expanded={expanded}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setExpanded(!expanded);
          }}
        >
          <span
            style={{
              display: "inline-block",
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              marginRight: 8,
              fontSize: "14px",
            }}
          >
            &gt;
          </span>
          <span style={{ fontSize: "14px", gap: 12, marginRight: 10 }}>
            Show More Options
          </span>
        </div>

        {/* Expandable content */}
        {expanded && (
          <div
            style={{
              display: "flex",
              marginTop: 12,
              gap: 12,
            }}
          >
            {/* Left: Listbox-style low stock items */}
            <div
              style={{
                flex: 3,
                border: "1px solid #ccc",
                borderRadius: 4,
                padding: "8px",
                maxHeight: 280,
                overflowY: "auto",
                fontSize: "14px",
                backgroundColor: "#f9f9f9",
              }}
              
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button 
            onClick={handleUpdateROL}
            className="px-1 py-0.5 text-[0.25rem] font-normal bg-gray-200 border border-gray-400 text-gray-800 rounded-sm hover:bg-blue-700 hover:text-white">
              Update
            </button>
            <span className="text-sm text-gray-600 italic">
              Last updated on: {new Date().toLocaleString()}
            </span>
          </div>
              <div
                style={{ display: "flex", fontWeight: "bold", marginBottom: 4 }}
              >
                <div
                  style={{ flex: 2 }}
                  className="flex items-center justify-center"
                >
                  Item Name
                </div>
                <div
                  style={{ flex: 1 }}
                  className="flex items-center justify-center"
                >
                  Stock
                </div>
                <div
                  style={{ flex: 1 }}
                  className="flex items-center justify-center"
                >
                  Re-order Level
                </div>
                <div
                  style={{ flex: 1 }}
                  className="flex items-center justify-center"
                >
                  Supplier
                </div>
                <div
                  style={{ flex: 1 }}
                  className="flex items-center justify-center"
                >
                  Order Status
                </div>
              </div>

              {filteredData.map((item, index) => {
                const permItem = permanentData.find((p) => p.uid === item.uid); // or match by `name`
                return (
                  <div
                    key={index}
                    onClick={() => handleSelect(item.name)}
                    style={{
                      display: "flex",
                      padding: "4px 0",
                      borderBottom: "1px solid #eee",
                      cursor: "pointer",
                      backgroundColor:
                        item.name === selectedName ? "#e6f7ff" : "transparent",
                    }}
                  >
                    <div style={{ flex: 2 }}>{item.name}</div>
                    <div
                      style={{ flex: 1 }}
                      className="flex items-center justify-center"
                    >
                      {item.stock}
                    </div>
                    <div
                      style={{ flex: 1 }}
                      className="flex items-center justify-center"
                    >
                      {permItem?.udrl != null ? (
                        <span className="font-bold italic text-blue-500">
                          {permItem.udrl}
                        </span>
                      ) : permItem?.reorder_level != null ? (
                        <span>{permItem.reorder_level}</span>
                      ) : (
                        <span>N/A</span>
                      )}
                    </div>
                    <div
                      style={{ flex: 1 }}
                      className="flex items-center justify-center"
                    >
                      {permItem?.supplier ?? "N/A"}
                    </div>
                    <div
                      style={{ flex: 1 }}
                      className="flex items-center justify-center"
                    >
                      {" "}
                      N/A
                    </div>
                  </div>
                );
              })}
            </div>

            <Modal
              title="OOPS No Data Found...."
              open={showModal}
              footer={[
                <Button
                  key="merge"
                  type="primary"
                  icon={<Merge size={16} />}
                  disabled={mergeSelected.length === 0}
                  onClick={() => {
                    if (mergeSelected.length > 0) {
                      handleMerge(mergeSelected);
                    }
                  }}
                >
                  Merge
                </Button>,
              ]}
              onCancel={onCancel}
            >
              <p>
                No exact match found in Sales Data 2024-2025. Found closest
                matches:
              </p>

              <Checkbox
                onChange={toggleSelectAll}
                checked={isAllSelected}
                indeterminate={mergeSelected.length > 0 && !isAllSelected}
                style={{ marginBottom: 12 }}
              >
                Select All
              </Checkbox>

              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {suggestedItems.map((item) => {
                    const isSelected = mergeSelected.some(
                      (i) => i.uid === item.uid
                    );
                    return (
                      <li
                        key={item.id}
                        onClick={() => toggleItem(item)}
                        style={{
                          padding: "8px 12px",
                          marginBottom: 4,
                          backgroundColor: isSelected ? "#bae7ff" : "#f5f5f5",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontWeight: isSelected ? "bold" : "normal",
                          userSelect: "none",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleItem(item)}
                          style={{ marginRight: 8 }}
                        />
                        {item.item_name}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Modal>
            {/* Right: Options panel */}
            <div
              style={{
                flex: 1.5,
                border: "1px solid #ccc",
                borderRadius: 4,
                padding: "8px",
                backgroundColor: "#fafafa",
                fontSize: "14px",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: 8 }}>Options</div>
              <div>
                <label>
                  <input type="checkbox" /> Show only critical stock
                </label>
              </div>
              <div>
                <label>
                  <input type="checkbox" /> Include inactive items
                </label>
              </div>
              <div>
                <label>
                  <input type="checkbox" /> Auto-select lowest stock
                </label>
              </div>
              {/* 🔁 Add the toggle here */}
              <div style={{ marginTop: 12 }}>
                <label>
                  <span style={{ marginRight: 8 }}>View:</span>
                  <button
                    onClick={handleToggle}
                    style={{
                      padding: "4px 10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      backgroundColor: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {range === "3months" ? "Last 3 Months" : "Previous FY"}
                  </button>
                </label>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Section 2 and 3: Side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-5">
        {/* Section 2: Details & Graph */}
        <Card title="Item Details & Sales Graph">
          {itemDetails ? (
            <>
              <p>
                <strong>Name:</strong> {itemDetails.name}
              </p>
              <p>
                <strong>Stock:</strong> {itemDetails.stock}
              </p>
              <p>
                <strong>Buying Price:</strong> ₹{itemDetails.buyingprice}
              </p>

              {/* Chart 1: Current Financial Year */}
              <div style={{ height: 200, marginBottom: 24 }}>
                <h4>Current Financial Year</h4>
                <Bar data={getChartData()} />
              </div>

              {/* Divider */}
              <hr
                style={{
                  marginTop: "50px",
                  marginBottom: "24px",
                  borderColor: "#8d8383",
                }}
              />

              {/* Chart 2: Previous Financial Year */}
              <div style={{ height: 450, marginBottom: 24 }}>
                <h4>Previous Financial Year</h4>
                <p>
                  <strong>Total Qty Sold: </strong> {totalQty}
                </p>
                <p>
                  <strong>Average Qty Sold/Month: </strong>
                  {avgQty}{" "}
                </p>

                <Bar data={getCurrentFYChartData()} />
              </div>
            </>
          ) : (
            <p>Select an item to view details</p>
          )}
        </Card>

        {/* Section 3: Purchase Order */}
        <Card title="Create Purchase Order">
          {itemDetails ? (
            <>
              <p>
                <strong>Selected Item:</strong> {itemDetails.name}
              </p>
              <p>Enter quantity to purchase:</p>
              <InputNumber
                min={1}
                value={purchaseQty}
                onChange={setPurchaseQty}
              />
              <br />
              <br />
              <Button type="primary" onClick={handleCreatePO}>
                Create Purchase Order
              </Button>
            </>
          ) : (
            <p>Select an item to create PO</p>
          )}
        </Card>
      </div>
    </div>
  );
}
