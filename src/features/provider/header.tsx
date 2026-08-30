import Link from "next/link";
import { BookOpen } from "lucide-react";
import ThemeToggle from "@/components/customized/switch/switch-07";

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-0">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <BookOpen aria-hidden="true" className="size-4" />
          </span>
          ProgrammingTail
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
