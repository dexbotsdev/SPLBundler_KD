import ModeToggle from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Banknote, Folder, HomeIcon, Settings } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'

export default function Header() {
  return (
    <div className="border-b border-[#1E1B24]">
      <div className="flex h-8 items-center justify-center gap-4 bg-[#ff22212e] px-6">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm">
          Make sure you&apos;re using the domain https://splbundler.org – Beware of phishing sites.
        </span>
      </div>
      <div className="flex h-14 items-center justify-between px-6 ">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#6E56CF] to-[#4D3B9A]" />
          <span className="text-xl font-bold text-white">SPLBUNDLER</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings">
            <Button variant="outline" size={'md'}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          <UserButton />
           <ModeToggle />
        </div>
      </div>
    </div>
  )
}

