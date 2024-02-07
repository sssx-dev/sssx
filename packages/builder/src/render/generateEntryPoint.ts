import * as svelte from "svelte/compiler";
const getMainSSRCode = () =>
  `<script lang="ts">
  import Layout from './+layout.svelte';
  import Page from './pages/+page.svelte';
</script>

<Layout>
  <Page/>
</Layout>
`;

// we merge above into the code below
const getMainClientCode = (hydrate = true) =>
  `const app = new Component({
  target: document.getElementById("app")!,
  hydrate: ${hydrate},
});

export default app;
`;

export const generateEntryPoint = (
  isSSR = true,
  compilerOptions: svelte.CompileOptions
) => {
  const svelteCode = getMainSSRCode();
  const { js } = svelte.compile(svelteCode, compilerOptions);
  let code = js.code;

  if (!isSSR) {
    code = code.replace(`export default Component`, ``);
    code += `\n`;
    code += getMainClientCode();
    code += `\n`;
  }

  return code;
};
