"use client";

import { useState,useEffect } from "react";
import { Card, Modal, Button, Input, Form, Table, Space, Select } from "antd";
import { Database, Printer } from "lucide-react";
import { PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());

  const predefinedItems = [
    { name: "Ventilator Circuit" },
    { name: "Nebulizer Kit" },
    { name: "Pulse Oximeter" },
    { name: "BIPAP" },
    { name: "NIV Mask" },
    { name: "Oxygen Tube" },
  ];

  const predefinedPartys=[
    {party:"Gracemed"},
    {party:"Medicastle"},
    {party:"Amal Pharma"},
    {party:"Ciscomed"},
    {party:"Nova Surgical"},
    {party:"Central Surgicals"},
    {party:"Supriya Surgicals"},
    {party:"Soorya Surgicals"},
    {party:"Kerala Healthmart"},

  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
  
    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setItems([]);
  };

  const addItem = (values) => {
    setItems([...items, values]);
    form.resetFields(['name','qty']);
  };

  const handlePrint = () => {
    const partyname = form.getFieldValue("partyname");
    const timestamp = currentTime;
  
    // Create slip HTML
    const slipContent = `
      <html>
        <head>
          <title>Packing Slip</title>
          <style>
            @media print {
              @page {
                margin: 0;
              }
              body {
                margin: 0;
                font-family: monospace;
              }
            }
            body {
              padding: 10px;
              font-family: monospace;
              width: 250px;
            }
            h2 {
              text-align: center;
              margin: 0;
            }
            .info {
              font-size: 12px;
              margin-top: 6px;
            }
            table {
              width: 100%;
              font-size: 12px;
              margin-top: 10px;
              border-collapse: collapse;
            }
            td, th {
              padding: 2px 4px;
            }
            hr {
              margin: 10px 0;
            }
            .footer {
              font-size: 10px;
              text-align: center;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <h2>Packing Slip</h2>
          <div class="info">
            <div><strong>Party:</strong> ${partyname}</div>
            <div><strong>Date:</strong> ${timestamp}</div>
          </div>
          <hr />
          <table>
            <thead>
              <tr>
                <th align="left">Item</th>
                <th align="right">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td align="right">${item.qty}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <hr />
          <p class="footer">Thank you!</p>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `;
  
    // Open new window
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(slipContent);
      printWindow.document.close();
    }
  };

  const columns = [
    { title: "Item", dataIndex: "name", key: "name" },
    { title: "Qty", dataIndex: "qty", key: "qty" },
  ];

  const cards = [
    {
      title: "Create New Slip",
      icon: <Printer size={32} />,
      onClick: showModal,
    },
    {
      title: "Database",
      icon: <Database size={32} />,
      link: "/database",
    },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6">Packing Slip System</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, idx) =>
          card.onClick ? (
            <Card
              key={idx}
              hoverable
              onClick={card.onClick}
              className="w-64 h-40 flex flex-col items-center justify-center shadow-md rounded-xl"
            >
              <div className="text-blue-600 mb-3">{card.icon}</div>
              <div className="text-lg font-semibold">{card.title}</div>
            </Card>
          ) : (
            <a key={idx} href={card.link}>
              <Card
                hoverable
                className="w-64 h-40 flex flex-col items-center justify-center shadow-md rounded-xl"
              >
                <div className="text-blue-600 mb-3">{card.icon}</div>
                <div className="text-lg font-semibold">{card.title}</div>
              </Card>
            </a>
          )
        )}
      </div>

      <Modal
  title="Create New Slip"
  open={isModalOpen}
  onCancel={handleCancel}
  footer={null}
>
  {/* SECTION 1: HEADER */}
  <div className="mb-4">
    <h3 style={{ marginBottom: 10 }}>Create New Slip</h3>
    <div className="flex justify-between items-center flex-wrap gap-2">
      <Form form={form} layout="inline">
        <Form.Item
          name="partyname"
          rules={[{ required: true, message: "Select Party" }]}
        >
          <Select
            showSearch
            placeholder="Select Party"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.children?.toLowerCase().includes(input.toLowerCase())
            }
            style={{ width: 200 }}
          >
            {predefinedPartys.map((a, indx) => (
              <Select.Option key={indx} value={a.party}>
                {a.party}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
      <div className="text-sm text-gray-500">
      {currentTime}
      </div>
    </div>
  </div>

  {/* SECTION 2: ITEM ENTRY FORM */}
  <div className="border-t pt-4 mt-2">
  <Form
    form={form}
    layout="inline"
    onFinish={addItem}
    style={{ display: 'flex', flexWrap: 'nowrap', gap: '10px', alignItems: 'center' }}
  >
    <Form.Item
      name="name"
      rules={[{ required: true, message: "Select item" }]}
    >
      <Select
        showSearch
        placeholder="Select item"
        optionFilterProp="children"
        filterOption={(input, option) =>
          option?.children?.toLowerCase().includes(input.toLowerCase())
        }
        style={{ width: 200 }}
      >
        {predefinedItems.map((i, idx) => (
          <Select.Option key={idx} value={i.name}>
            {i.name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>

    <Form.Item
      name="qty"
      rules={[{ required: true, message: "Enter quantity" }]}
    >
      <Input placeholder="Qty" type="number" style={{ width: 100 }} />
    </Form.Item>

    <Form.Item>
      <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
        Add
      </Button>
    </Form.Item>
  </Form>
</div>

  {/* SECTION 3: ITEM TABLE + ACTION BUTTONS */}
  <div className="border-t pt-4 mt-4">
    <Table
      dataSource={items}
      columns={columns}
      pagination={false}
      rowKey={(record, idx) => idx}
      size="small"
    />

    <Space className="mt-4 flex justify-end w-full">
      <Button onClick={handleCancel}>Cancel</Button>
      <Button
        type="primary"
        onClick={handlePrint}
        disabled={items.length === 0}
      >
        Print Slip
      </Button>
    </Space>
  </div>
</Modal>

    </main>
  );
}
