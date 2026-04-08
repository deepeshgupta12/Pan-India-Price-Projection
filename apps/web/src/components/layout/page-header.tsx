import { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          {eyebrow}
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
          {description}
        </p>
      </div>

      {actions ? <div>{actions}</div> : null}
    </div>
  );
}