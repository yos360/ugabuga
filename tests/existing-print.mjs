import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { printRules } from '../src/utils/existingPrint.js'

test('legacy print rules are scoped to the preview and never override body layout', () => {
  const style = (selectorText, cssText) => ({ selectorText, style: { cssText } })
  const css = printRules([{ cssRules: [style('.screen', 'color:red'), { media: { mediaText: 'print' }, cssRules: [style('.sheet, .card', 'color:black'), style('body', 'display:none'), { selectorText: '.print\\:hidden', cssRules: [{ style: { cssText: 'display:none' } }] }] }] }])
  assert.ok(css.includes('.legacy-print :is(.sheet, .card){color:black}'))
  assert.ok(css.includes('.legacy-print :is(.print\\:hidden){display:none}'))
  assert.doesNotMatch(css, /color:red|:is\(body\)/)
})

test('all six legacy print templates use the shared preview entry', () => {
  for (const path of ['content/QuestionsPage', 'content/MoreContent', 'printables/RootsProject', 'tools/PuzzleStudio', 'tools/ExperimentMaker', 'tools/BringList']) {
    const code = readFileSync(`src/pages/${path}.jsx`, 'utf8')
    assert.match(code, /<PrintExisting selector=/, path)
    assert.doesNotMatch(code, /window\.print\(/, path)
  }
  assert.match(readFileSync('src/components/ui/PrintExisting.jsx', 'utf8'), /<PrintPreview /)
})
