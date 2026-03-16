"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Diamond } from "lucide-react"

import { NAV_ITEMS } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Header() {
  const pathname = usePathname()

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-border-subtle bg-bg-primary/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-screen-2xl items-center gap-8 px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Diamond
            className="h-4 w-4 text-brand-primary"
            strokeWidth={1.75}
            fill="rgba(124,145,255,0.15)"
          />
          <span className="font-mono text-sm font-bold tracking-[0.15em] text-text-primary uppercase">
            Tessera
          </span>
          <span className="hidden font-mono text-[10px] tracking-widest text-text-secondary sm:block">
            ▸ FOREX DEX
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden flex-1 items-center gap-0 md:flex">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-1.5 px-4 py-4 font-mono text-xs tracking-wider uppercase transition-colors",
                  isActive
                    ? "text-brand-primary after:absolute after:bottom-0 after:inset-x-4 after:h-px after:bg-brand-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right: Network status + Wallet */}
        <div className="ml-auto flex items-center gap-3">
          <NetworkStatus />
          <Button
            size="sm"
            variant="outline"
            className="border-brand-primary/50 font-mono text-xs tracking-wider text-brand-primary uppercase hover:border-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary glow-accent-sm"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    </header>
  )
}

function NetworkStatus() {
  return (
    <div className="hidden items-center gap-2 rounded-sm border border-border-subtle bg-bg-elevated px-3 py-1.5 sm:flex">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-state-positive opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-state-positive" />
      </span>
      <span className="font-mono text-[11px] tracking-wider text-text-secondary">
        MOONBEAM
      </span>
    </div>
  )
}
