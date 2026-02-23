/**
 * Utility for handling Next.js basePath in static assets and API calls.
 * This ensures all paths work correctly when deployed under a basePath.
 */

/**
 * Prepend the basePath to a given path.
 * @param {string} path - The path to prepend the basePath to (should start with '/')
 * @returns {string} The path with basePath prepended
 */
export function withBasePath(path) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  // Avoid double slashes if basePath is empty or path doesn't start with /
  if (!path.startsWith('/')) {
    return `${basePath}/${path}`;
  }
  return `${basePath}${path}`;
}
