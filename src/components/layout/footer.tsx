import Link from "next/link";
import { Rocket } from "lucide-react";

import { mainNav, siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="container flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Rocket className="h-3.5 w-3.5" />
            </span>
            <span className="tracking-tight">{siteConfig.name}</span>
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">{siteConfig.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Product</span>
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.title}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Company</span>
            <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              About
            </Link>
            <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Contact
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Legal</span>
            <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 py-6">
        <p className="container text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
