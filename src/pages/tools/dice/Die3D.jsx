const dotLayouts = {
  1: [[50,50]], 2: [[25,25],[75,75]], 3: [[25,25],[50,50],[75,75]],
  4: [[25,25],[25,75],[75,25],[75,75]], 5: [[25,25],[25,75],[50,50],[75,25],[75,75]],
  6: [[25,25],[25,50],[25,75],[75,25],[75,50],[75,75]],
}

function Face({ n, transform }) {
  return (
    <div className="absolute inset-0 bg-[var(--card)] border-[3px] border-[var(--border)]" style={{ transform, backfaceVisibility: 'hidden' }}>
      {dotLayouts[n].map(([x,y], i) => (
        <div key={i} className="absolute w-3 h-3 md:w-4 md:h-4 rounded-full bg-[var(--ink)]" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }} />
      ))}
    </div>
  )
}

export function Die3D({ value, rolling, mouseX, mouseY }) {
  const targetRot = { 1:{x:0,y:0}, 2:{x:0,y:90}, 3:{x:90,y:0}, 4:{x:-90,y:0}, 5:{x:0,y:-90}, 6:{x:0,y:180} }[value]
  const hoverX = rolling ? 0 : mouseY * 15
  const hoverY = rolling ? 0 : mouseX * 15
  const rot = rolling
    ? { x: 720 + targetRot.x, y: 720 + targetRot.y }
    : { x: targetRot.x + hoverX, y: targetRot.y + hoverY }

  return (
    <div style={{ perspective: '400px' }} className="w-20 h-20 md:w-24 md:h-24">
      <div className="relative w-full h-full transition-transform ease-out"
        style={{ transformStyle: 'preserve-3d', transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`, transitionDuration: rolling ? '700ms' : '150ms' }}>
        <Face n={1} transform="translateZ(40px)" />
        <Face n={6} transform="rotateY(180deg) translateZ(40px)" />
        <Face n={2} transform="rotateY(90deg) translateZ(40px)" />
        <Face n={5} transform="rotateY(-90deg) translateZ(40px)" />
        <Face n={3} transform="rotateX(90deg) translateZ(40px)" />
        <Face n={4} transform="rotateX(-90deg) translateZ(40px)" />
      </div>
    </div>
  )
}

