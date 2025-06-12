"use client";
import React, { useState, useRef } from "react";
import { Table, Input, Button, Upload } from "antd";
import "jspdf-autotable";
import {
  UploadOutlined,
  FilePdfOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
// import './styles/tailwind.css';

export default function MiniLedger() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef();
  const [partyName, setPartyName] = useState("PartyName");

  const columns = [
    { title: "InvoiceNo", dataIndex: "InvoiceNo" },
    { title: "Date", dataIndex: "Date" },
    { title: "Name", dataIndex: "Name" },
    { title: "AmountDue", dataIndex: "AmountDue" },
    { title: "Days", dataIndex: "Days" },
  ];

  const handleExcelUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "binary" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const tableData = rawData.slice(7).map((row, index) => ({
        key: index,
        InvoiceNo: row[0],
        Date: row[1],
        Name: row[2],
        AmountDue: row[3],
        Days: row[4],
      }));
      setData(tableData);
      setFilteredData(tableData);
    };
    reader.readAsBinaryString(file);
    return false;
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    const filtered = data.filter(
      (item) =>
        (item.InvoiceNo || "")
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase()) ||
        (item.Name || "").toString().toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
    // Set party name based on first match
    if (filtered.length > 0) {
      setPartyName(filtered[0].Name || "PartyName");
    }
  };

 const captureAndExport = async (type = "pdf") => {
  setShowExport(true);

  setTimeout(async () => {
    const element = exportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const fileName = partyName.trim() || "ledger";

    if (type === "pdf") {
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${fileName}.pdf`);
    } else {
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `${fileName}.jpg`;
      link.click();
    }

    setShowExport(false);
  }, 300);
};


  const handleRowSelection = (selectedKeys) => {
    setSelectedRowKeys(selectedKeys);

    if (selectedKeys.length > 0) {
      const selectedParty = filteredData.find(
        (item) => item.key === selectedKeys[0]
      );
      if (selectedParty) {
        const exactName = selectedParty.Name;
        setSearchTerm(exactName);
        setPartyName(exactName);

        const filtered = data.filter((item) => item.Name === exactName);
        setFilteredData(filtered);
      }
    }
  };

   return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        <div className="flex flex-wrap items-center gap-4 mb-4 justify-center">
          <Upload beforeUpload={handleExcelUpload} accept=".xlsx, .xls">
            <Button icon={<UploadOutlined />}>Upload Excel</Button>
          </Upload>
          <Input
            placeholder="Search by InvoiceNo or Name"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-64"
          />
          <Button
            icon={<FilePdfOutlined />}
            onClick={() => captureAndExport("pdf")}
          >
            Export PDF
          </Button>
          <Button
            icon={<FileImageOutlined />}
            onClick={() => captureAndExport("jpg")}
          >
            Export JPG
          </Button>
        </div>

        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: handleRowSelection,
          }}
          rowClassName={(record) =>
            selectedRowKeys.includes(record.key) ? "bg-yellow-100" : ""
          }
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 10 }}
          bordered
        />

        {/* Export table rendered conditionally and visibly */}
        {showExport && (
          <div
            ref={exportRef}
            style={{
              position: "absolute",
              top: "100vh", // off-screen but visible
              left: "0",
              background: "white",
              padding: "45px",
              zIndex: 1000,
            }}
          >
            {/** ✅ Define cellStyle before the table */}
            {(() => {
              const cellStyle = {
                border: "1px solid black",
                padding: "8px 12px",
                textAlign: "left",
                minHeight: "28px",
              };

              return (
                <table
                  style={{
                    borderCollapse: "collapse",
                    width: "100%",
                    fontSize: "12px",
                    border: "1px solid black",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={cellStyle}>InvoiceNo</th>
                      <th style={cellStyle}>Date</th>
                      <th style={cellStyle}>Name</th>
                      <th style={cellStyle}>AmountDue</th>
                      <th style={cellStyle}>Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row) => {
                      const isSelected = selectedRowKeys.includes(row.key);
                      return (
                        <tr
                          key={row.key}
                          style={{
                            backgroundColor: isSelected ? "#f1948a" : "white",
                          }}
                        >
                          <td style={cellStyle}>{row.InvoiceNo}</td>
                          <td style={cellStyle}>{row.Date}</td>
                          <td style={cellStyle}>{row.Name}</td>
                          <td style={cellStyle}>{row.AmountDue}</td>
                          <td style={cellStyle}>{row.Days}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}