import loadImage from '../utils/loadImage'

// Basic types
export type Padding = number | [number, number] | [number, number, number, number]
export type Direction = 'vertical' | 'horizontal'
export type ImgAlign = 'start' | 'center' | 'end'

/**
 * Image item options
 */
export interface ImageItem {
  /** Image URL */
  url: string
  /** Drawing width; the image's own width is used if omitted */
  width?: number
  /** Drawing height; the image's own height is used if omitted */
  height?: number
  /** Stacking order; higher values are drawn on top */
  zIndex?: number
}

// Internal image element interface (not exported)
interface ImageElement {
  image: HTMLImageElement
  width: number
  height: number
  zIndex: number
  index: number
}

/**
 * Calculate the canvas content width: the sum of all image widths for horizontal layout, or the maximum image width for vertical layout
 */
function get_img_maxWidth(images: ImageElement[], direction: Direction) {
  let width = 0

  if (direction === 'horizontal') {
    width = images.reduce((prev, curr) => {
      return prev + curr.width
    }, 0)
  } else if (direction === 'vertical') {
    width = images.reduce((prev, curr) => {
      return prev.width > curr.width ? prev : curr
    }).width
  }

  return width
}

/**
 * Calculate the canvas content height: the maximum image height for horizontal layout, or the sum of all image heights for vertical layout
 */
function get_img_maxHeight(images: ImageElement[], direction: Direction) {
  let height = 0

  if (direction === 'horizontal') {
    height = images.reduce((prev, curr) => {
      return prev.height > curr.height ? prev : curr
    }).height
  } else if (direction === 'vertical') {
    height = images.reduce((prev, curr) => {
      return prev + curr.height
    }, 0)
  }

  return height
}

interface DrawImgOptions {
  /** 2D context used for drawing */
  ctx: CanvasRenderingContext2D
  /** Maximum available width (padding excluded), used for horizontal alignment */
  maxWidth?: number
  /** Maximum available height (padding excluded), used for vertical alignment */
  maxHeight?: number
  /** List of already loaded image elements */
  images: ImageElement[]
  /** Offset of the content from the top of the canvas */
  top?: number
  /** Offset of the content from the left of the canvas */
  left?: number
  /** Gap between images */
  gap?: number
  /** Layout direction, horizontal or vertical */
  direction?: Direction
  /** Image alignment within a row/column */
  imgAlign?: ImgAlign
}
/**
 * Draw images onto the canvas one by one according to the layout direction and alignment
 */
function drawImg(options: DrawImgOptions) {
  const {
    ctx,
    maxWidth,
    maxHeight,
    images,
    top = 0,
    left = 0,
    gap = 0,
    direction = 'vertical',
    imgAlign = 'center'
  } = options

  let _maxWidth = get_img_maxWidth(images, direction)
  let _maxHeight = get_img_maxHeight(images, direction)

  const _images = images.sort((a, b) => a.zIndex - b.zIndex)

  if (direction === 'horizontal') {
    _images.forEach((image) => {
      let _left =
        left + _images.filter((img) => img.index < image.index).reduce((a, b) => a + b.width, 0) + image.index * gap

      let _top = top
      if (maxHeight) _maxHeight = maxHeight
      if (imgAlign === 'center') {
        _top += (_maxHeight - image.height) / 2
      } else if (imgAlign === 'end') {
        _top += _maxHeight - image.height
      }

      ctx.drawImage(image.image, _left, _top, image.width, image.height)
    })
  } else if (direction === 'vertical') {
    _images.forEach((image) => {
      let _top =
        top + _images.filter((img) => img.index < image.index).reduce((a, b) => a + b.height, 0) + image.index * gap

      let _left = left
      if (maxWidth) _maxWidth = maxWidth
      if (imgAlign === 'center') {
        _left += (_maxWidth - image.width) / 2
      } else if (imgAlign === 'end') {
        _left += _maxWidth - image.width
      }

      ctx.drawImage(image.image, _left, _top, image.width, image.height)
    })
  }
}

/**
 * Main options of `ImageGraphics`
 */
export interface ImageGraphicsOptions {
  /**
   * Image sources:
   * - string: image URL
   * - `ImageItem`: image configuration with size and stacking order
   * - array: a mix of both is allowed
   */
  imgs: string | ImageItem | Array<string | ImageItem>
  /** Canvas padding, top/right/bottom/left, shorthand supported */
  padding?: Padding
  /** Image layout direction */
  direction?: Direction
  /** Gap between images */
  gap?: number
  /** Image alignment within each row/column */
  imgAlign?: ImgAlign
  /** Canvas width; `auto` computes it from the images */
  width?: number | 'auto'
  /** Canvas height; `auto` computes it from the images */
  height?: number | 'auto'
}

/**
 * Compose one or more images onto a single canvas in horizontal / vertical layout, supporting gap, alignment and stacking order (zIndex)
 * @param options Image rendering options, see ImageGraphicsOptions
 * @returns The rendered `HTMLCanvasElement`
 */
export default async function ImageGraphics(options: ImageGraphicsOptions) {
  const {
    imgs,
    direction = 'vertical',
    padding = 0,
    gap = 0,
    imgAlign = 'center',
    width: canvasWidth = 'auto',
    height: canvasHeight = 'auto'
  } = options

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

  let _imgs = Array.isArray(imgs) ? imgs : [imgs]
  _imgs = _imgs.filter(Boolean)

  if (!!_imgs.length) {
    const _images: ImageElement[] = []
    for (const img of _imgs) {
      if (typeof img === 'string') {
        const index = _imgs.indexOf(img)
        const image = await loadImage(img)
        _images.push({
          image,
          width: image.width,
          height: image.height,
          zIndex: 0,
          index
        })
      } else {
        const index = (_imgs as ImageItem[]).findIndex((v) => v.url === img.url)
        let [imgWidth, imgHeight] = [0, 0]
        const image = await loadImage(img.url)
        imgWidth = img.width || image.width
        imgHeight = img.height || image.height

        _images.push({
          image,
          width: imgWidth,
          height: imgHeight,
          zIndex: img?.zIndex ?? 0,
          index
        })
      }
    }

    let [_top, _right, _bottom, _left] = [0, 0, 0, 0]
    if (Array.isArray(padding)) {
      if (padding.length === 2) {
        ;[_top, _left] = padding
        ;[_bottom, _right] = padding
      } else {
        ;[_top, _right, _bottom, _left] = padding
      }
    } else {
      ;[_top, _right, _bottom, _left] = [padding, padding, padding, padding]
    }

    let [width, height] = [0, 0]
    if (typeof canvasWidth === 'number') {
      width = canvasWidth
    }
    if (typeof canvasHeight === 'number') {
      height = canvasHeight
    }
    if (!!_images.length && (canvasWidth === 'auto' || canvasHeight === 'auto')) {
      const _rows = _images.length

      if (canvasWidth === 'auto') {
        width =
          get_img_maxWidth(_images, direction) + (_left + _right) + (direction === 'horizontal' ? (_rows - 1) * gap : 0)
      }

      if (canvasHeight === 'auto') {
        height =
          get_img_maxHeight(_images, direction) + (_top + _bottom) + (direction === 'vertical' ? (_rows - 1) * gap : 0)
      }
    }

    canvas.width = width
    canvas.height = height

    if (width && height) {
      drawImg({
        ctx,
        maxWidth: width - (_left + _right),
        maxHeight: height - (_top + _bottom),
        images: _images,
        top: _top,
        left: _left,
        gap,
        direction,
        imgAlign
      })
    }
  }

  return canvas
}
