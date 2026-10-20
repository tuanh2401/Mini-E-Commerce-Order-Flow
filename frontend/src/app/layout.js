import './globals.css';
import LayoutWrapper from './components/LayoutWrapper';

export const metadata = {
  title: 'DungThamMobile - Hệ thống bán lẻ Điện thoại, Laptop, Phụ kiện chính hãng',
  description: 'DungThamMobile - Cửa hàng bán lẻ điện thoại, laptop, phụ kiện uy tín hàng đầu',
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
