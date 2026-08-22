/*
 * Media Library module
 *
 * This module is intentionally independent of the existing admin.html while
 * the refactor is being performed incrementally. The public functions below
 * can be wired into the existing page after the current Media Library markup
 * is extracted.
 */

export async function copyMediaUrl(url, button = null) {
  if (!url) throw new Error('No media URL was provided.');

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const copied = document.execCommand('copy');
      textarea.remove();
      if (!copied) throw new Error('Clipboard copy was not available.');
    }

    if (button) {
      const originalText = button.textContent;
      button.textContent = '✓ Copied!';
      button.disabled = true;
      window.setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 1800);
    }

    return true;
  } catch (error) {
    console.error('Failed to copy media URL:', error);
    return false;
  }
}
