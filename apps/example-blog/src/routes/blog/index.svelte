<script type="ts">
    import First from "../../components/first.svelte";
    import Layout from "../../components/layout.svelte";
    
    import '../../styles/globals.css'

    export let title:string = '';
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

<h1>Title {title}</h1>

<Layout>
    <First hello="yo">
        Welcome to blog post
    </First>
</Layout>