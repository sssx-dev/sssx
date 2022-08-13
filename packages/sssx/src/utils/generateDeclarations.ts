import fs from 'fs'
import { config } from '../config/index.js'
import { capitalize} from './capitalize.js'

const filename = `sssx.d.ts`
export const generateDeclarations = () => {
    const base = `${process.cwd()}/${config.sourceRoot}/${config.routesPath}`
    const names = fs.readdirSync(base, {withFileTypes: true}).filter(a => !a.isFile()).map(a => a.name)

    let script = `import { getPermalink } from 'sssx'\n\n`

    names.map(name =>
        script += `import type { Request as Request${capitalize(name)} } from './${name}/route.js'\n`
    )

    script += `\n`

    names.map(name => 
        script += `import { permalink as permalink${capitalize(name)} } from './${name}/route.js'\n`
    )

    script += `\n`

    names.map(name =>
        script += `type ${name}T = Request${capitalize(name)} & {type: '${name}'}\n`
                + `type ${name} = Omit<${name}T, 'type'>\n\n`
    )

    script += `\n`
    script += `declare module 'sssx' {\n`

    script += `\t/**\n`
    script += `\t* Routes helper to generate link within a given route.\n`
    script += `\t* @example SSSX.Routes['blog']({slug:'123'})\n`
    script += `\t*/\n`
    script += `\texport const Routes = {\n`

    names.map(name =>
        script += `\t\t'${name}': (request:${name}) => getPermalink(request, permalink${capitalize(name)}),\n`
    )

    script += `\t}\n`
    script += `}\n`

    script = `// generated automatically using \`npx sssx generate\`\n` + script

    const {sourceRoot, routesPath} = config
    fs.writeFileSync(`${process.cwd()}/${sourceRoot}/${routesPath}/${filename}`, script, {encoding: 'utf8'})
}