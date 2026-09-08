import { Fragment } from 'react';

// Render seguro de texto con un poco de estructura (sin dangerouslySetInnerHTML):
// - párrafos por doble salto de línea
// - **negrita**
// - `código`
// - viñetas "- " o "* " y listas numeradas
function inline(text, keyBase) {
  const parts = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) {
      parts.push(
        <strong key={`${keyBase}-b-${i}`} className="font-semibold text-paper">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else {
      parts.push(
        <code
          key={`${keyBase}-c-${i}`}
          className="rounded bg-white/[0.06] px-1 py-0.5 font-mono text-[0.85em] text-paper"
        >
          {tok.slice(1, -1)}
        </code>,
      );
    }
    last = m.index + tok.length;
    i += 1;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function RichText({ text, className = '' }) {
  if (!text) return null;
  const blocks = String(text)
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className={`space-y-3 leading-relaxed ${className}`}>
      {blocks.map((block, bi) => {
        const lines = block.split('\n');
        const isList = lines.every((l) => /^([-*]|\d+\.)\s+/.test(l.trim()));
        if (isList) {
          const ordered = /^\d+\.\s+/.test(lines[0].trim());
          const Tag = ordered ? 'ol' : 'ul';
          return (
            <Tag
              key={bi}
              className={`space-y-1.5 pl-5 ${ordered ? 'list-decimal' : 'list-disc'} marker:text-faint`}
            >
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^([-*]|\d+\.)\s+/, ''), `${bi}-${li}`)}</li>
              ))}
            </Tag>
          );
        }
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <Fragment key={li}>
                {inline(l, `${bi}-${li}`)}
                {li < lines.length - 1 && <br />}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
