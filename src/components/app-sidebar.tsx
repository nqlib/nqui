import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FileIcon,
  HomeIcon,
  LayoutIcon,
  CheckListIcon,
  Moon01Icon,
  SettingsIcon,
  Sun01Icon,
} from "@hugeicons/core-free-icons"
import { useTheme } from "next-themes"
import { getShowcaseThemeLabel, nextShowcaseTheme } from "@/lib/showcase-theme"
import { useLocation, Link } from "react-router-dom"
import {
  showcaseRouteLabel,
  showcaseRoutes,
  showcaseSectionsForPath,
} from "@/config/showcase-nav"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { TableOfContents } from "@/index"
import { NquiLogo } from "@/components/custom/nqui-logo"
import { ScrollContainerContext, PageContentContext } from "@/components/AppLayout"

const navIcons: Record<string, typeof HomeIcon> = {
  "/": HomeIcon,
  "/patterns": LayoutIcon,
  "/recipes/settings": SettingsIcon,
  "/recipes/tracker": CheckListIcon,
  "/recipes/elevation": LayoutIcon,
  "/catalog": FileIcon,
  "/design-system": SettingsIcon,
}

function TableOfContentsWithScrollContainer(
  props: React.ComponentProps<typeof TableOfContents>,
) {
  const pageContentRef = React.useContext(PageContentContext)
  const scrollContainerRef = React.useContext(ScrollContainerContext)

  return (
    <TableOfContents
      {...props}
      container={pageContentRef ?? undefined}
      scrollContainer={scrollContainerRef ?? undefined}
    />
  )
}

const showcaseUser = {
  name: "Nqui",
  email: "dev@nqui.local",
  avatar: "/avatars/shadcn.jpg",
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(nextShowcaseTheme(theme))
  }

  const currentTheme = mounted ? theme || "light" : "light"

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r group-data-[collapsible=icon]:border-r-0"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="overflow-visible md:h-8 md:p-0">
                <Link to="/">
                  <div className="flex aspect-square size-8 min-w-8 items-center justify-center overflow-visible rounded-lg">
                    <NquiLogo className="size-6" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Nqui</span>
                    <span className="truncate text-xs">Component Library</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {showcaseRoutes.map((item) => {
                  const Icon = navIcons[item.path] ?? HomeIcon
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        tooltip={{
                          children: item.title,
                          hidden: false,
                        }}
                        isActive={location.pathname === item.path}
                        className="px-2.5 md:px-2"
                      >
                        <Link to={item.path}>
                          <HugeiconsIcon icon={Icon} strokeWidth={2} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={showcaseUser} />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="relative justify-center md:h-8 md:p-0"
                onClick={toggleTheme}
                tooltip={{
                  children: `Theme: ${getShowcaseThemeLabel(currentTheme)}`,
                  hidden: false,
                }}
              >
                {mounted ? (
                  <>
                    <HugeiconsIcon
                      icon={Sun01Icon}
                      size={16}
                      className={`absolute h-4 w-4 transition-all duration-200 ${
                        currentTheme === "light"
                          ? "rotate-0 scale-100 opacity-100"
                          : "rotate-90 scale-0 opacity-0"
                      }`}
                    />
                    <HugeiconsIcon
                      icon={Moon01Icon}
                      size={16}
                      className={`absolute h-4 w-4 transition-all duration-200 ${
                        currentTheme === "dark"
                          ? "rotate-0 scale-100 opacity-100"
                          : "rotate-90 scale-0 opacity-0"
                      }`}
                    />
                  </>
                ) : (
                  <HugeiconsIcon icon={Sun01Icon} size={16} className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <Sidebar
        collapsible="none"
        className="hidden flex-1 md:flex group-data-[collapsible=icon]:hidden"
      >
        <SidebarHeader className="sticky top-0 z-[var(--z-sticky-content)] h-12 shrink-0 gap-4 border-b p-4 backdrop-blur-lg bg-sidebar/20">
          <div className="text-base font-medium text-foreground">
            {showcaseRouteLabel(location.pathname)}
          </div>
        </SidebarHeader>
        <SidebarContent className="p-4">
          {showcaseSectionsForPath(location.pathname).length > 0 ? (
            <TableOfContentsWithScrollContainer
              key={location.pathname}
              autoDetect
              headingSelector="h2"
              variant="clerk"
              enableScrollSpy
              title="On this page"
              className="h-full"
              scrollOffset={80}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {location.pathname === "/"
                ? "Pick a recipe or open the catalog from the hub. Long pages show a section index here."
                : "This recipe is short — use the main content area."}
            </p>
          )}
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}
