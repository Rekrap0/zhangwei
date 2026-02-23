/**
 * Get the base path for the application.
 * This is used for URLs that aren't automatically handled by Next.js router.
 * @returns {string} The base path (e.g., '/game' or '')
 */
export function getBasePath() {
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
}

/**
 * Prefix a path with the base path.
 * Use this for image src, fetch URLs, and other absolute paths.
 * @param {string} path - The path to prefix (should start with '/')
 * @returns {string} The prefixed path
 */
export function withBasePath(path) {
  const basePath = getBasePath();
  if (!path.startsWith('/')) {
    return path; // Return as-is for relative paths or external URLs
  }
  return `${basePath}${path}`;
}
