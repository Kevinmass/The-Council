// Diagrama de proceso: Agentes → Rondas → Síntesis. Línea editorial, un acento de oro.
export default function CouncilDiagram({ className = '' }) {
  return (
    <svg
      viewBox="0 0 900 300"
      className={className}
      role="img"
      aria-label="Diagrama: los agentes debaten en rondas y producen una síntesis"
    >
      <defs>
        <marker
          id="cd-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0 0L10 5L0 10z" fill="rgba(236,237,239,0.35)" />
        </marker>
      </defs>

      {/* conectores */}
      <path
        d="M250 150 H360"
        stroke="rgba(236,237,239,0.28)"
        strokeWidth="1.5"
        markerEnd="url(#cd-arrow)"
      />
      <path
        d="M560 150 H660"
        stroke="rgba(236,237,239,0.28)"
        strokeWidth="1.5"
        markerEnd="url(#cd-arrow)"
      />

      {/* token que viaja */}
      <circle r="3.5" fill="#C9A227">
        <animateMotion
          dur="4.5s"
          repeatCount="indefinite"
          keyPoints="0;0.42;0.42;0.5;1;1"
          keyTimes="0;0.32;0.42;0.5;0.92;1"
          calcMode="linear"
          path="M250 150 H360 M560 150 H660"
        />
      </circle>

      {/* AGENTES */}
      <g>
        <text x="120" y="40" textAnchor="middle" className="cd-label">
          AGENTES
        </text>
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(40, ${70 + i * 42})`}>
            <rect
              width="160"
              height="30"
              rx="7"
              fill="rgba(255,255,255,0.035)"
              stroke="rgba(255,255,255,0.12)"
            />
            <circle cx="17" cy="15" r="4.5" fill="rgba(236,237,239,0.5)" />
            <rect x="32" y="10" width="90" height="4" rx="2" fill="rgba(236,237,239,0.28)" />
            <rect x="32" y="18" width="60" height="4" rx="2" fill="rgba(236,237,239,0.16)" />
          </g>
        ))}
      </g>

      {/* RONDAS */}
      <g transform="translate(460, 150)">
        <text x="0" y="-110" textAnchor="middle" className="cd-label">
          RONDAS
        </text>
        <circle r="66" fill="none" stroke="rgba(255,255,255,0.1)" />
        <circle r="46" fill="none" stroke="rgba(255,255,255,0.14)" />
        <circle r="26" fill="none" stroke="rgba(201,162,39,0.5)" />
        <path
          d="M0 -66 A66 66 0 0 1 57 33"
          fill="none"
          stroke="#C9A227"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0"
            to="360"
            dur="9s"
            repeatCount="indefinite"
          />
        </path>
        <text
          x="0"
          y="5"
          textAnchor="middle"
          fill="rgba(236,237,239,0.75)"
          fontSize="13"
          fontFamily="Geist Mono, monospace"
        >
          ×N
        </text>
      </g>

      {/* SÍNTESIS */}
      <g transform="translate(690, 92)">
        <text x="90" y="-12" textAnchor="middle" className="cd-label">
          SÍNTESIS
        </text>
        <rect
          width="180"
          height="120"
          rx="10"
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.14)"
        />
        <rect x="18" y="22" width="120" height="5" rx="2.5" fill="rgba(236,237,239,0.55)" />
        <rect x="18" y="40" width="144" height="4" rx="2" fill="rgba(236,237,239,0.22)" />
        <rect x="18" y="52" width="130" height="4" rx="2" fill="rgba(236,237,239,0.22)" />
        <rect x="18" y="64" width="140" height="4" rx="2" fill="rgba(236,237,239,0.22)" />
        <rect x="18" y="84" width="70" height="16" rx="8" fill="rgba(201,162,39,0.16)" stroke="rgba(201,162,39,0.5)" />
        <text x="53" y="96" textAnchor="middle" fill="#D9BC63" fontSize="9" fontFamily="Geist Mono, monospace">
          100/100
        </text>
      </g>

      <style>{`
        .cd-label {
          fill: rgba(236,237,239,0.4);
          font-size: 11px;
          letter-spacing: 0.22em;
          font-family: 'Geist Mono', monospace;
        }
      `}</style>
    </svg>
  );
}
