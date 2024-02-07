import * as svelte from "svelte/compiler";
const getMainCode = () =>
  `<script lang="ts">
  import Layout from './+layout.svelte';
  import Page from './pages/+page.svelte';
</script>

<Layout>
  <Page/>
</Layout>
`;

export const generateEntryPoint = (compilerOptions: svelte.CompileOptions) => {
  const svelteCode = getMainCode();
  const { js } = svelte.compile(svelteCode, compilerOptions);

  return js.code;
};
