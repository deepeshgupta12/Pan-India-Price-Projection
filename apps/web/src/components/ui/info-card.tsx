import { ReactNode } from "react";

type InfoCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function InfoCard({ title, description, children }: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>

      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}