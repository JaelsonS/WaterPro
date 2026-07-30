import { cn } from "@/lib/utils";

interface GuiAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-14 w-14",
};

/** Avatar premium do Gui — consultor masculino WaterPro */
export function GuiAvatar({ size = "md", className }: GuiAvatarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-gradient-to-br from-[#e0f2fe] via-[#f0f9ff] to-[#bae6fd]",
        "ring-2 ring-white shadow-[0_6px_24px_rgba(26,127,184,0.28)]",
        sizes[size],
        className
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none">
        <defs>
          <linearGradient id="gui-bg" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
          <linearGradient id="gui-skin" x1="30" y1="30" x2="70" y2="80">
            <stop offset="0%" stopColor="#fcd9b6" />
            <stop offset="100%" stopColor="#e8b88a" />
          </linearGradient>
          <linearGradient id="gui-hair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="gui-shirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a7fb8" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="50" fill="url(#gui-bg)" />

        {/* Ombros / camisa */}
        <path d="M12 88 C18 68 32 62 50 62 C68 62 82 68 88 88 Z" fill="url(#gui-shirt)" />
        <path d="M38 62 L50 78 L62 62 Z" fill="#ffffff" opacity="0.85" />

        {/* Pescoço */}
        <rect x="42" y="54" width="16" height="12" rx="4" fill="url(#gui-skin)" />

        {/* Rosto */}
        <ellipse cx="50" cy="44" rx="22" ry="24" fill="url(#gui-skin)" />

        {/* Cabelo */}
        <path
          d="M26 38 C26 20 38 12 50 12 C62 12 74 20 74 38 C74 32 68 26 50 26 C32 26 26 32 26 38 Z"
          fill="url(#gui-hair)"
        />
        <path d="M26 36 C24 44 26 50 30 52 L28 40 Z" fill="url(#gui-hair)" />
        <path d="M74 36 C76 44 74 50 70 52 L72 40 Z" fill="url(#gui-hair)" />

        {/* Sobrancelhas */}
        <path d="M36 36 Q42 33 46 36" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M54 36 Q58 33 64 36" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />

        {/* Olhos */}
        <ellipse cx="40" cy="42" rx="3" ry="3.5" fill="#1e293b" />
        <ellipse cx="60" cy="42" rx="3" ry="3.5" fill="#1e293b" />
        <circle cx="41" cy="41" r="1" fill="#ffffff" opacity="0.9" />
        <circle cx="61" cy="41" r="1" fill="#ffffff" opacity="0.9" />

        {/* Nariz suave */}
        <path d="M50 44 L48 50 L52 50 Z" fill="#d4a574" opacity="0.35" />

        {/* Sorriso */}
        <path
          d="M40 52 Q50 58 60 52"
          stroke="#b45309"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Gravata */}
        <path d="M46 62 L50 76 L54 62 L52 62 L50 68 L48 62 Z" fill="#0e7490" />
      </svg>

      <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
    </div>
  );
}
