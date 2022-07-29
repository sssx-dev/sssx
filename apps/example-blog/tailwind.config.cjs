/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/routes/**/*.{js,ts,svelte}",
    "./src/components/**/*.{js,ts,svelte}",
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
  ],
}
