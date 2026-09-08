export default function Logo({ className = 'h-7 w-7' }) {
  // Marca: una cámara/consejo abstracta — arco de asientos alrededor de un punto.
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8" stroke="rgba(255,255,255,0.14)" />
      <path
        d="M7 22c0-5 4-9 9-9s9 4 9 9"
        stroke="#C9A227"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10.5 22c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"
        stroke="rgba(236,237,239,0.55)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="16" cy="11" r="2.1" fill="#ECEDEF" />
    </svg>
  );
}
