<script lang="ts">
    import { onMount } from "svelte";
    
    export let hello:string;

    onMount(() => {
        console.log(`the first component has mounted with hello=${hello}`);
    });
</script>
  
<style>
    h3 {
        color: red;
    }
</style>

<h3>{hello}</h3>
<h2>
    <slot></slot>
</h2>