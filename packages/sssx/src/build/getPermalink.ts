import { OUTDIR } from "../config/index.js"
import type { RoutePermalinkFn } from "../types/Route"

/**
 * Generate path from (@type AbstractItem) using @param permalink function/string
 * @param o 
 * @param permalink – function or string defined in your `route.ts` file inside `routes`, @example `/blog/:slug/`
 * @returns route's path like `/blog/route1/`
 */
export const getPermalink = <T>(o:T, permalink:RoutePermalinkFn<T>):string => {
    if(typeof permalink === 'string'){
        const array = permalink.split(`/`)
        const suffix = array.map((param:string) => {
            if(param.startsWith(`:`))
                return (o as any)[param.slice(1)]
            return param
        }).join(`/`)
        return `${OUTDIR}${suffix}`
    }else{
        return `${OUTDIR}${permalink(o)}`
    }
}