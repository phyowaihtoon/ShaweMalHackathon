import fs from 'node:fs'

const mdPath = 'ShweMal_Requirement_Specification.md'
const htmlPath = 'ShweMal_Requirement_Specification.html'

const md = fs.readFileSync(mdPath, 'utf8').replace(/\r\n/g, '\n').replace(/\n/g, '\r\n')
const html = fs.readFileSync(htmlPath, 'utf8')
const next = html.replace(/var inlineMarkdown = "[\s\S]*?";\r?\n/, `var inlineMarkdown = ${JSON.stringify(md)};\n`)

if (next === html) {
  console.error('Could not find inlineMarkdown assignment to replace.')
  process.exit(1)
}

fs.writeFileSync(htmlPath, next)
console.log(`Synced ${htmlPath} from ${mdPath} (${md.length} chars).`)
