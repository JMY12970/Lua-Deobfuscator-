/**
 * Utilities for parsing, normalizing, and converting raw code URLs.
 * Never executes downloaded or parsed scripts.
 */

export interface UrlNormalizationResult {
  originalUrl: string;
  normalizedUrl: string;
  wasConverted: boolean;
  type: 'github_raw' | 'github_blob' | 'rscripts_raw' | 'gist' | 'other_raw';
  description: string;
}

export function normalizeRawUrl(inputUrl: string): UrlNormalizationResult {
  const trimmed = inputUrl.trim();

  // 1. GitHub blob to raw converter
  // Example: https://github.com/owner/repo/blob/main/path/to/script.lua
  // Target:  https://raw.githubusercontent.com/owner/repo/main/path/to/script.lua
  const githubBlobRegex = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i;
  const githubMatch = trimmed.match(githubBlobRegex);
  if (githubMatch) {
    const [, owner, repo, branch, filePath] = githubMatch;
    const rawGithubUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
    return {
      originalUrl: trimmed,
      normalizedUrl: rawGithubUrl,
      wasConverted: true,
      type: 'github_blob',
      description: 'Converted GitHub repository blob URL to raw.githubusercontent.com'
    };
  }

  // 2. Direct GitHub Raw URL
  // Example: https://raw.githubusercontent.com/...
  if (/^https?:\/\/raw\.githubusercontent\.com\//i.test(trimmed)) {
    return {
      originalUrl: trimmed,
      normalizedUrl: trimmed,
      wasConverted: false,
      type: 'github_raw',
      description: 'GitHub Raw URL'
    };
  }

  // 3. Rscripts.net raw URL
  // Example: https://rscripts.net/raw/...
  if (/^https?:\/\/(www\.)?rscripts\.net\/raw\//i.test(trimmed)) {
    return {
      originalUrl: trimmed,
      normalizedUrl: trimmed,
      wasConverted: false,
      type: 'rscripts_raw',
      description: 'RScripts.net Raw URL'
    };
  }

  // 4. GitHub Gist URL conversion
  // Example: https://gist.github.com/username/id -> raw
  const gistRegex = /^https?:\/\/gist\.github\.com\/([^/]+)\/([a-f0-9]+)(?:\/raw)?$/i;
  const gistMatch = trimmed.match(gistRegex);
  if (gistMatch) {
    const [, user, id] = gistMatch;
    const rawGist = `https://gist.githubusercontent.com/${user}/${id}/raw`;
    return {
      originalUrl: trimmed,
      normalizedUrl: rawGist,
      wasConverted: true,
      type: 'gist',
      description: 'Converted GitHub Gist URL to raw format'
    };
  }

  // 5. Generic Raw URL
  return {
    originalUrl: trimmed,
    normalizedUrl: trimmed,
    wasConverted: false,
    type: 'other_raw',
    description: 'Direct raw text URL'
  };
}
