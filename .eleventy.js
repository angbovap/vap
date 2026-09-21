module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("src/scripts");
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  eleventyConfig.addFilter("countType", (items, type) =>
    items.filter((item) => item.type === type).length
  );

  eleventyConfig.addFilter("groupByYear", (items) => {
    const groups = new Map();
    [...items]
      .sort((a, b) => b.sortDate.localeCompare(a.sortDate))
      .forEach((item) => {
        if (!groups.has(item.year)) groups.set(item.year, []);
        groups.get(item.year).push(item);
      });
    return [...groups].map(([year, list]) => ({ year, items: list }));
  });

  eleventyConfig.addFilter("mapGroups", (projectMap) =>
    [
      ...projectMap.regions.map((r) => ({ id: r.id, label: r.label, projects: r.projects })),
      { id: "national", label: "National", projects: projectMap.nationalProjects },
    ].sort((a, b) => b.projects.length - a.projects.length)
  );

  eleventyConfig.addFilter("caseSetting", (items, setting) =>
    items.filter((item) => item.data.setting === setting)
  );

  eleventyConfig.addCollection("caseStudies", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/our-work/*.md")
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["njk", "md"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
