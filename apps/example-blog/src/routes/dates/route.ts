import dayjs from 'dayjs'
import type { UnwrapRouteAll, RoutePropsFn, RoutePermalinkFn, SvelteComponentProps } from 'sssx'
import type Page from './index.svelte'

type PageProps = SvelteComponentProps<typeof Page>
type Item = UnwrapRouteAll<typeof getAll>

export const permalink:RoutePermalinkFn<Item> = `/:slug/`

/**
 * Get all slugs for this route
 * @returns array of all slugs
 */
export const getAll = async () => {
    return Array.from(Array(3).keys()).map(index => {
        const date = dayjs().subtract(index, 'days').format('YYYY-MM-DD')
        return {slug:`route-${date}`, time: `00:00`}
    })
}

/**
 * Slugs to update or generate
 * @returns array of slugs
 */
export const getUpdates = async () => {
    const date = dayjs().format('YYYY-MM-DD')
    return [
        {slug:`route-${date}`, time: dayjs().format(`HH:mm`)}
    ]
}

/**
 * Slugs to remove
 * @returns array of slus
 */
export const getRemovals = async () => {
    const date = dayjs().subtract(3, 'days').format('YYYY-MM-DD')

    return [
        {slug:`route-${date}`, time: dayjs().format(`HH:mm`)}
    ]
}

export const getProps:RoutePropsFn<Item, PageProps> = async item => {
    return {
        answer: `Hello ${item.slug} on ${item.time}`
    }
}