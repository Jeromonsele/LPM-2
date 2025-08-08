import { ReactNode } from "react";
import clsx from "clsx";
import Link from "next/link";
import * as Tooltip from "@radix-ui/react-tooltip";

type Props = {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  gradient?: string; // tailwind gradient classes
  deltaPct?: number; // optional percentage change
  href?: string; // optional link target making the card clickable
  sparkline?: number[]; // values for tiny sparkline
};

export default function StatCard({ label, value, icon, gradient, deltaPct, href, sparkline }: Props) {
  const content = (
    <>
      {gradient && (
        <div className={clsx("absolute inset-0 opacity-15 pointer-events-none", gradient)} />
      )}
      <div className="p-5 flex items-start gap-4">
        {icon && <div className="text-neutral-500">{icon}</div>}
        <div>
          <div className="text-sm text-neutral-500">{label}</div>
          <div className="text-3xl font-semibold tracking-tight">{value}</div>
          {typeof deltaPct === "number" && (
            <div className={clsx("mt-1 text-xs font-medium", deltaPct >= 0 ? "text-emerald-600" : "text-rose-600")}> 
              {deltaPct >= 0 ? "+" : ""}{deltaPct.toFixed(1)}% vs last period
            </div>
          )}
        </div>
        {sparkline && sparkline.length > 1 && (
          <svg className="ml-auto h-12 w-24 opacity-70" viewBox="0 0 100 50" preserveAspectRatio="none">
            {(() => {
              const max = Math.max(...sparkline);
              const min = Math.min(...sparkline);
              const range = max - min || 1;
              const points = sparkline
                .map((v, i) => {
                  const x = (i / (sparkline.length - 1)) * 100;
                  const y = 50 - ((v - min) / range) * 50;
                  return `${x},${y}`;
                })
                .join(" ");
              return <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />;
            })()}
          </svg>
        )}
      </div>
    </>
  );

  const Wrapper = (
    <ComponentWrapper href={href} className={clsx(
      "relative overflow-hidden rounded-2xl border shadow-sm text-left w-full",
      "bg-white dark:bg-neutral-900 dark:border-neutral-800",
      href && "hover:shadow-md transition-shadow"
    )}>
      {content}
    </ComponentWrapper>
  );

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{Wrapper}</Tooltip.Trigger>
        <Tooltip.Content side="top" className="rounded bg-black text-white text-xs px-2 py-1">View details</Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

function ComponentWrapper({ href, className, children }: { href?: string; className?: string; children: ReactNode }) {
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return <div className={className}>{children}</div>;
}


