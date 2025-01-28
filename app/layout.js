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
  openGraph: {
    title: "Provider-X",
    description: "Чат для общения",
    url: "https://test1-kappa-snowy.vercel.app/",
    siteName: "Provider-X",
    images: [
      {
        url: "https://s3.amazonaws.com/protocols-files/files/j55jcz36.jpg",
        width: 100,
        height: 100,
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Provider-X",
    description: "Чат для общения",
    images: ["https://s3.amazonaws.com/protocols-files/files/j55jcz36.jpg"],
  },
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
