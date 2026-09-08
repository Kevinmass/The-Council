// Adaptado de reactbits.dev/text-animations/shiny-text
export default function ShinyText({ text, className = '', speed = 6, disabled = false }) {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(110deg, rgba(236,237,239,0.45) 35%, #ffffff 50%, rgba(236,237,239,0.45) 65%)',
        backgroundSize: '250% 100%',
        WebkitBackgroundClip: 'text',
        animation: disabled ? 'none' : `shimmer ${speed}s linear infinite`,
      }}
    >
      {text}
    </span>
  );
}
