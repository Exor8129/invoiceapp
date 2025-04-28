'use client';

import { useState } from 'react';
import { Menu, Tooltip } from 'antd';
import {
  LayoutDashboard,
  ShoppingCart,
  Banknote,
  FileBarChart2,
  Workflow,
  Users,
  ChevronLeft,
  ChevronRight,
  StickyNote,
  Receipt,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const { SubMenu } = Menu;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  const collapsedWidth = "w-20";
  const expandedWidth = "w-64";

  const items = [
    {
      label: 'Dashboard',
      key: '/',
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: 'Sales',
      key: '/sales',
      icon: <ShoppingCart size={18} />,
      children: [
        {
          label: 'New Invoice',
          key: '/sales/invoice',
          icon: <Receipt size={16} />,
        },
        
        {
          label: 'Sales Report',
          key: '/sales/report',
          icon: <FileBarChart2 size={16} />,
        },
        {
            label: 'New Slip',
            key: '/sales/slip',
            icon: <StickyNote size={16} />,
          },
        {
          label: 'Order Pipeline',
          key: '/sales/pipeline',
          icon: <Workflow size={16} />,
        },
        {
          label: 'Customers',
          key: '/sales/customers',
          icon: <Users size={16} />,
        },
      ],
    },
    {
      label: 'Accounting',
      key: '/accounting',
      icon: <Banknote size={18} />,
    },
  ];

  return (
    <aside
      className={`h-screen fixed top-0 left-0 bg-white shadow-xl z-10 ${
        collapsed ? collapsedWidth : expandedWidth
      } transition-all duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b">
        {!collapsed && (
          <div className="text-xl font-semibold text-gray-800">My App</div>
        )}
        <button onClick={toggleSidebar} className="ml-auto">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        defaultOpenKeys={['/sales']}
        inlineCollapsed={collapsed}
        onClick={({ key }) => router.push(key)}
        style={{ border: 'none' }}
        items={items.map((item) =>
          item.children ? {
            ...item,
            label: collapsed ? (
              <Tooltip title={item.label} placement="right">
                <span>{item.icon}</span>
              </Tooltip>
            ) : (
              item.label
            ),
            children: item.children.map((sub) => ({
              ...sub,
              label: collapsed ? (
                <Tooltip title={sub.label} placement="right">
                  <span>{sub.icon}</span>
                </Tooltip>
              ) : (
                sub.label
              ),
            })),
          } : {
            ...item,
            label: collapsed ? (
              <Tooltip title={item.label} placement="right">
                <span>{item.icon}</span>
              </Tooltip>
            ) : (
              item.label
            ),
          }
        )}
      />
    </aside>
  );
}
