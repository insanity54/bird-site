const slinkity = require('slinkity')
const svelte = require('@slinkity/svelte')

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(
    slinkity.plugin,
    slinkity.defineConfig({
      renderers: [svelte()]
    })
  )


  return {
    templateFormats: [
      "md",
      "njk",
      "html"
    ],

    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",

    dir: {
      input: "_website",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
}
