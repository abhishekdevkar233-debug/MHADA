import { notFound } from "next/navigation";
import { findRoute } from "@/lib/nav";
import Icon from "@/components/Icon";

export default async function SectionPage(props: PageProps<"/[section]">) {
  const { section } = await props.params;
  const route = findRoute(section);

  if (!route) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-border-soft px-3 py-1 text-[11.5px] font-medium text-muted-2">
          {route.group}
          {route.title !== route.group && (
            <>
              <span>›</span>
              <span className="text-accent-dark">{route.title}</span>
            </>
          )}
        </div>
        <h1 className="disp mt-3 text-[22px] font-semibold text-ink">{route.title}</h1>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-tint text-primary">
          <Icon name={route.icon} className="h-7 w-7" />
        </span>
        <h2 className="disp mt-4 text-base font-semibold text-ink">Screen coming next</h2>
        <p className="mt-1.5 max-w-md text-[13.5px] text-muted">
          The <span className="font-medium text-ink">{route.title}</span> workflow
          will be designed here, following the same MHADA design system used on
          the sign-in screen.
        </p>
      </div>
    </div>
  );
}
