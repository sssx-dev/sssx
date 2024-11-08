import { compile, type CompileOptions } from "svelte/compiler";
import { type RouteInfo } from "../routes/index.ts";

const CLIENT_CODE_IMPORTS = `import { mount, unmount, hydrate } from 'svelte';`;

// TODO: check if +layout exists
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

const getMainClientCode = (props: Record<string, any> = {}, hydrate = true) => {
  const mountOrHydrate = hydrate ? "hydrate" : "mount";
  // const mountOrHydrate = "mount";
  return `
const props = {data: ${JSON.stringify(props, null, 2)}};
const app = ${mountOrHydrate}(main, { target: document.getElementById("app").children[0], props });
`;
};
// const app = ${mountOrHydrate}(main, { target: document.getElementById("app"), props });

export const generateEntryPoint = (
  isSSR = true,
  compilerOptions: CompileOptions,
  segment: RouteInfo,
  props: Record<string, any> = {}
) => {
  const svelteCode = getMainSSRCode(segment, props);
  const options = { name: "main", ...compilerOptions };
  const { js } = compile(svelteCode, options);
  let code = `${js.code}`;

  if (!isSSR) {
    code = [CLIENT_CODE_IMPORTS, code].join("\n");
    code += `\n`;
    code += getMainClientCode(props, true);
    code += `\n`;
  }

  return code;
};
