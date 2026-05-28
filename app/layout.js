import "./globals.css";

export const metadata = {
  title: "Daily Report Generator",
  description: "Generate daily reports in PDF or DOCX",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
