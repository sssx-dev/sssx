<script type="ts">
    import First from "../../components/first.svelte";
    import Second from "../../components/second.svelte";
    export let answer:string = '';
</script>

<svelte:head>
    <title>Test page</title>
</svelte:head>

<h1>Hello, your answer is {answer}</h1>

<Second hydrate-options={{preload:true}} hello="static variable"/>

<hr/>
<First hello="static first world">
    Static slot
</First>
<hr/>

<h2>Second section</h2>
<Second hydrate-options={{preload:true}} hello="static variable #2">
    <p>This is slot's content</p>
</Second>