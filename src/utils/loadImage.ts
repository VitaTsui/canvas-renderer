// 图片阻塞请求缓存：用于记录进行中的图片加载 Promise，避免重复请求同一资源
const imagePromiseCache: { [key: string]: Promise<HTMLImageElement> | undefined } = {}

// 图片缓存：记录已成功加载完成的图片实例
const imageCache: { [key: string]: HTMLImageElement } = {}

/**
 * 加载图片并做缓存
 *
 * - 相同 URL 的图片只会真正请求一次
 * - 后续重复调用会直接复用缓存的 Image 对象或进行中的 Promise
 *
 * @param url 图片地址
 * @returns 解析为 `HTMLImageElement` 的 Promise
 */
export default async function loadImage(url: string) {
  // 如果图片已经请求过了，则直接返回缓存
  if (imageCache[url]) return imageCache[url]
  // 如果图片正在请求中，则返回请求中的图片
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
