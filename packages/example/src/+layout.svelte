<script lang="ts">
  import "./app.css";
</script>

<svelte:head>
  <link rel="icon" type="image/svg+xml" href="/icon.svg" />
</svelte:head>

<div class="gray">
  <slot />
</div>

<style>
  .gray {
    background-color: lightgray;
    border-width: 2px;
    border-color: red;
    padding: 10px;
  }
</style>
