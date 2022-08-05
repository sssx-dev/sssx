import type { UnwrapRouteAll, RoutePropsFn, RoutePermalinkFn, SvelteComponentProps } from 'sssx'
import type Page from './index.svelte'

type PageProps = SvelteComponentProps<typeof Page>
type Item = UnwrapRouteAll<typeof getAll>

export const permalink:RoutePermalinkFn<Item> = `/`

/**
 * Get all slugs for this route
 * @returns array of all slugs
 */
export const getAll = async () => [
    {}
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getProps:RoutePropsFn<Item, PageProps> = async item => {
    return {
        answer: `Example SSSX Blog`
    }
}