import { Routes, Route } from "react-router-dom";
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
  TableOfContents,
  NquiLogo,
} from "@nqlib/nqui";
import { HomeIcon, SettingsIcon, MailIcon, FileIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "react-router-dom";

function Layout({ children }: { children: React.ReactNode }) {
  return (
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
                <Link to="/">
                  <HugeiconsIcon icon={HomeIcon} className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/inbox">
                  <HugeiconsIcon icon={MailIcon} className="w-4 h-4" />
                  <span>Inbox</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/files">
                  <HugeiconsIcon icon={FileIcon} className="w-4 h-4" />
                  <span>Files</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/settings">
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
  );
}

function HomePage() {
  return (
    <div className="flex flex-1 min-h-0">
      <div className="flex-1 min-w-0 overflow-y-auto p-6">
        <div className="max-w-3xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Welcome to My App</h1>
            <p className="text-muted-foreground">
              Sample 3-column layout: sidebar, main content, and table of contents (showcase-style).
            </p>
          </div>
          <section className="space-y-4">
            <h2 id="getting-started" className="text-xl font-semibold scroll-mt-6">
              Getting Started
            </h2>
            <p className="text-muted-foreground text-sm">
              Edit <code className="rounded bg-muted px-1 py-0.5">App.tsx</code> to get started.
            </p>
          </section>
          <section className="space-y-4">
            <h2 id="next-steps" className="text-xl font-semibold scroll-mt-6">
              Next steps
            </h2>
            <p className="text-muted-foreground text-sm">
              Add routes and pages. The right column shows a table of contents from headings on this page.
            </p>
          </section>
        </div>
      </div>
      <aside className="w-56 shrink-0 border-l bg-muted/30 p-4 hidden lg:block overflow-y-auto">
        <TableOfContents
          autoDetect
          headingSelector="h2"
          variant="clerk"
          enableScrollSpy
          title="Contents"
          scrollOffset={80}
        />
      </aside>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/inbox" element={<div className="p-6">Inbox – Coming soon</div>} />
        <Route path="/files" element={<div className="p-6">Files – Coming soon</div>} />
        <Route path="/settings" element={<div className="p-6">Settings – Coming soon</div>} />
      </Routes>
    </Layout>
  );
}
