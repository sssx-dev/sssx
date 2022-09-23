<script lang="ts">
  import '../styles/layout.css';
  import '../styles/globals.css';
  export let year = new Date().getFullYear();
</script>

<div class="container mx-auto">
  <slot />
</div>

<div class="bg-black text-white flex justify-center">
  Made with <a href="https://sssx.dev/" rel="dofollow">SSSX</a> © {year}
</div>
