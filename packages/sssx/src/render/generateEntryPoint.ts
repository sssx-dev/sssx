import { compile, type CompileOptions } from "svelte/compiler";
import { type RouteInfo } from "../routes/index.ts";

const CLIENT_CODE_IMPORTS = `import { mount, unmount, hydrate } from 'svelte';`;

const getMainSSRCode = (segment: RouteInfo, props: Record<string, any> = {}) =>
  `<script lang="ts">
  import Layout from './+layout.svelte';
  import Page from '${segment.route}${segment.svelte}';

  export let data = ${JSON.stringify(props)}
</script>

<Layout>
  <Page {data}/>
</Layout>
`;

/**
 * Client code that loads props from an external data.json file
 * instead of inlining them into the JS bundle.
 * This allows bundle dedup since the JS is now props-independent.
 */
const getMainClientCodeExternal = (hydrate = true) => {
  const mountOrHydrate = hydrate ? "hydrate" : "mount";
  return `
const dataEl = document.getElementById("__sssx_data");
const props = dataEl ? { data: JSON.parse(dataEl.textContent) } : { data: {} };
const app = ${mountOrHydrate}(main, { target: document.getElementById("app").children[0], props });
`;
};

/**
 * Fallback: inline props directly (dev mode or small pages)
 */
const getMainClientCodeInline = (props: Record<string, any> = {}, hydrate = true) => {
  const mountOrHydrate = hydrate ? "hydrate" : "mount";
  return `
const props = {data: ${JSON.stringify(props, null, 2)}};
const app = ${mountOrHydrate}(main, { target: document.getElementById("app").children[0], props });
`;
};

export const generateEntryPoint = (
  isSSR = true,
  compilerOptions: CompileOptions,
  segment: RouteInfo,
  props: Record<string, any> = {},
  externalizeProps: boolean = false
) => {
  const svelteCode = getMainSSRCode(segment, props);
  const options = { name: "main", ...compilerOptions };
  const { js } = compile(svelteCode, options);
  let code = `${js.code}`;

  if (!isSSR) {
    code = [CLIENT_CODE_IMPORTS, code].join("\n");
    code += `\n`;
    code += externalizeProps
      ? getMainClientCodeExternal(true)
      : getMainClientCodeInline(props, true);
    code += `\n`;
  }

  return code;
};
