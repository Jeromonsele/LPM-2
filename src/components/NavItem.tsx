"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import clsx from "clsx";
import * as Tooltip from "@radix-ui/react-tooltip";

export default function NavItem({ href, children, icon }: { href: string; children: ReactNode; icon?: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));
  const content = (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "flex items-center gap-2 rounded px-3 py-2 text-sm",
        active
          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
          : "hover:bg-gray-100 dark:hover:bg-neutral-900"
      )}
    >
      {icon}
      <span className="truncate">{children}</span>
    </Link>
  );
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{content}</Tooltip.Trigger>
        <Tooltip.Content side="right" className="rounded bg-black text-white text-xs px-2 py-1">
          {typeof children === 'string' ? children : ''}
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}


