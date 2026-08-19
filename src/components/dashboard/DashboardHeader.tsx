"use client";

type DashboardHeaderProps = {
  title: string;
  description?: string;
  userEmail?: string | null;
  onLogout?: () => void;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
};

export function DashboardHeader({
  title,
  description,
  userEmail,
  onLogout,
  onMenuToggle,
  showMenuButton = false,
}: DashboardHeaderProps) {
  const isStaging =
    process.env.NEXT_PUBLIC_APP_ENV === "staging" ||
    process.env.NODE_ENV === "development";

  return (
    <header className="border-b border-slate-line bg-white/90 backdrop-blur">
      <div className="flex items-start justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          {showMenuButton ? (
            <button
              type="button"
              className="mt-0.5 rounded-lg border border-slate-line p-2 text-ink-soft lg:hidden"
              aria-label="Abrir menu"
              onClick={onMenuToggle}
            >
              ☰
            </button>
          ) : null}
          <div>
            <h1 className="text-xl font-medium text-ink sm:text-2xl">{title}</h1>
            {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 text-right">
          {isStaging ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              Staging
            </span>
          ) : null}
          {userEmail ? <span className="text-xs text-ink-muted">{userEmail}</span> : null}
          {onLogout ? (
            <button
              type="button"
              className="text-sm text-azure hover:underline"
              onClick={onLogout}
            >
              Sair
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
