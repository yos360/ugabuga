import { writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
// The selected travel bundle and its static dependencies only; never crawl the site.
export default function travelAssets() {
  return { name: 'travel-offline-assets', writeBundle(options, bundle) {
    for(const locale of ['he','en']) {
    const seen = new Set()
    function visit(name) {
      if (seen.has(name) || !bundle[name] || !existsSync(resolve(options.dir, name))) return
      seen.add(name)
      const item = bundle[name]
      if (item.type === 'chunk') {
        item.imports.forEach(visit)
        item.viteMetadata?.importedCss?.forEach(visit)
        item.viteMetadata?.importedAssets?.forEach(visit)
      } else if (/\.css$/.test(name)) {
        for (const m of String(item.source).matchAll(/\/assets\/([\w.-]+)/g)) visit('assets/' + m[1])
      }
    }
    for (const [name, item] of Object.entries(bundle)) if (item.type === 'chunk' && (item.isEntry || (locale==='he'?/\/src\/travel\/(TravelOffline|TravelPlay|TravelRadio)\.jsx$/:/\/en\/travel\/(EnglishTravelOffline|EnglishTravelPlay|EnglishTravelRadio)\.jsx$/).test(item.facadeModuleId || ''))) visit(name)
    writeFileSync(resolve(options.dir,locale==='he'?'travel-assets.json':'travel-en-assets.json'),JSON.stringify({version:[...seen].sort().join('|'),assets:[...seen].map(x=>'/' + x)}))
    }
  } }
}
