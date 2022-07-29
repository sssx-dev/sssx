import type { UnwrapRouteAll, RoutePropsFn, RoutePermalinkFn, SvelteComponentProps } from 'sssx'
import type Page from './index.svelte'
import { hello } from '../../bar.js'

type PageProps = SvelteComponentProps<typeof Page>
type Item = UnwrapRouteAll<typeof getAll>

export const permalink:RoutePermalinkFn<Item> = `/blog/:slug/`

export const getAll = async () => {
    
    return [
        { slug: `hello`, bar: hello() },
        { slug: `world` }
    ]
}

export const getProps:RoutePropsFn<Item, PageProps> = async item => {
    return {
        title: `Hello ${item.slug}`
    }
}