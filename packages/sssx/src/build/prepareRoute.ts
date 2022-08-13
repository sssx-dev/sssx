import { getPermalink } from './getPermalink.js'

import { loadDataModule } from './loadDataModule.js'
import { loadSSRModule } from './loadSSRModule.js';

import type { AbstractItem } from './loadDataModule.js'
import type { SSRModule } from './loadSSRModule';
import type { DataModule } from './loadDataModule.js'
import type { FilesMap } from '../types/index.js';

export type RouteModules = {
    data: DataModule
    ssr: SSRModule
}

export type ItemPathTemplate = {
    item:AbstractItem;
    path:string;
    template:string;
}

export const prepareRouteModules = async (template:string, filesMap:FilesMap) => {
    const [
        dataModule,
        ssrModule
    ] = await Promise.all([
        loadDataModule(template, filesMap),
        loadSSRModule(template)
    ])

    const modules:RouteModules = {
        data: dataModule,
        ssr: ssrModule,
    }

    return modules
}

type PrepareRouteMode = 'all'|'updates'|'removals'

export const prepareRoute = async (template:string, modules:RouteModules, mode:PrepareRouteMode = 'all') => {
    let items:AbstractItem[] = []
    
    if(mode === 'updates' && modules.data.getUpdates !== undefined)
        items = await modules.data.getUpdates()
    else if(mode === 'removals' && modules.data.getRemovals !== undefined)
        items = await modules.data.getRemovals()
    else if(mode === 'all')
        items = await modules.data.getAll()

    const array:ItemPathTemplate[] = items.map((item:AbstractItem) => {
        const path = getPermalink(item, modules.data.permalink)
        return {
            item,
            path,
            template
        }
    })

    return array
}