<script lang="ts">
    import { onMount } from "svelte";
    
    export let hello:string;

    onMount(() => {
        console.log(`the header component has mounted with hello=${hello}`);
    });
</script>
  
<style>
    h3 {
        color: green;
    }
</style>

<h3>header component: {hello}</h3>