<script type="ts">
  import First from '../../components/first.svelte';
  import Layout from '../../components/layout.svelte';

  import '../../styles/globals.css';

  export let title: string = '';
  export let description: string = '';
</script>

<h1>Title {title}</h1>

<Layout title="{title}" description="{description}">
  <First hello="yo">Welcome to blog post</First>
</Layout>
