// Printable kit: page 1 is the facilitator sheet (setup and every answer), then one A4 card per stage.
// Built from the same room object the screen shows, so the preview and the paper always match.
export default function EscapePrintKitEn({ room, levelLabel }) {
  const setup = [
    ...(room.materials || []),
    `Print the ${room.steps.length} stage cards (from the next page) and put them in order, or hide each card around the room so every answer leads to the next one.`,
    'Read the opening story to the group and start a timer.',
    'When the group gets stuck, give one hint from the table, one at a time.',
    ...(room.printableKit || []),
  ]
  const font = { fontFamily: 'Nunito, Arial, sans-serif' }
  return <>
    <article className="buga-flow escape-kit" dir="ltr" style={font}>
      <h2 style={{ fontSize: 26, margin: '0 0 4px' }}>{room.emoji} {room.title}: facilitator kit</h2>
      <p style={{ margin: '0 0 8px', fontSize: 14 }}>{[room.audience, room.duration, levelLabel && `Level: ${levelLabel}`, `${room.steps.length} stages`].filter(Boolean).join(' · ')}</p>
      <p style={{ margin: '0 0 8px', fontSize: 14 }}><b>Opening story:</b> {room.intro}{room.story ? ` ${room.story}` : ''}</p>
      <h3 style={{ fontSize: 17, margin: '8px 0 2px' }}>Setup</h3>
      <ol style={{ margin: '0 0 6px', paddingLeft: 20, fontSize: 13.5, listStyle: 'decimal' }}>{setup.map(m => <li key={m}>{m}</li>)}</ol>
      <h3 style={{ fontSize: 17, margin: '8px 0 4px' }}>Answers and hints (facilitator only)</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead><tr style={{ borderBottom: '2px solid #111' }}><th style={{ textAlign: 'left', padding: 4 }}>Stage</th><th style={{ textAlign: 'left', padding: 4 }}>Answer / code</th><th style={{ textAlign: 'left', padding: 4 }}>Hints</th></tr></thead>
        <tbody>{room.steps.map((item, i) => <tr key={i} style={{ borderBottom: '1px solid #ccc', breakInside: 'avoid' }}>
          <td style={{ padding: 4, verticalAlign: 'top' }}>{i + 1}. {item.title}</td>
          <td style={{ padding: 4, verticalAlign: 'top', fontWeight: 800 }}>{item.answer}</td>
          <td style={{ padding: 4, verticalAlign: 'top' }}>{(item.hints || []).join(' · ')}</td>
        </tr>)}</tbody>
      </table>
      {room.finalMessage && <p style={{ marginTop: 8, fontSize: 13.5 }}><b>Read at the end:</b> {room.finalMessage}</p>}
    </article>
    {room.steps.map((item, i) => (
      <article key={i} className="buga-a4 escape-card" dir="ltr" style={{ ...font, alignItems: 'stretch', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{room.emoji} {room.title} · Stage {i + 1} of {room.steps.length}</p>
        <h2 style={{ fontSize: 40, margin: '14px 0 18px' }}>{item.title}</h2>
        {item.story && <p style={{ fontSize: 26, lineHeight: 1.6, margin: '0 0 20px' }}>{item.story}</p>}
        {item.visual && <div style={{ fontSize: 46, lineHeight: 1.5, border: '2px dashed #999', borderRadius: 14, padding: '18px 10px', margin: '0 0 16px', overflowWrap: 'anywhere' }}>{item.visual}</div>}
        <p style={{ fontSize: 32, fontWeight: 800, margin: '0 0 14px' }}>{item.question}</p>
        <div style={{ flex: 1, minHeight: 60 }} />
        <div style={{ border: '3px solid #111', borderRadius: 16, padding: '12px 16px', textAlign: 'left' }}>
          <p style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>✍️ Our answer:</p>
          <div style={{ height: 110, borderBottom: '2px solid #777' }} />
        </div>
      </article>
    ))}
  </>
}
