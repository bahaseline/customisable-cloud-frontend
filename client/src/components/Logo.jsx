// Logo.jsx
// A simple SVG logo component for the app.
export default function Logo({ className }) {
  return (
    <svg viewBox="0 0 200 150" className={className} aria-hidden="true">
      <path
        d="M45 125 C27 125 12 110 12 92 C12 76 24 62 40 60 C43 38 62 21 85 21
           C106 21 124 35 129 54 C132 53 136 52 140 52 C158 52 173 67 173 85
           C173 108 160 125 142 125 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="11"
        strokeLinejoin="round"
      />
      <g stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.3">
        <line x1="40" y1="70" x2="140" y2="70" />
        <line x1="40" y1="92" x2="140" y2="92" />
        <line x1="40" y1="110" x2="140" y2="110" />
      </g>
      <g fill="currentColor">
        <circle cx="66" cy="70" r="10" />
        <circle cx="102" cy="92" r="10" />
        <circle cx="128" cy="110" r="10" />
      </g>
    </svg>
  );
}
