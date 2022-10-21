<script lang="ts">
  import { onMount } from 'svelte';
  import confetti from 'canvas-confetti';

  const delay = 1000;

  onMount(() => {
    setTimeout(confetti, delay);
  });
</script>

<h1>Confetti component</h1>
