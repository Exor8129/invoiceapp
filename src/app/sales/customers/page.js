"use client";
import React, { useState, useEffect } from "react";
import {
  Select,
  InputNumber,
  Table,
  Button,
  Form,
  DatePicker,
  message,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function CustomerPricingPage() {
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [rules, setRules] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [form] = Form.useForm();

  // Fetch data
  useEffect(() => {
    axios.get("/api/parties").then((res) => setCustomers(res.data));
    axios.get("/api/items").then((res) => setItems(res.data));
  }, []);

  const fetchRules = (partyId) => {
    axios
      .get(`/api/customerpricingrule?party_id=${partyId}`)
      .then((res) => setRules(res.data));
  };

  const handleCustomerChange = (value) => {
    setSelectedCustomer(value);
    fetchRules(value);
  };

  const handleSubmit = async (values) => {
    try {
      await axios.post("/api/customerpricingrule", {
        ...values,
        party_id: selectedCustomer,
        effective_from: values.date_range?.[0]?.format("YYYY-MM-DD") || null,
        effective_to: values.date_range?.[1]?.format("YYYY-MM-DD") || null,
      });
      message.success("Pricing rule added");
      fetchRules(selectedCustomer);
      form.resetFields();
    } catch (err) {
      message.error("Error saving rule");
    }
  };

  const handleDelete = async (id) => {
  try {
    await axios.delete(`/api/customerpricingrule/${id}`);
    message.success("Rule deleted");
    fetchRules(selectedCustomer); // Refresh the list
  } catch (err) {
    console.error("Delete failed:", err);
    message.error("Failed to delete rule");
  }
};

  const columns = [
    {
      title: "Product",
  dataIndex: "item",
  render: (item) => item?.name || "N/A",
    },
    {
      title: "Min Qty",
      dataIndex: "min_qty",
    },
    {
      title: "Fixed Price",
      dataIndex: "fixed_price",
    },
    {
      title: "Effective From",
      dataIndex: "effective_from",
      render: (date) => dayjs(date).format("YYYY-MM-DD"),
    },
    {
      title: "Effective To",
      dataIndex: "effective_to",
      render: (date) => date ? dayjs(date).format("YYYY-MM-DD") : "Unlimited",
    },
    {
  title: "Actions",
  key: "actions",
  render: (_, record) => (
    <Button
      danger
      onClick={() => handleDelete(record.id)}
    >
      Delete
    </Button>
  ),
}
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">
        Customer Pricing Rule Setup
      </h1>

      <Select
        showSearch
        placeholder="Select Customer"
        style={{ width: 300 }}
        onChange={handleCustomerChange}
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children?.toLowerCase().includes(input.toLowerCase())
        }
      >
        {customers.map((c) => (
          <Option key={c.id} value={c.id}>
            {c.name}
          </Option>
        ))}
      </Select>

      {selectedCustomer && (
        <div className="mt-6">
          <Form form={form} layout="inline" onFinish={handleSubmit}>
            <Form.Item name="item_id" rules={[{ required: true }]}>
              <Select
                showSearch
                placeholder="Select Product"
                style={{ width: 200 }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {items.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="min_qty">
              <InputNumber placeholder="Min Qty" />
            </Form.Item>
            <Form.Item name="fixed_price" rules={[{ required: true }]}>
              <InputNumber placeholder="Price" />
            </Form.Item>
            <Form.Item name="date_range" initialValue={[dayjs(), null]}>
              <RangePicker format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Add Rule
              </Button>
            </Form.Item>
          </Form>

          <Table
            className="mt-6"
            columns={columns}
            dataSource={rules}
            rowKey="id"
            pagination={false}
          />
        </div>
      )}
    </div>
  );
}
