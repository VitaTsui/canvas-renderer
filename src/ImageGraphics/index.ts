import loadImage from '../utils/loadImage'

// 基础类型
export type Padding = number | [number, number] | [number, number, number, number]
export type Direction = 'vertical' | 'horizontal'
export type ImgAlign = 'start' | 'center' | 'end'

// 图片项接口
export interface ImageItem {
  url: string
  width?: number
  height?: number
  zIndex?: number
}

// 内部使用的图片元素接口（不导出）
interface ImageElement {
  image: HTMLImageElement
  width: number
  height: number
  zIndex: number
  index: number
}

/**
 * 获取最大图片宽度
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
 * 获取最大图片高度
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

/**
 * 绘制图片
 */
interface DrawImgOptions {
  ctx: CanvasRenderingContext2D
  maxWidth?: number
  maxHeight?: number
  images: ImageElement[]
  top?: number
  left?: number
  gap?: number
  direction?: Direction
  imgAlign?: ImgAlign
}
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

// 主配置接口
export interface ImageGraphicsOptions {
  imgs: string | ImageItem | Array<string | ImageItem>
  padding?: Padding
  direction?: Direction
  gap?: number
  imgAlign?: ImgAlign
  width?: number | 'auto'
  height?: number | 'auto'
}
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
