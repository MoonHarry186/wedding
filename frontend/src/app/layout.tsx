import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Providers } from "@/providers";
import { beVietnamPro, notoSerif } from "@/lib/editorFonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "CinLove",
  description: "CinLove wedding invitation builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${beVietnamPro.variable} ${notoSerif.variable} font-sans antialiased`}
      >
        <AntdRegistry>
          <Providers>{children}</Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}

