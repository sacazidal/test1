import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "900"],
  subsets: ["latin"],
});

export const metadata = {
  title: "Provider-X",
  description: "Чат для общения",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={`${poppins.className} antialiased h-screen`}>
        <Header />
        <div className="py-2">{children}</div>
      </body>
    </html>
  );
}
