<script lang="ts">
  /**
   * <Image> component with lazy loading, responsive defaults.
   *
   * Usage:
   *   <Image src="/img/hero.jpg" alt="Hero image" />
   *   <Image src="/img/hero.jpg" alt="Hero" width={800} height={600} eager />
   */
  export let src: string;
  export let alt: string;
  export let width: number | undefined = undefined;
  export let height: number | undefined = undefined;
  export let eager: boolean = false;
  export let className: string = "";
</script>

<img
  {src}
  {alt}
  width={width || undefined}
  height={height || undefined}
  loading={eager ? "eager" : "lazy"}
  decoding="async"
  class={className}
/>
