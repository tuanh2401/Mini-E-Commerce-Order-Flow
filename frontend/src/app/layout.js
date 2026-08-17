import './globals.css';
import LayoutWrapper from './components/LayoutWrapper';

export const metadata = {
  title: 'FPT Shop Clone - Mini E-Commerce',
  description: 'Hệ thống cửa hàng điện máy cao cấp',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
