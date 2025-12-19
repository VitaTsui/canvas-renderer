import loadImage from '../utils/loadImage'
import type { BackgroundStyle, Radius } from './index'

export interface DrawCtxOptions {
  ctx: CanvasRenderingContext2D
  backgroundStyle?: BackgroundStyle
  radius?: Radius
  width: number
  height: number
}

export default async function drawCtx(options: DrawCtxOptions) {
  const { ctx, width, height, radius = 0, backgroundStyle = {} } = options
  const {
    color: backgroundColor,
    colorDirection = 'horizontal',
    image: backgroundImage,
    imageSize: backgroundImageSize,
    imagePosition: backgroundImagePosition,
    imageFill: backgroundImageFill = 'ctx'
  } = backgroundStyle

  if (!backgroundColor && !backgroundImage) {
    return
  }

  const PI = Math.PI

  const [x, y] = [0, 0]

  let [lt, rt, rb, lb] = [0, 0, 0, 0]
  if (Array.isArray(radius)) {
    ;[lt, rt, rb, lb] = radius
  } else {
    ;[lt, rt, rb, lb] = [radius, radius, radius, radius]
  }

  // 左上圆角
  if (lt) {
    ctx.arc(x + lt, y + lt, lt, PI, PI * 1.5)
  } else {
    ctx.moveTo(x, y)
  }
  // 右上圆角
  if (rt) {
    ctx.lineTo(x + width - rt, y)
    ctx.arc(x + width - rt, y + rt, rt, PI * 1.5, 0)
  } else {
    ctx.lineTo(x + width, y)
  }
  // 右下圆角
  if (rb) {
    ctx.lineTo(x + width, y + height - rb)
    ctx.arc(x + width - rb, y + height - rb, rb, 0, PI * 0.5)
  } else {
    ctx.lineTo(x + width, y + height)
  }
  // 左下圆角
  if (lb) {
    ctx.lineTo(x + lb, y + height)
    ctx.arc(x + lb, y + height - lb, lb, PI * 0.5, PI)
  } else {
    ctx.lineTo(x, y + height)
  }
  ctx.clip()

  if (backgroundColor) {
    if (typeof backgroundColor === 'string') {
      ctx.fillStyle = backgroundColor
    } else {
      const _width = colorDirection === 'vertical' ? 0 : width
      const _height = colorDirection === 'horizontal' ? 0 : height
      const gradient = ctx.createLinearGradient(0, 0, _width, _height)
      Object.keys(backgroundColor).forEach((key) => {
        const color = backgroundColor[+key]
        gradient.addColorStop(+key, color)
      })
      ctx.fillStyle = gradient
    }

    ctx.fillRect(0, 0, width, height)
  } else if (backgroundImage) {
    const image = await loadImage(backgroundImage)

    let [_x, _y] = [0, 0]
    if (backgroundImagePosition) {
      if (Array.isArray(backgroundImagePosition)) {
        ;[_x, _y] = backgroundImagePosition
      } else {
        ;[_x, _y] = [backgroundImagePosition, backgroundImagePosition]
      }
    }

    let [_width, _height] = [0, 0]
    if (backgroundImageFill === 'ctx') {
      ;[_width, _height] = [width, height]
    } else if (backgroundImageFill === 'img') {
      ;[_width, _height] = [image.width, image.height]
    }

    if (backgroundImageSize) {
      let [_w_size, _h_size] = ['', '']
      if (Array.isArray(backgroundImageSize)) {
        ;[_w_size, _h_size] = backgroundImageSize
      } else {
        ;[_w_size, _h_size] = [backgroundImageSize, backgroundImageSize]
      }

      if (!isNaN(+_w_size)) {
        _width = +_w_size
      } else {
        const w_percent = +_w_size.replace('%', '')
        if (!isNaN(+w_percent)) {
          _width = (w_percent * width) / 100
        }
      }

      if (!isNaN(+_h_size)) {
        _height = +_h_size
      } else {
        const h_percent = +_h_size.replace('%', '')
        if (!isNaN(+h_percent)) {
          _height = (h_percent * height) / 100
        }
      }
    }

    ctx.drawImage(image, _x, _y, _width, _height)
  }
}
