/**
 * Generates a pixel art avatar based on an address
 * Creates a deterministic 8x8 pixel pattern
 */
export function generatePixelAvatar(address: string): string {
  // Use address as seed for deterministic generation
  const seed = address.slice(2, 10); // Use first 8 hex chars
  const colors = [
    '#FFD700', // Gold
    '#FFA500', // Orange
    '#FF6347', // Tomato
    '#FF1493', // Deep Pink
    '#9370DB', // Medium Purple
    '#00CED1', // Dark Turquoise
    '#32CD32', // Lime Green
    '#FF69B4', // Hot Pink
    '#00BFFF', // Deep Sky Blue
    '#FF4500', // Orange Red
  ];

  // Generate 8x8 grid
  const grid: string[] = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const index = (parseInt(seed[i % 8], 16) + j) % colors.length;
      grid.push(colors[index]);
    }
  }

  // Create SVG
  const pixelSize = 8;
  const size = 8 * pixelSize;
  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
  
  grid.forEach((color, index) => {
    const x = (index % 8) * pixelSize;
    const y = Math.floor(index / 8) * pixelSize;
    svg += `<rect x="${x}" y="${y}" width="${pixelSize}" height="${pixelSize}" fill="${color}"/>`;
  });
  
  svg += '</svg>';
  
  // Convert to base64 data URL
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generate a simple hash from address for avatar generation
 */
export function generateAvatarHash(address: string): string {
  // Simple hash function for avatar generation
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    const char = address.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}


