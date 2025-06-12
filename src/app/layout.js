import './globals.css';
import Sidebar from './components/Sidebar';
import 'antd/dist/reset.css';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: 'My App',
  description: 'Sidebar with Ant Design + Lucide',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex">
        <Sidebar />
        <main className="ml-64 w-full p-6 bg-gray-50 min-h-screen">
          {children}
          <ToastContainer position="top-right" autoClose={3000} />
        </main>
      </body>
    </html>
  );
}
