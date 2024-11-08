import { compile, type CompileOptions } from "svelte/compiler";
import { type RouteInfo } from "../routes/index.ts";

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
// const getMainClientCode = (props: Record<string, any> = {}, hydrate = true) =>
//   `
// const app = new Component({
//   target: document.getElementById("app")!,
//   hydrate: ${hydrate},
//   props: {
//     data: ${JSON.stringify(props, null, 2)}
//   }
// });
// export default app;
// `;

const getMainClientCode = (props: Record<string, any> = {}, hydrate = true) => {
  const mountOrHydrate = hydrate ? "hydrate" : "mount";
  return `
import { mount, unmount, hydrate } from 'svelte';

const props = {
    data: ${JSON.stringify(props, null, 2)}
};
const app = ${mountOrHydrate}(_unknown_, { target: document.getElementById("app"), props });
export default app;
`;
};

// const app = mount(App, { target: document.getElementById("app"), props });

export const generateEntryPoint = (
  isSSR = true,
  compilerOptions: CompileOptions,
  segment: RouteInfo,
  props: Record<string, any> = {}
) => {
  const svelteCode = getMainSSRCode(segment, props);
  const { js } = compile(svelteCode, compilerOptions);
  let code = js.code;

  code = code.replace(`_unknown_[$.FILENAME] = "(unknown)";\n`, ``);

  // console.log("====================");
  // console.log(code);
  // console.log("====================");

  if (!isSSR) {
    // code = code.replace(`export default Component`, ``);
    code = code.replace(
      `export default function _unknown_`,
      `export function _unknown_`
    );
    // `export function App`
    code += `\n`;
    code += getMainClientCode(props, true);
    code += `\n`;
  }

  return code;
};
