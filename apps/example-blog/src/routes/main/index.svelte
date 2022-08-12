<script type="ts">
    import SSSX from 'sssx'
    export let title:string = '';

    const testBlogSlug = SSSX.Routes['blog']({slug:`123`})
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

<h1>{title}</h1>

<h2>Welcome to the main page</h2>

<h3>Generated blog slgug is <a href={testBlogSlug}>{testBlogSlug}</h3>

<footer>Made with <a href="https://github.com/sssx-dev/sssx" target="_blank">SSSX</a></footer>