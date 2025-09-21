import type { Metadata } from "next";
import { Roboto_Serif, Space_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import ConditionalLayout from "@/components/ConditionalLayout";
import "./globals.css";

const robotoSerif = Roboto_Serif({
  variable: "--font-roboto-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Legal Lens AI - AI-Powered Legal Document Analysis",
  description: "Transform your legal document analysis with cutting-edge AI technology. Get instant insights, risk assessments, and actionable recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${robotoSerif.variable} ${spaceMono.variable} antialiased min-h-screen transition-colors duration-300`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <LayoutWrapper>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </LayoutWrapper>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
