"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, Table, Button, Card, Row, Col, Input, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function UploadPage() {
  const [salesData, setSalesData] = useState([]);
  const [stockData, setStockData] = useState([]);

  const [salesSearch, setSalesSearch] = useState("");
  const [stockSearch, setStockSearch] = useState("");

  const handleUpload = async (file, setData, type) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(worksheet, { range: 6 });

    let filtered;
    if (type === "sales") {
      filtered = json.map((row) => ({
        Date: row["Date"],
        ItemName: row["ItemName"],
        Qty: row["Qty"],
      }));
    } else if (type === "stock") {
      filtered = json.map((row) => ({
        UID: row["UID"],
        Name: row["Name"],
        HSNCode: row["HSNCode"],
        BuyingPrice: row["BuyingPrice"],
        Supplier: row["Supplier"],
        Tax: row["Tax"],
        Stock: row["Stock"],
      }));
    }

    setData(filtered);
    message.success(`${type.toUpperCase()} file loaded successfully`);
    return false;
  };

  const uploadBothToDB = async (salesData, stockData) => {
    try {
      const res = await fetch("/api/purchasehelperupload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salesData,
          stockData,
        }),
      });

      if (res.ok) {
        message.success("All data uploaded successfully");
      } else {
        message.error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Upload failed");
    }
  };

  const columnsFromData = (data) => {
    return Object.keys(data[0] || {}).map((key) => ({
      title: key,
      dataIndex: key,
      key,
    }));
  };

  const filteredSales = salesData.filter((item) =>
    item.ItemName?.toLowerCase().includes(salesSearch.toLowerCase())
  );

  const filteredStock = stockData.filter(
    (item) =>
      item.Name?.toLowerCase().includes(stockSearch.toLowerCase()) ||
      item.Supplier?.toLowerCase().includes(stockSearch.toLowerCase())
  );

  return (
    <div className="p-4">
      <Row gutter={16}>
        {/* Sales Section */}
        <Col xs={24} md={12}>
          <Card title="Sales Upload" variant={false}>
            <Upload
              beforeUpload={(file) => handleUpload(file, setSalesData, "sales")}
              showUploadList={false}
              accept=".xlsx,.xls"
            >
              <Button icon={<UploadOutlined />}>Select Sales File</Button>
            </Upload>

            {salesData.length > 0 && (
              <>
                <Input
                  className="mt-4 mb-2"
                  placeholder="Search by Item Name"
                  value={salesSearch}
                  onChange={(e) => setSalesSearch(e.target.value)}
                />
                <Table
                  dataSource={filteredSales}
                  columns={columnsFromData(filteredSales)}
                  rowKey={(record, index) => index}
                  size="small"
                  pagination={{ pageSize: 10 }}
                />
              </>
            )}
          </Card>
        </Col>

        {/* Stock Section */}
        <Col xs={24} md={12}>
          <Card title="Stock Upload" variant={false}>
            <Upload
              beforeUpload={(file) => handleUpload(file, setStockData, "stock")}
              showUploadList={false}
              accept=".xlsx,.xls"
            >
              <Button icon={<UploadOutlined />}>Select Stock File</Button>
            </Upload>

            {stockData.length > 0 && (
              <>
                <Input
                  className="mt-4 mb-2"
                  placeholder="Search by Name or Supplier"
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                />
                <Table
                  dataSource={filteredStock}
                  columns={columnsFromData(filteredStock)}
                  rowKey={(record, index) => index}
                  size="small"
                  pagination={{ pageSize: 10 }}
                />
              </>
            )}
          </Card>
        </Col>
      </Row>

      {/* Unified Upload Button */}
      <Row justify="center" className="mt-4">
        <Button
          type="primary"
          size="large"
          onClick={() => uploadBothToDB(salesData, stockData)}
          disabled={!salesData.length || !stockData.length}
        >
          Upload Both to DB
        </Button>
      </Row>
    </div>
  );
}
