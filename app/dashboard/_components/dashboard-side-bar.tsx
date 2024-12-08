'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Coins, Store, Droplets, Scissors, Rocket, Flame, Send } from 'lucide-react'
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/dashboard/", icon: LayoutDashboard },
  { name: "My Bundles", href: "/dashboard/myBundles", icon: Droplets },
  { name: "Create Token", href: "/dashboard/createToken", icon: Coins },
  {
    name: "Revoke Authority",
    href: "/dashboard/revokeAuthority",
    icon: Flame
  },
  {
    name: "Create Market ID",
    href: "/dashboard/createMarket",
    icon: Store,
  },
  // { name: "Create Bundle", href: "/dashboard/createBundler", icon: Droplets },
  { name: "Launch Bundle", href: "/dashboard/launchBundler", icon: Rocket,    badge: "Hot"  },
   { name: "Manage LP", href: "/dashboard/manageLp", icon: Scissors },
  // {
  //   name: "Airdrop",
  //   href: "/dashboard/airdrop",
  //   icon: Send,
  //   badge: "Coming Soon",
  // }
  // ,{
  //   name: "SolDrop",
  //   href: "/dashboard/soldrop",
  //   icon: Bitcoin,
  //   badge: "Coming Soon",
  // },
  // {
  //   name: "Bump",
  //   href: "/dashboard/bump",
  //   icon: Droplets,
  //   badge: "Coming Soon",
  // }, 
  // {
  //   name: "Boost",
  //   href: "/dashboard/boost",
  //   icon: Droplets,
  //   badge: "Coming Soon",
  // },
]

export default function DashboardSideBar() {
  const pathname = usePathname()

  return (
    <div className="border-r border-[#1E1B24] space-y-4 py-4 h-screen sticky top-0" style={{'width':'270px'}}>
      <nav className="grid items-start gap-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-secondary",
              pathname === item.href ? "bg-secondary" : "transparent"
            )}          >
            <item.icon className="h-4 w-4" />
            {item.name}
            {item.badge && (
              <span className={cn(
                "ml-auto px-1.5 py-0.5 text-xs",
                item.badge === "Hot" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
              )}>
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
      </div>
  )
}

