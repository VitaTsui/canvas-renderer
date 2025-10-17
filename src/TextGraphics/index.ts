import { deepCopy, get_string_size } from 'hsu-utils'
import loadImage from '../utils/loadImage'
import drawCtx, { BackgroundStyle } from './drawCtx'
import drawBorder, { BorderStyle } from './drawBorder'
import drawText, { FontStyle } from './drawText'

type Padding = number | [number, number] | [number, number, number, number]

type Size = number | 'auto' | 'bgImg'

type Align = 'top' | 'center' | 'bottom'

export interface TextGraphicsOptions {
  content?: string | string[]
  borderStyle?: BorderStyle
  backgroundStyle?: BackgroundStyle
  fontStyle?: FontStyle
  padding?: Padding
  size?: Size | [Size, Size]
  align?: Align
  rowGap?: number
}

export default async function TextGraphics(options: TextGraphicsOptions): Promise<HTMLCanvasElement> {
  const {
    content,
    borderStyle = {},
    backgroundStyle = {},
    fontStyle = {},
    size: canvasSize = ['auto', 'auto'],
    padding = 0,
    align = 'center',
    rowGap = 0
  } = options
  const { radius: borderRadius = 0, width: borderWidth = 0 } = borderStyle
  const {
    font = {
      size: 10,
      style: 'normal',
      variant: 'normal',
      weight: 'normal',
      family: 'sans-serif'
    },
    letterSpacing = 0
  } = fontStyle
  const { size: fontSize = 10 } = font
  const { image: backgroundImage } = backgroundStyle

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
  if (borderWidth) {
    _top += borderWidth
    _right += borderWidth
    _bottom += borderWidth
    _left += borderWidth
  }

  let [width, height] = [0, 0]
  const _canvasSize = Array.isArray(canvasSize) ? canvasSize : [canvasSize, canvasSize]
  const [canvasWidth, canvasHeight] = _canvasSize
  if (typeof canvasWidth === 'number') {
    width = canvasWidth
  }
  if (typeof canvasHeight === 'number') {
    height = canvasHeight
  }
  if (backgroundImage) {
    const image = await loadImage(backgroundImage)
    if (canvasWidth === 'bgImg') {
      width = image.width
    }
    if (canvasHeight === 'bgImg') {
      height = image.height
    }
  }

  let _text = content ? (Array.isArray(content) ? deepCopy(content) : [content]) : []
  _text = _text.filter(Boolean)

  if (!!_text.length && (canvasWidth === 'auto' || canvasHeight === 'auto')) {
    if (canvasWidth === 'auto') {
      const _maxText = deepCopy(_text).reduce((prev, curr) => {
        const prevLength = get_string_size(prev, font).width
        const currLength = get_string_size(curr, font).width
        return prevLength > currLength ? prev : curr
      })
      const _maxTextWidth = get_string_size(_maxText, font).width
      width = _maxTextWidth + (_left + _right) + (_maxText.length - 1) * letterSpacing
    }

    if (canvasHeight === 'auto') {
      const _rows = _text.length
      height = _rows * fontSize + (_top + _bottom) + (_rows - 1) * rowGap
    }
  }

  if (!!_text.length && canvasHeight !== 'auto') {
    const _rows = _text.length
    const textHeight = _rows * fontSize + (_rows - 1) * rowGap

    if (align === 'top') {
      _top = _top
    } else if (align === 'center') {
      _top = (height - textHeight) / 2
    } else if (align === 'bottom') {
      _top = height - (textHeight + _bottom)
    }
  }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  canvas.width = width
  canvas.height = height

  if (width && height) {
    await drawCtx({ ctx, radius: borderRadius, width, height, backgroundStyle })

    drawBorder({ ctx, width, height, borderStyle })

    if (_text) {
      await drawText({
        ctx,
        maxTextLength: width - (_left + _right),
        text: _text,
        fontStyle,
        top: _top,
        left: _left,
        rowGap
      })
    }
  }

  return canvas
}
