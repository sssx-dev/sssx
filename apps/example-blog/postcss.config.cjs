const cssnano = require('cssnano')
const autoprefixer = require('autoprefixer')
const purgecss = require('@fullhuman/postcss-purgecss')

const tailwindcss = require('tailwindcss')
const tailwindcssConfig = require('./tailwind.config.cjs')

const isProduction = process.env.NODE_ENV === 'production'
// const isProduction = true

module.exports = {
  plugins: [
    tailwindcss(tailwindcssConfig),
    isProduction && autoprefixer,
    isProduction && cssnano({preset: 'default'}),
    // purgecss({
    //   content: ['./src/**/*.svelte', './src/**/*.ts'],
    //   defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    // })
  ]
}