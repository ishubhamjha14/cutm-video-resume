/**
 * URL Utilities for Video Resume Application
 * Ensures robust distinction between Internal SPA Routes and External Custom URLs.
 */

/**
 * Normalizes a URL:
 * - If null or empty, returns empty string.
 * - If starts with http:// or https:// or / or #, preserves it exactly.
 * - If an external domain is entered without protocol (e.g., "video-qr-generator.onrender.com/video/123"),
 *   safely normalizes by prepending "https://".
 * - Preserves all query parameters, fragments, ports, and paths.
 */
export function normalizeUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // If already absolute protocol or relative root/hash path
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }

  // If protocol-relative (//example.com)
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  // Prepend https:// for domain inputs like "example.com/video"
  return `https://${trimmed}`;
}

/**
 * Checks whether a URL points to an external site or belongs to this SPA application.
 *
 * Internal examples:
 * - "/raw/1", "/final-video", "/team-cvs", "/raw-videos", "/"
 * - "http://localhost:5173/raw/1" (same origin)
 *
 * External examples:
 * - "https://video-qr-generator.onrender.com/video/5f70d7e6"
 * - "https://youtu.be/..."
 */
export function isExternalUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const normalized = normalizeUrl(url);
  if (!normalized) return false;

  // Relative paths are always internal
  if (normalized.startsWith('/') || normalized.startsWith('#')) {
    return false;
  }

  try {
    const parsed = new URL(normalized, window.location.origin);
    return parsed.origin !== window.location.origin;
  } catch {
    // If URL parsing fails, check if it starts with http(s)
    return /^https?:\/\//i.test(normalized);
  }
}

/**
 * Safely opens a URL:
 * - External URL: opens via window.open(url, '_blank', 'noopener,noreferrer')
 * - Internal URL: triggers internal SPA callback or window.location.href
 */
export function openPublicVideoUrl(
  url: string | null | undefined,
  onInternalNavigate?: (path: string) => void
): void {
  if (!url) return;
  const normalized = normalizeUrl(url);
  if (!normalized) return;

  if (isExternalUrl(normalized)) {
    window.open(normalized, '_blank', 'noopener,noreferrer');
  } else {
    let internalPath = normalized;
    if (internalPath.startsWith(window.location.origin)) {
      internalPath = internalPath.replace(window.location.origin, '') || '/';
    }
    if (onInternalNavigate) {
      onInternalNavigate(internalPath);
    } else {
      window.location.href = internalPath;
    }
  }
}
