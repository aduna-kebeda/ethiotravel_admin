"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Calendar,
  Globe,
  Home,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  Star,
  Users,
  FileText,
  Menu,
  X,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { logout, user } = useAuth()

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // Fixed: Added async keyword to the function
  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      // No need to navigate - logout function handles this
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Packages",
      icon: Package,
      href: "/packages",
      active: pathname.startsWith("/packages"),
    },
    {
      label: "Events",
      icon: Calendar,
      href: "/events",
      active: pathname.startsWith("/events"),
    },
    {
      label: "Destinations",
      icon: Globe,
      href: "/destinations",
      active: pathname.startsWith("/destinations"),
    },
    {
      label: "Business Verification",
      icon: ShieldCheck,
      href: "/business-verification",
      active: pathname.startsWith("/business-verification"),
    },
    {
      label: "Blog",
      icon: FileText,
      href: "/blog",
      active: pathname.startsWith("/blog"),
    },

    ...(user?.is_superuser
      ? [
        {
          label: "Users",
          icon: Users,
          href: "/users",
          active: pathname.startsWith("/users"),
        },
      ]
      : []),



    {
      label: "Reviews",
      icon: Star,
      href: "/reviews",
      active: pathname.startsWith("/reviews"),
    },
    // {
    //   label: "Analytics",
    //   icon: BarChart3,
    //   href: "/analytics",
    //   active: pathname.startsWith("/analytics"),
    // },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: pathname.startsWith("/settings"),
    },
  ]

  return (
    <>
      <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50" onClick={toggleSidebar}>
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white shadow-custom transition-transform duration-200 ease-in-out dark:bg-secondary",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className,
        )}
      >
        <div className="flex h-20 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="font-heading text-xl font-bold">Ethiopian Travel</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  route.active
                    ? "bg-faded-pink text-primary dark:bg-faded-pink dark:text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <route.icon className={cn("h-5 w-5", route.active ? "text-primary" : "")} />
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t p-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4" />
            <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
          </Button>
        </div>
      </div>
    </>
  )
}
