/**
 * Luxe Property Solutions brand settings, shared by the webapps.
 * Brand colors live in webapps/commonui/src/styles/globals.css (luxe-*).
 * See LUXE.md for where each value is used.
 */
export const BRAND = {
  name: 'Luxe Property Solutions',
  shortName: 'Luxe',
  location: 'St. Louis, Missouri',
  websiteUrl: 'https://luxestl.com'
} as const;

/**
 * Upstream MicroRealEstate shows donate, sponsor and "more than 5 properties"
 * prompts. Luxe runs under a commercial license, so these stay hidden.
 */
export const SHOW_UPSTREAM_PROMPTS = false;
