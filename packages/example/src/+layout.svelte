<script lang="ts">
  import "./app.css";
</script>

<div class="gray">
  <slot />
</div>

<style>
  .gray {
    background-color: gray;
    border-width: 2px;
    border-color: red;
    padding: 10px;
  }
</style>
