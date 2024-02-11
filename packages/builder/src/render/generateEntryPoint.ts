import * as svelte from "svelte/compiler";
import { RouteInfo } from "./routes";

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

// we merge above into the code below
// https://svelte.dev/docs/client-side-component-api
// props are nested because we pass them via a wrapper
const getMainClientCode = (props: Record<string, any> = {}, hydrate = true) =>
  `const app = new Component({
  target: document.getElementById("app")!,
  hydrate: ${hydrate},
  props: {
    data: ${JSON.stringify(props, null, 2)}
  }
});

export default app;
`;

export const generateEntryPoint = (
  isSSR = true,
  compilerOptions: svelte.CompileOptions,
  segment: RouteInfo,
  props: Record<string, any> = {}
) => {
  const svelteCode = getMainSSRCode(segment, props);
  const { js } = svelte.compile(svelteCode, compilerOptions);
  let code = js.code;

  if (!isSSR) {
    code = code.replace(`export default Component`, ``);
    code += `\n`;
    code += getMainClientCode(props);
    code += `\n`;
  }

  return code;
};
