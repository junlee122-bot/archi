'use client';

// Minimal markdown renderer for our own generated reports (headings, lists,
// tables, bold, inline code). No external deps, no HTML injection from
// sources — input is always our own artifact text.
function inline(s: string) {
  const parts: (string | JSX.Element)[] = [];
  let rest = s;
  let k = 0;
  const re = /(\*\*([^*]+)\*\*|`([^`]+)`)/;
  while (rest.length) {
    const m = re.exec(rest);
    if (!m) { parts.push(rest); break; }
    if (m.index > 0) parts.push(rest.slice(0, m.index));
    if (m[2] !== undefined) parts.push(<b key={k++}>{m[2]}</b>);
    else parts.push(<code key={k++}>{m[3]}</code>);
    rest = rest.slice(m.index + m[0].length);
  }
  return parts;
}

export default function Markdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const out: JSX.Element[] = [];
  let i = 0, k = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        const cells = lines[i].split('|').slice(1, -1).map((c) => c.trim());
        if (!cells.every((c) => /^-+$/.test(c))) rows.push(cells);
        i++;
      }
      out.push(
        <table key={k++}>
          <thead><tr>{rows[0]?.map((c, j) => <th key={j}>{inline(c)}</th>)}</tr></thead>
          <tbody>{rows.slice(1).map((r, ri) => <tr key={ri}>{r.map((c, j) => <td key={j}>{inline(c)}</td>)}</tr>)}</tbody>
        </table>
      );
      continue;
    }
    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) { items.push(lines[i].slice(2)); i++; }
      out.push(<ul key={k++}>{items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ul>);
      continue;
    }
    if (line.startsWith('# ')) out.push(<h1 key={k++}>{inline(line.slice(2))}</h1>);
    else if (line.startsWith('## ')) out.push(<h2 key={k++}>{inline(line.slice(3))}</h2>);
    else if (line.startsWith('### ')) out.push(<h3 key={k++}>{inline(line.slice(4))}</h3>);
    else if (line.trim().length) out.push(<p key={k++}>{inline(line)}</p>);
    i++;
  }
  return <div className="md">{out}</div>;
}
