import Link from "next/link"
import { Twitter, Send, HelpCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">© SplBundler</span>
          <span className="text-sm text-muted-foreground">
            {new Date().getFullYear()} All rights reserved
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="https://twitter.com"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              Twitter
            </span>
          </Link>
          <Link
            href="https://telegram.org"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Telegram
            </span>
          </Link>
          <Link
            href="/how-to"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              How To?
            </span>
          </Link>
        </div>
      </div>
    </footer>
  )
}

