import Aurora from '../reactbits/Aurora.jsx';

// Capa de fondo compartida: Aurora WebGL + viñeta + grano.
// `intensity` baja todo para la vista de herramienta (menos distracción).
export default function Backdrop({ intensity = 'full' }) {
  const soft = intensity === 'soft';
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      <div
        className="absolute inset-x-0 top-0 h-[72vh] grain"
        style={{ opacity: soft ? 0.5 : 0.9 }}
      >
        <Aurora
          className="h-full w-full"
          colorStops={['#1b2531', '#3a3320', '#12161d']}
          amplitude={soft ? 0.6 : 0.95}
          blend={0.5}
          speed={0.55}
        />
      </div>
      {/* viñeta / fundido al negro */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,transparent_0%,rgba(8,8,10,0.55)_55%,#08080a_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
    </div>
  );
}
