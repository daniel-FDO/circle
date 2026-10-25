import type { ReactNode } from "react";
import { card } from "./styles";

// Sticky bar at the top of the centre column; pages pass a title or custom controls
const PageHeader = ({ title, children }: { title?: string; children?: ReactNode }) => (
  <div className="sticky top-14 md:top-0 z-20 bg-surface pt-3 md:pt-5 pb-3">
    {children ?? (
      <div className={`${card} flex items-center h-12 px-4`}>
        <h1 className="font-serif text-lg font-semibold">{title}</h1>
      </div>
    )}
  </div>
);

export default PageHeader;
