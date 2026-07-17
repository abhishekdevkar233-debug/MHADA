import Icon from "@/components/Icon";

/**
 * Read-only horizontal stage tracker for multi-step HR processes
 * (retirement, transfer approval, …). Not clickable — purely reflects
 * current workflow state, unlike the interactive form wizard rail.
 */
export default function ProcessTracker({
  steps,
  currentIndex,
}: {
  steps: string[];
  currentIndex: number;
}) {
  return (
    <div className="flex items-start overflow-x-auto pb-1">
      {steps.map((label, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "active" : "upcoming";
        return (
          <div key={label} className="relative flex min-w-[110px] flex-1 flex-col items-center">
            {i < steps.length - 1 && (
              <span
                className={`absolute top-4 left-[calc(50%+18px)] right-[calc(-50%+18px)] h-0.5 ${
                  i < currentIndex ? "bg-primary" : "bg-border"
                }`}
              />
            )}
            <span
              className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-[13px] font-bold ${
                state === "done"
                  ? "border-primary bg-primary text-white"
                  : state === "active"
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-white text-muted-2"
              }`}
            >
              {state === "done" ? <Icon name="attendance" className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`mt-2 max-w-[110px] text-center text-[11.5px] font-semibold ${state === "active" ? "text-ink" : "text-muted"}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
