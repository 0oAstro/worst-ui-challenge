/**
 * Utility functions for handling images with fallbacks
 */

export const getImageUrl = (
  codepenId: string,
  size: "small" | "medium" | "large" = "medium",
) => {
  const sizeMap = {
    small: "320",
    medium: "1280",
    large: "1920",
  };

  const sizeSuffix = sizeMap[size];

  return {
    primary: `https://shots.codepen.io/pen/${codepenId}-${sizeSuffix}.jpg`,
    fallback: `https://shots.codepen.io/pen/${codepenId}-800.jpg`,
    thumbnail: `https://shots.codepen.io/pen/${codepenId}-320.jpg`,
  };
};

export const getImageSources = (codepenId: string) => {
  return [
    `https://shots.codepen.io/pen/${codepenId}-1280.jpg`,
    `https://shots.codepen.io/pen/${codepenId}-800.jpg`,
    `https://shots.codepen.io/pen/${codepenId}-320.jpg`,
    `https://shots.codepen.io/pen/${codepenId}.jpg`,
  ];
};

export const isExternalImage = (src: string): boolean => {
  try {
    const url = new URL(src);
    return (
      url.hostname !== "localhost" &&
      url.hostname !== window.location.hostname &&
      !src.startsWith("/")
    );
  } catch {
    return false;
  }
};
