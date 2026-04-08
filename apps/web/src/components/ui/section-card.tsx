import { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function SectionCard({
  title,
  subtitle,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
        ) : null}
      </div>

      <div className="pt-5">{children}</div>
    </section>
  );
}