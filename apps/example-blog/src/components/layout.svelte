<script lang="ts">
    import '../styles/layout.css'
    import '../styles/globals.css'
    export let year = 2022
</script>

<div class="container mx-auto">
    <slot></slot>
</div>

<div class="bg-black text-white flex justify-center">
    Made with <a href="https://sssx.dev/" rel="dofollow">SSSX</a> © {year}
</div>