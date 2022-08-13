/**
 * All errors related to routes 1x1xxx
 */
export const RouteErrors = {
    101001: (path = '', file = '') => [
            `Dynamically generated permalink does not exist in this project.`,
            `Please check route "${path}".`,
            `Check "${file}" for all urls`,
        ].join(`\n`)
}