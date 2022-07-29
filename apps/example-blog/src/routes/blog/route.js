import { hello } from '../../bar.js';
export const permalink = `/blog/:slug/`;
export const getAll = async () => {
    return [
        { slug: `hello`, bar: hello() },
        { slug: `world` }
    ];
};
export const getProps = async (item) => {
    return {
        title: `Hello ${item.slug}`
    };
};
//# sourceMappingURL=route.js.map