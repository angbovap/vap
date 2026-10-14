module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("src/scripts");
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // Which booking host best fits the current page (empty when none).
  const booking = require("./src/_data/booking.json");
  eleventyConfig.addFilter("featuredHost", (pageUrl, services, memberSlug) => {
    if (booking.hosts.some((h) => h.slug === memberSlug)) return memberSlug;
    if (booking.serviceHost[pageUrl]) return booking.serviceHost[pageUrl];
    const first = services && services[0] && services[0].url;
    return (first && booking.serviceHost[first]) || "";
  });

  // Full booking details for one host: name, focus, photo and the link to use.
  const site = require("./src/_data/site.json");
  const team = require("./src/_data/team.json");
  eleventyConfig.addFilter("bookHost", (slug) => {
    const host = booking.hosts.find((h) => h.slug === slug);
    const member = team.find((m) => m.slug === slug);
    if (!host || !member) return null;
    const url =
      host.bookingUrl ||
      (slug === "john-marinopoulos" && site.bookingEmbedUrl) ||
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        "&text=" + encodeURIComponent("Meeting with " + member.name) +
        "&details=" + encodeURIComponent("Discussion with " + site.name + " about delivering real commercial intelligence for your organisation.") +
        "&add=" + encodeURIComponent(member.email);
    return { ...host, name: member.name, image: member.image, url };
  });

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
      ...projectMap.regions.map((r) => ({ id: r.id, label: r.label, totalCount: r.totalCount, projects: r.projects })),
      { id: "national", label: "National", totalCount: projectMap.nationalTotalCount, projects: projectMap.nationalProjects },
    ].sort((a, b) => (b.totalCount || b.projects.length) - (a.totalCount || a.projects.length))
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
