// Relative to baseURL. './' keeps the country path (e.g. /gb/en/), while '/' would drop it.
export const ROUTES = {
  home: './',
} as const;

// Used to assert that navigation really landed on the expected page.
export const URL_PATTERNS = {
  careers: /\/this-is-ikea\/work-with-us\//,
  jobPortal: /jobs\.ikea\.com\/en(?:\/|$)/,
} as const;
