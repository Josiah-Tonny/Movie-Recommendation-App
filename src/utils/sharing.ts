/**
 * Sharing Utilities
 * 
 * This file contains utility functions for sharing content from the app.
 */

/**
 * Share content using the Web Share API if available, or fall back to copy to clipboard
 * 
 * @param title - The title to share
 * @param text - The description text to share
 * @param url - The URL to share
 * @returns Promise that resolves to true if shared successfully, false if only copied to clipboard
 */
export const shareContent = async (
  title: string,
  text: string,
  url: string
): Promise<{ success: boolean; method: 'share' | 'clipboard' }> => {
  try {
    // Check if Web Share API is available
    if (navigator.share) {
      await navigator.share({
        title,
        text,
        url,
      });
      return { success: true, method: 'share' };
    } else {
      // Fall back to clipboard API
      await navigator.clipboard.writeText(url);
      return { success: true, method: 'clipboard' };
    }
  } catch (error) {
    console.error('Error sharing content:', error);
    return { success: false, method: 'clipboard' };
  }
};

/**
 * Copy text to clipboard
 * 
 * @param text - The text to copy to clipboard
 * @returns Promise that resolves to true if copied successfully
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

/**
 * Generate share links for different platforms
 * 
 * @param url - The URL to share
 * @param title - The title to share
 * @returns Object containing share links for various platforms
 */
export const generateShareLinks = (url: string, title: string): Record<string, string> => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${url}`,
  };
};
