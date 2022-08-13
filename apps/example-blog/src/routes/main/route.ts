import type { UnwrapRouteAll, RoutePropsFn, RoutePermalinkFn, SvelteComponentProps } from 'sssx'
import type Page from './index.svelte'
import { Routes } from "../index.js";

const testBlogSlug = Routes['blog']({slug:`123`})

export type PageProps = SvelteComponentProps<typeof Page>
export type Request = UnwrapRouteAll<typeof getAll>

export const permalink:RoutePermalinkFn<Request> = `/`

/**
 * Get all slugs for this route
 * @returns array of all slugs
 */
export const getAll = async () => [
    {}
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getProps:RoutePropsFn<Request, PageProps> = async request => {
    return {
        title: `Example SSSX Blog`,
        testBlogSlug
    }
}