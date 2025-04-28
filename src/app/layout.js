// app/layout.js
import './globals.css';
import Sidebar from './components/Sidebar';
import 'antd/dist/reset.css';

export const metadata = {
  title: 'My App',
  description: 'Sidebar with Ant Design + Lucide',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex">
        <Sidebar />
        <main className="ml-64 w-full p-6 bg-gray-50 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
