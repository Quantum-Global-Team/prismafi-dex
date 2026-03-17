"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { NAV_ITEMS } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Header() {
  const pathname = usePathname()

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-screen-2xl items-center gap-8 px-6">
        {/* Wordmark */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="font-mono text-sm font-bold tracking-[0.18em] text-text-primary uppercase">
            PrismaFi
          </span>
          <span className="hidden font-mono text-[10px] tracking-widest text-text-muted sm:block">
            FOREX DEX
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

        {/* Right: Wallet only */}
        <div className="ml-auto">
          <Button
            size="sm"
            variant="outline"
            className="border-brand-primary/40 font-mono text-xs tracking-wider text-brand-primary uppercase hover:border-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary glow-brand-sm"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    </header>
  )
}
