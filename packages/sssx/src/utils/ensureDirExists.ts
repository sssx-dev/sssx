import fs from 'fs'

export const ensureDirExists = (dir:string) => {
    if(!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true})
}