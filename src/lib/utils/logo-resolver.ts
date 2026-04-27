/**
 * Utility to fetch and convert tool logos to Base64 for PDF embedding.
 * Uses a favicon service to ensure we get a logo even if the tool URL is new.
 */

export const getToolLogoBase64 = async (url: string | null): Promise<string | null> => {
  if (!url) return null;
  try {
    // Extract domain from URL
    const domain = new URL(url).hostname;
    // Use Google's favicon service for reliable 128px logos
    const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    const response = await fetch(logoUrl);
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error fetching tool logo:', error);
    return null;
  }
};
