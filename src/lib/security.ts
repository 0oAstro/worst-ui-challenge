/**
 * Security utilities for the application
 */

/**
 * Validates if a redirect path is safe to use
 * @param path - The path to validate
 * @returns true if the path is safe, false otherwise
 */
export const isValidRedirectPath = (path: string): boolean => {
  // Must start with / but not // (which would be a protocol-relative URL)
  return path.startsWith('/') && !path.startsWith('//');
};

/**
 * Sanitizes a CodePen username for use in URLs
 * @param username - The CodePen username to sanitize
 * @returns The sanitized username
 */
export const sanitizeCodepenUsername = (username: string): string => {
  return encodeURIComponent(username);
};

/**
 * Sanitizes a CodePen pen ID for use in URLs
 * @param id - The pen ID to sanitize
 * @returns The sanitized pen ID
 */
export const sanitizeCodepenId = (id: string): string => {
  return encodeURIComponent(id);
};

/**
 * Creates a safe CodePen embed URL
 * @param username - The CodePen username
 * @param id - The pen ID
 * @returns A safe CodePen embed URL
 */
export const createSafeCodepenEmbedUrl = (username: string, id: string): string => {
  const safeUsername = sanitizeCodepenUsername(username);
  const safeId = sanitizeCodepenId(id);
  return `https://codepen.io/${safeUsername}/embed/${safeId}?default-tab=result&editable=false`;
};

/**
 * Creates a safe CodePen pen URL
 * @param username - The CodePen username
 * @param id - The pen ID
 * @returns A safe CodePen pen URL
 */
export const createSafeCodepenPenUrl = (username: string, id: string): string => {
  const safeUsername = sanitizeCodepenUsername(username);
  const safeId = sanitizeCodepenId(id);
  return `https://codepen.io/${safeUsername}/pen/${safeId}`;
};
