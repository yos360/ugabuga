// Reuse existing print styles in the preview, scoped so opening it cannot
// change the editor underneath. Ignore page/body rules; PrintPreview owns A4.
export function printRules(sheets) {
  const out = []
  function walk(rules, printing = false, parent = '') {
    for (const rule of rules) {
      const media = rule.media?.mediaText
      const active = printing || !!media?.includes('print')
      const selector = rule.selectorText || parent
      if (active && selector && rule.style?.cssText && !/\b(?:body|html)\b|#buga-print-output/.test(selector)) {
        out.push(`.legacy-print :is(${selector}){${rule.style.cssText}}`)
      }
      if (rule.cssRules) walk(rule.cssRules, active, selector)
    }
  }
  for (const sheet of sheets) { try { walk(sheet.cssRules) } catch { /* Cross-origin fonts have no print layout rules. */ } }
  return out.join('\n')
}

export function snapshot(source) {
  const clone = source.cloneNode(true)
  const originals = source.querySelectorAll('input,textarea,select')
  clone.querySelectorAll('input,textarea,select').forEach((field, i) => {
    const value = originals[i].value
    if (field.tagName === 'TEXTAREA') {
      const text = document.createElement('div')
      text.className = field.className
      text.textContent = value || field.getAttribute('placeholder') || ''
      text.style.cssText = `height:auto;min-height:${getComputedStyle(originals[i]).height};white-space:pre-wrap;overflow-wrap:anywhere`
      if (!value) text.style.color = getComputedStyle(originals[i], '::placeholder').color
      field.replaceWith(text)
    }
    else if (field.tagName === 'SELECT') [...field.options].forEach(o => o.toggleAttribute('selected', o.value === value))
    else { field.setAttribute('value', value); field.toggleAttribute('checked', originals[i].checked) }
    field.setAttribute('readonly', ''); field.setAttribute('tabindex', '-1')
  })
  clone.querySelectorAll('.no-print,[class~="print:hidden"],script,style,iframe,input[type="file"]').forEach(el => el.remove())
  for (const el of [clone, ...clone.querySelectorAll('*')]) {
    el.removeAttribute('id')
    for (const attr of [...el.attributes]) if (/^on/i.test(attr.name)) el.removeAttribute(attr.name)
  }
  return clone
}

// html2canvas cannot parse Tailwind's OKLCH colors. Ask the browser to convert
// them to the same sRGB colors, only on the detached printable snapshot.
function printableHtml(content) {
  // html2canvas places native list markers on the left even in RTL lists.
  // Explicit markers keep the browser's right-hand layout in the PDF too.
  for (const item of content.querySelectorAll('li')) {
    const style = getComputedStyle(item), kind = style.listStyleType
    if (!['disc', 'circle', 'square', 'decimal'].includes(kind)) continue
    const marker = document.createElement('span')
    const siblings = [...item.parentElement.children].filter(el => el.tagName === 'LI')
    marker.textContent = kind === 'decimal' ? `${Number(item.parentElement.getAttribute('start') || 1) + siblings.indexOf(item)}.` : { disc: '•', circle: '◦', square: '▪' }[kind]
    marker.setAttribute('aria-hidden', 'true'); marker.setAttribute('data-print-marker', '')
    marker.style.cssText = `position:absolute;right:-1.3em;top:${style.paddingTop};width:1em;text-align:right;direction:ltr`
    item.style.listStyleType = 'none'; item.style.position = 'relative'; item.prepend(marker)
  }
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d'), colors = new Map()
  const convert = color => {
    if (!colors.has(color)) {
      ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1)
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
      colors.set(color, `rgba(${r},${g},${b},${a / 255})`)
    }
    return colors.get(color)
  }
  for (const el of content.querySelectorAll('*')) {
    const style = getComputedStyle(el)
    for (const property of ['color', 'background-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'outline-color', 'text-decoration-color', 'box-shadow', 'background-image']) {
      const value = style.getPropertyValue(property)
      const converted = value.replace(/\b(?:oklch|oklab|lab|lch|color)\([^)]*\)/g, convert)
      if (value !== converted) el.style.setProperty(property, converted, 'important')
    }
  }
  return content.innerHTML
}

// Keep whole blocks together where possible; split long lists between items,
// not through their text. The QR strip is reserved even before QR generation.
export function paginate(sources, wrapper, css) {
  if (!sources.length) throw new Error('No printable content')
  const stage = document.createElement('div')
  stage.style.cssText = 'position:fixed;left:-10000px;top:0;width:720px;pointer-events:none'
  const style = document.createElement('style'); style.textContent = css; stage.append(style)
  document.body.append(stage)
  const pages = []
  try {
    for (const source of sources) {
      let sheet, content, root, wrappers, count
      function next() {
        if (content && count) pages.push(printableHtml(content))
        sheet?.remove()
        sheet = document.createElement('article'); sheet.className = 'buga-a4 legacy-sheet'
        content = document.createElement('div'); content.className = 'legacy-print'
        const outer = document.createElement('div'); outer.className = wrapper
        root = source.cloneNode(false); outer.append(root); content.append(outer)
        const viewport = document.createElement('div'); viewport.className = 'legacy-viewport'; viewport.append(content)
        sheet.append(viewport); stage.append(sheet)
        wrappers = new Map(); count = 0
      }
      const parentFor = chain => {
        let parent = root
        for (const node of chain) {
          if (!wrappers.has(node)) { const copy = node.cloneNode(false); parent.append(copy); wrappers.set(node, copy) }
          parent = wrappers.get(node)
        }
        return parent
      }
      const fits = () => {
        const box = sheet.getBoundingClientRect(), end = content.getBoundingClientRect()
        return end.bottom <= box.bottom - 114 && content.scrollWidth <= content.clientWidth + 2
      }
      function place(node, chain = []) {
        if (node.nodeType === 3 && !node.textContent.trim()) return
        let copy = node.cloneNode(true)
        parentFor(chain).append(copy)
        if (fits()) { count++; return }
        const tooTall = copy.nodeType === 1 && copy.getBoundingClientRect().height > sheet.getBoundingClientRect().height - 150
        copy.remove()
        if (tooTall && node.children?.length && !['TABLE', 'SVG', 'LI', 'FIGURE'].includes(node.tagName)) {
          for (const child of node.childNodes) place(child, [...chain, node])
          return
        }
        if (count) {
          next(); copy = node.cloneNode(true); parentFor(chain).append(copy)
          if (fits()) { count++; return }
          copy.remove()
        }
        if (node.children?.length && !['TABLE', 'SVG', 'LI', 'FIGURE'].includes(node.tagName)) {
          for (const child of node.childNodes) place(child, [...chain, node])
        } else {
          // A single oversized block keeps its proportions and all its content.
          parentFor(chain).append(copy)
          const box = sheet.getBoundingClientRect(), rect = copy.getBoundingClientRect()
          const scale = Math.min(1, (box.bottom - 118 - rect.top) / rect.height, (content.clientWidth * .88) / rect.width)
          if (scale <= 0) throw new Error('Printable block exceeds the page')
          if (copy.style) { copy.style.zoom = String(scale); copy.style.maxWidth = '100%' }
          count++
        }
      }
      next()
      for (const node of source.childNodes) place(node)
      if (count) pages.push(printableHtml(content))
      sheet.remove()
    }
  } finally { stage.remove() }
  if (!pages.length) throw new Error('Empty print preview')
  return pages
}
