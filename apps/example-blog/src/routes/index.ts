// generated automatically using `npx sssx generate`
import { getPermalink } from 'sssx'

import type { Request as RequestBlog } from './blog/route.js'
import type { Request as RequestDates } from './dates/route.js'
import type { Request as RequestMain } from './main/route.js'

import { permalink as permalinkBlog } from './blog/route.js'
import { permalink as permalinkDates } from './dates/route.js'
import { permalink as permalinkMain } from './main/route.js'

type blogT = RequestBlog & {type: 'blog'}
type blog = Omit<blogT, 'type'>

type datesT = RequestDates & {type: 'dates'}
type dates = Omit<datesT, 'type'>

type mainT = RequestMain & {type: 'main'}
type main = Omit<mainT, 'type'>


/**
* Routes helper to generate link within a given route.
* @example SSSX.Routes['blog']({slug:'123'})
*/
export const Routes = {
	'blog': (request:blog) => getPermalink('blog', request, permalinkBlog),
	'dates': (request:dates) => getPermalink('dates', request, permalinkDates),
	'main': (request:main) => getPermalink('main', request, permalinkMain),
}
