import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
// Note: Make sure globals.css imports nqui.css (via nqui-setup.css content)
// Required dependencies: npm install @nqlib/nqui tw-animate-css next-themes

export const metadata: Metadata = {
  title: "nqui Example App",
  description: "Example app using nqui component library",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          themes={["light", "dark"]}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

