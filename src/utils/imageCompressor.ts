const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DIMENSION = 256;
const WEBP_QUALITY = 0.75;

/**
 * Compresses and resizes an image file to a small WebP data URL.
 * - Rejects files > 5 MB before processing
 * - Resizes to fit within 256×256 while preserving aspect ratio
 * - Exports as WebP at 0.75 quality (falls back to JPEG if WebP unsupported)
 * - Typical output: 15–40 KB as a base64 data URL
 */
export function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        if (file.size > MAX_FILE_SIZE) {
            reject(new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`));
            return;
        }

        if (!file.type.startsWith('image/')) {
            reject(new Error('Selected file is not an image.'));
            return;
        }

        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error('Failed to decode image.'));
            img.onload = () => {
                // Calculate scaled dimensions preserving aspect ratio
                let width = img.width;
                let height = img.height;

                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
                    width = Math.round(width * scale);
                    height = Math.round(height * scale);
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas 2D context not available.'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Try WebP first, fall back to JPEG
                let dataUrl = canvas.toDataURL('image/webp', WEBP_QUALITY);
                if (!dataUrl.startsWith('data:image/webp')) {
                    dataUrl = canvas.toDataURL('image/jpeg', WEBP_QUALITY);
                }

                resolve(dataUrl);
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    });
}
