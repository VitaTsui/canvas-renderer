// Cache of in-flight image loading promises, so the same resource is never requested twice concurrently
const imagePromiseCache: { [key: string]: Promise<HTMLImageElement> | undefined } = {}

// Cache of successfully loaded image instances
const imageCache: { [key: string]: HTMLImageElement } = {}

/**
 * Load an image with caching
 *
 * - The same URL is only actually requested once
 * - Repeated calls reuse the cached Image object or the in-flight promise
 *
 * @param url Image URL
 * @returns Promise resolving to the loaded `HTMLImageElement`
 */
export default async function loadImage(url: string) {
  // If the image has already been loaded, return the cached one directly
  if (imageCache[url]) return imageCache[url]
  // If the image is currently being loaded, return the pending request
  if (imagePromiseCache[url]) return imagePromiseCache[url] as Promise<HTMLImageElement>

  const imagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.src = url

    image.onload = () => {
      resolve(image)
      imageCache[url] = image
    }
    image.onerror = () => {
      reject()
    }
  })
  imagePromiseCache[url] = imagePromise

  return imagePromise
}
