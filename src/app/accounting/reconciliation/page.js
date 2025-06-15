"use client";
import { useState } from "react";
import { Table, Upload, Button, DatePicker, Select, Space, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

export default function BankReconciliation() {
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [dateRange, setDateRange] = useState([dayjs().startOf("month"), dayjs()]);
  const [erpData, setErpData] = useState([]);
  const [bankData, setBankData] = useState([]);

  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { title: "Reconciled", dataIndex: "reconciled", key: "reconciled", render: () => <input type="checkbox" /> },
  ];

  const handleUpload = (file) => {
    // TODO: Parse CSV or Excel and update bankData
    console.log("Uploaded file:", file);
    return false;
  };

  return (
    <div className="p-4 space-y-6">
      <Title level={3}>Bank Reconciliation</Title>

      <Space direction="horizontal" size="middle">
        <Select defaultValue={selectedBank} onChange={setSelectedBank}>
          <Option value="HDFC">HDFC Bank</Option>
          <Option value="SBI">SBI</Option>
          <Option value="ICICI">ICICI</Option>
        </Select>

        <RangePicker value={dateRange} onChange={setDateRange} />
        
        <Upload beforeUpload={handleUpload} showUploadList={false}>
          <Button icon={<UploadOutlined />}>Upload Bank Statement</Button>
        </Upload>
      </Space>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Title level={5}>ERP Ledger</Title>
          <Table dataSource={erpData} columns={columns} rowKey="id" pagination={false} />
        </div>
        <div>
          <Title level={5}>Bank Statement</Title>
          <Table dataSource={bankData} columns={columns} rowKey="id" pagination={false} />
        </div>
      </div>

      <Space>
        <Button type="primary">Reconcile Selected</Button>
        <Button>Save</Button>
        <Button>Export PDF</Button>
      </Space>
    </div>
  );
}
