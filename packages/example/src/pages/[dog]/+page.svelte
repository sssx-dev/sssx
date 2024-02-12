<script lang="ts">
  import type { Props } from "./+page";
  import corgi from "./corgi.jpg?global";

  export let data: Props;

  const { dog } = data;
</script>

<h1>
  This is the page about the {data.name}
</h1>

<h2>Animal: {data.animal}</h2>
<h2>Dog: {data.dog}</h2>

<img src={corgi} alt="Corgi {data.dog}" />
