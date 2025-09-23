import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

function Svg({
  size = 24,
  children,
  ...rest
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ========== Basic shapes / controls ========== */

export const CheckIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M20 6L9 17l-5-5" />
  </Svg>
);

export const XIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M18 6L6 18M6 6l12 12" />
  </Svg>
);

export const ChevronRightIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
);

export const ChevronDownIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);

export const ChevronUpIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M18 15l-6-6-6 6" />
  </Svg>
);

export const CircleIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
  </Svg>
);

export const MoreHorizontal = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="6" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="18" cy="12" r="1.5" />
  </Svg>
);

/* ========== System / status ========== */

export const AlertTriangle = (props: IconProps) => (
  <Svg {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </Svg>
);

export const CheckCircle2 = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 12l2 2 4-4" />
  </Svg>
);

export const Lock = (props: IconProps) => (
  <Svg {...props}>
    <rect x="4" y="11" width="16" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </Svg>
);

export const Unlock = (props: IconProps) => (
  <Svg {...props}>
    <rect x="4" y="11" width="16" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 017.5-2.5" />
  </Svg>
);

export const Shield = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 3l8 4v5a9 9 0 01-8 9 9 9 0 01-8-9V7l8-4z" />
  </Svg>
);

export const ShieldUser = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 3l8 4v5a9 9 0 01-8 9 9 9 0 01-8-9V7l8-4z" />
    <circle cx="12" cy="11" r="2.5" />
    <path d="M7.5 18.5a6.5 6.5 0 019 0" />
  </Svg>
);

/* ========== Content / media ========== */

export const Download = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 3v10" />
    <path d="M7 9l5 5 5-5" />
    <path d="M5 21h14" />
  </Svg>
);

export const Upload = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 21V11" />
    <path d="M7 15l5-5 5 5" />
    <path d="M5 3h14" />
  </Svg>
);

export const Printer = (props: IconProps) => (
  <Svg {...props}>
    <path d="M6 9V4h12v5" />
    <rect x="4" y="9" width="16" height="8" rx="2" />
    <path d="M6 17h12v3H6z" />
    <path d="M16 13h.01" />
  </Svg>
);

export const Search = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </Svg>
);

export const Eye = (props: IconProps) => (
  <Svg {...props}>
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const Star = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 2l2.9 6.1 6.7.9-4.8 4.7 1.2 6.6L12 17l-6 3.3 1.2-6.6L2.4 9l6.7-.9L12 2z" />
  </Svg>
);

/* ========== Navigation / actions ========== */

export const Trash2 = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <rect x="5" y="6" width="14" height="14" rx="2" />
    <path d="M10 11v6M14 11v6" />
  </Svg>
);

export const PenLine = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 013 3L8 18l-4 1 1-4 11.5-11.5z" />
  </Svg>
);

export const Filter = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3 5h18" />
    <path d="M6 12h12" />
    <path d="M10 19h4" />
  </Svg>
);

export const Shuffle = (props: IconProps) => (
  <Svg {...props}>
    <path d="M16 3h5v5" />
    <path d="M4 20l9-9" />
    <path d="M21 21v-5h-5" />
    <path d="M4 4l5 5" />
  </Svg>
);

/* ========== Data / charts / time ========== */

export const BarChart3 = (props: IconProps) => (
  <Svg {...props}>
    <path d="M6 20V10" />
    <path d="M12 20V4" />
    <path d="M18 20v-6" />
    <path d="M3 20h18" />
  </Svg>
);

export const Clock = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </Svg>
);

/* ========== Users ========== */

export const Users = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="9" cy="8" r="3" />
    <path d="M2 21a7 7 0 0114 0" />
    <circle cx="17" cy="10" r="3" />
    <path d="M16 21h6a6 6 0 00-6-6" />
  </Svg>
);

export const UserPlus = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="9" cy="8" r="3" />
    <path d="M2 21a7 7 0 0114 0" />
    <path d="M19 8v6" />
    <path d="M16 11h6" />
  </Svg>
);

/* ========== Books / learning ========== */

export const BookOpen = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 5c-2-1-6-1-9 1v11c3-2 7-2 9-1 2-1 6-1 9 1V6c-3-2-7-2-9-1z" />
    <path d="M12 5v11" />
  </Svg>
);

export const BookOpenCheck = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 5c-2-1-6-1-9 1v11c3-2 7-2 9-1 2-1 6-1 9 1V6c-3-2-7-2-9-1z" />
    <path d="M12 5v11" />
    <path d="M15.5 10.5l1.5 1.5 3-3" />
  </Svg>
);

export const Brain = (props: IconProps) => (
  <Svg {...props}>
    <path d="M9 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3z" />
    <path d="M15 3a3 3 0 013 3v12a3 3 0 01-3 3 3 3 0 01-3-3V6a3 3 0 013-3z" />
    <path d="M6 10h12" />
    <path d="M6 14h12" />
  </Svg>
);

/* ========== Admin / misc cluster ========== */

export const DownloadIconAlias = Download; // optional alias if you like

/* ========== Extra (from your lists) ========== */

export const EyeIconAlias = Eye;
export const StarIconAlias = Star;

/* ======= END: icons ======= */
