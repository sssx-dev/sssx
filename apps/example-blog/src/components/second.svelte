<script lang="ts">
    import { onMount } from "svelte";
    
    export let hello:string;
    let test:HTMLInputElement;

    onMount(() => {
        console.log(`the second component has mounted with hello=${hello}`);
        test.value = "This is from the second component (components can be imported and they are bundled, yay)";
    });
</script>
  
<style>
    input {
        background-color: black;
        color: white;
        min-width: 16em;
    }

    .child {
        background-color: gray;
        padding: 10px;
    }
</style>

<h2>{hello}</h2>
<input type="text" bind:this={test} />

<div class="child">
    <p>Slot goes here {hello}</p>
    <slot></slot>
</div>