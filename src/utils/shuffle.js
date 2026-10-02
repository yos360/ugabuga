// Fisher–Yates: every order equally likely (sort(() => Math.random() - 0.5) is biased).
export function shuffle(items) {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
