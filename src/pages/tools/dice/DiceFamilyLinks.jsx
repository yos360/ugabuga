import { Link } from 'react-router-dom'

export const DICE_FAMILY = [
  ['/tools/dice', '🎲', 'קוביה רגילה'],
  ['/tools/dice/backgammon', '🎯', 'קוביות לשש בש'],
  ['/tools/dice/monopoly', '🏠', 'קוביות למונופול'],
  ['/tools/dice/polyhedral', '🔷', 'D4 עד D20'],
  ['/tools/dice/story-dice', '📖', 'קוביות סיפור'],
  ['/tools/dice/emotions', '💛', 'קוביית רגשות'],
  ['/tools/random-number', '🔢', 'מספר אקראי'],
  ['/tools/coin-flip', '🪙', 'הטלת מטבע'],
  ['/printables/dice-template', '✂️', 'קוביה להדפסה'],
  ['/dice-games', '🏆', 'משחקי קוביות'],
]

export default function DiceFamilyLinks({ current }) {
  return (
    <nav aria-label="עוד כלים של קוביות" className="mt-8">
      <h2 className="text-xl font-bold mb-3 text-center">עוד קוביות וכלים אקראיים</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {DICE_FAMILY.filter(([href]) => href !== current).map(([href, e, label]) => (
          <Link key={href} to={href} className="wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] px-3 py-2 font-bold">{e} {label}</Link>
        ))}
      </div>
    </nav>
  )
}
