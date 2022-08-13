// @ts-nocheck

// to hold VirtualComponentData
let hydratableComponents = []
// to be injected with css links from wrapHydratableComponents
export let cssLinks = []

const create_ssr_component_sssx = (index, fn) => {
    const ssrComponent = create_ssr_component(fn) // {render, $$render}

    return {
        ...ssrComponent,
        // TODO: refactor this, this wrapper gets called multiple times
        // so hydratableComponents gets overpopulated with similar data
        getHydratableComponents: () => hydratableComponents
            .filter((value, index, array) => array.map(({prefix}) => prefix).indexOf(value.prefix) === index),
        render: (props, options) => {
            const {html, css, head} = ssrComponent.render(props, options)
            const enhancedHead = head + `\n` + cssLinks.join(`\n`)
            return {
                html,
                css,
                head: enhancedHead
            }
        }
    }
}

const validate_component_sssx = (index, component, name) => {
    const c = validate_component(component, name)
    const prefix = 'sssx-'+name.toLowerCase()+'-'+index // gives 'sssx-component-0'
    const propName = "hydrate-options"
    
    return {
        ...c,
        $$render: (result, props, bindings, slots, context) => {
            // normal component, render only statically
            if(props[propName] === undefined) return c.$$render(result, props, bindings, slots, context)

            hydratableComponents.push({
                name,
                prefix,
                props
            })

            return [
                `<div id="${prefix}-start"></div>`,
                c.$$render(result, props, bindings, slots, context),
                `<div id="${prefix}-end"></div>`,
                ''
            ].join(`\n`)
        }
    }
}

const onlyUnique = (value, index, self) =>{
    return self.indexOf(value) === index;
}