import * as svelte from "svelte/compiler";
const getMainSSRCode = () =>
  `<script lang="ts">
  import Layout from './+layout.svelte';
  import Page from './pages/+page.svelte';

  export let page = {}
</script>

<Layout>
  <Page {...page}/>
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
    page: ${JSON.stringify(props, null, 2)}
  }
});

export default app;
`;

export const generateEntryPoint = (
  isSSR = true,
  compilerOptions: svelte.CompileOptions,
  props: Record<string, any> = {}
) => {
  const svelteCode = getMainSSRCode();
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
