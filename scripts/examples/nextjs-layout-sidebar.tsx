import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  Separator,
} from "@nqlib/nqui";
import { NquiLogo } from "@nqlib/nqui";
import { HomeIcon, SettingsIcon, MailIcon, FileIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "nqui App",
  description: "3-column app with sidebar, header, and content area (showcase-style)",
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
          <SidebarProvider defaultOpen>
            <Sidebar>
              <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-4">
                  <NquiLogo className="w-8 h-8" />
                  <span className="font-semibold">My App</span>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/">
                        <HugeiconsIcon icon={HomeIcon} className="w-4 h-4" />
                        <span>Home</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/inbox">
                        <HugeiconsIcon icon={MailIcon} className="w-4 h-4" />
                        <span>Inbox</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/files">
                        <HugeiconsIcon icon={FileIcon} className="w-4 h-4" />
                        <span>Files</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/settings">
                        <HugeiconsIcon icon={SettingsIcon} className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
            <SidebarInset className="flex flex-col min-h-screen">
              <header className="flex h-12 items-center gap-2 border-b px-4 shrink-0 bg-background/95">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm font-medium">My App</span>
              </header>
              <main className="flex-1 min-h-0 flex">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
