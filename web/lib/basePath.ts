// GitHub Pages serves the static export under /<repo>/. The deploy workflow
// sets NEXT_PUBLIC_BASE_PATH at build time; local dev and tests leave it empty.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// Prefix for raw fetch()/<a href> paths — Next only rewrites its own routing.
export const withBase = (path: string) => `${BASE_PATH}${path}`;
