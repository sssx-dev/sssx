<script lang="ts">
  import svelteLogo from "../assets/svelte.svg";
  import esbuildLogo from "../assets/esbuild.svg?global";
  import Counter from "../lib/Counter.svelte";

  // not passing data
  export let data: any = {};
  data = data;
</script>

<svelte:head>
  <title>Example Index Page</title>
</svelte:head>

<main>
  <div class="flex flex-row justify-center">
    <a href="https://www.sssx.dev" target="_blank" rel="noreferrer">
      <img src="/logo/sssx.png" class="logo sssx" alt="SSSX Logo" />
    </a>
    <a href="https://esbuild.github.io" target="_blank" rel="noreferrer">
      <img src={esbuildLogo} class="logo" alt="Esbuild Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>

  <h1 class="text-4xl">Esbuild + Svelte</h1>

  <div class="card">
    <Counter />
  </div>

  <p>
    Check out <a href="https://www.sssx.dev" target="_blank" rel="noreferrer"
      >SSSX</a
    >, the static site generator for multimillion pages websites written in
    Svelte.
  </p>

  <p class="read-the-docs">Click on the logos to learn more</p>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #ffcf00aa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .logo.sssx:hover {
    filter: drop-shadow(0 0 2em #ffffffaa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
