import { deepCopy } from 'hsu-utils'
import loadImage from '../_utils/loadImage'

type TextAlign = 'left' | 'center' | 'right'

type Padding = number | [number, number] | [number, number, number, number]

type Radius = number | [number, number, number, number]

interface FontStyle {
  style?: string
  variant?: string
  weight?: string
  size?: number
  lineHeight?: number
  family?: string
  color?: string
  padding?: Padding
  rowGap?: number
  textAlign?: TextAlign
  letterSpacing?: number
  borderColor?: string
  borderWidth?: number
}

interface BorderStyle {
  color?: string
  width?: number
  radius?: Radius
}

interface LinearGradient {
  [key: number]: string
}

interface BackgroundStyle {
  color?: string | LinearGradient
  image?: string
  size?: [string, string] | string
  position?: [number, number] | number
}

/**
 * 计算字符串长度
 */
function get_string_width(str: string): number {
  let width = 0
  for (const char of str) {
    width += char.charCodeAt(0) < 128 && char.charCodeAt(0) >= 0 ? 0.5 : 1
  }

  return width
}
/**
 * 计算字符长度
 */
function get_char_width(char: string): number {
  const width = char.charCodeAt(0) < 128 && char.charCodeAt(0) >= 0 ? 0.5 : 1

  return width
}

/**
 * 绘制画板
 */
interface DrawCtxOptions {
  ctx: CanvasRenderingContext2D
  backgroundStyle?: BackgroundStyle
  radius?: Radius
  width: number
  height: number
}
async function drawCtx(options: DrawCtxOptions) {
  const { ctx, width, height, radius = 0, backgroundStyle = {} } = options
  const {
    color: backgroundColor,
    image: backgroundImage,
    size: backgroundSize,
    position: backgroundPosition
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
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      Object.keys(backgroundColor).forEach((key) => {
        const color = backgroundColor[+key]
        gradient.addColorStop(+key, color)
      })
      ctx.fillStyle = gradient
    }

    ctx.fillRect(0, 0, width, height)
  }

  if (backgroundImage) {
    const image = await loadImage(backgroundImage)

    let [_x, _y] = [0, 0]
    if (backgroundPosition) {
      if (Array.isArray(backgroundPosition)) {
        ;[_x, _y] = backgroundPosition
      } else {
        ;[_x, _y] = [backgroundPosition, backgroundPosition]
      }
    }

    let [_width, _height] = [image.width, image.height]
    if (backgroundSize) {
      let [_w_size, _h_size] = ['', '']
      if (Array.isArray(backgroundSize)) {
        ;[_w_size, _h_size] = backgroundSize
      } else {
        ;[_w_size, _h_size] = [backgroundSize, backgroundSize]
      }

      if (!isNaN(+_w_size)) {
        _width = +_w_size
      } else {
        const w_percent = +_w_size.replace('%', '')
        _width = (w_percent * _width) / 100
      }

      if (!isNaN(+_h_size)) {
        _height = +_h_size
      } else {
        const h_percent = +_h_size.replace('%', '')
        _height = (h_percent * _height) / 100
      }
    }

    ctx.drawImage(image, _x, _y, _width, _height)
  }
}

/**
 * 绘制边框
 */
interface DrawBorderOptions {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  borderStyle?: BorderStyle
}
function drawBorder(options: DrawBorderOptions) {
  const { ctx, width, height, borderStyle = {} } = options
  const { color: borderColor, width: borderWidth = 0, radius: borderRadius = 0 } = borderStyle

  if (!borderWidth || !borderColor) {
    return
  }

  const [x, y] = [0, 0]

  let [lt, rt, rb, lb] = [0, 0, 0, 0]
  if (Array.isArray(borderRadius)) {
    ;[lt, rt, rb, lb] = borderRadius
  } else {
    ;[lt, rt, rb, lb] = [borderRadius, borderRadius, borderRadius, borderRadius]
  }

  const path = new Path2D()
  const PI = Math.PI
  path.moveTo(x + lt, y)
  path.lineTo(x + width - lt, y)
  path.arc(x + width - lt, y + lt, lt, PI * 1.5, 0, false)
  path.lineTo(x + width, y + height - lb)
  path.arc(x + width - lb, y + height - lb, lb, 0, PI * 0.5, false)
  path.lineTo(x + rt, y + height)
  path.arc(x + rt, y + height - rt, rt, PI * 0.5, PI, false)
  path.lineTo(x, y + rb)
  path.arc(x + rb, y + rb, rb, PI, PI * 1.5, false)

  ctx.lineWidth = borderWidth

  ctx.strokeStyle = borderColor
  ctx.stroke(path)
}

// 计算左侧边距
function _calculateLeft(maxTextLength: number, textLenth: number, textAlign: TextAlign) {
  let _left = 0

  if (textAlign === 'center') {
    _left += (maxTextLength - textLenth) / 2
  }
  if (textAlign === 'right') {
    _left += maxTextLength - textLenth
  }

  return _left
}
// 绘制行文本
function drawRowText(
  ctx: CanvasRenderingContext2D,
  text: string,
  left: number,
  top: number,
  fontSize: number,
  borderWidth: number,
  letterSpacing: number
) {
  let [_left, _top] = [left, top]

  for (const char of text) {
    ctx.fillText(char, _left, _top)
    if (borderWidth) {
      ctx.strokeText(char, _left, _top)
    }
    _left += fontSize * get_char_width(char) + letterSpacing
  }
}
/**
 * 绘制文字
 */
interface DrawTextOptions {
  ctx: CanvasRenderingContext2D
  text: string[]
  maxTextLength?: number
  fontStyle?: FontStyle
  top?: number
  left?: number
  rowGap?: number
}
function drawText(options: DrawTextOptions) {
  const { ctx, text, maxTextLength, fontStyle: _fontStyle = {}, top = 0, left = 0, rowGap = 0 } = options
  const {
    color = '#000',
    textAlign = 'left',
    style: fontStyle = 'normal',
    variant: fontVariant = 'normal',
    weight: fontWeight = 'normal',
    size: fontSize = 12,
    lineHeight = 1,
    family: fontFamily = '微软雅黑',
    borderColor = '#000',
    borderWidth = 0,
    letterSpacing = 0
  } = _fontStyle

  ctx.font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px/${lineHeight} ${fontFamily}`
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.strokeStyle = borderColor
  ctx.lineWidth = borderWidth

  let _maxTextLength = 0
  if (!!text.length) {
    const _maxText = deepCopy(text).reduce((prev, curr) => {
      const prevLength = get_string_width(prev)
      const currLength = get_string_width(curr)
      return prevLength > currLength ? prev : curr
    })
    const _maxTextWidth = get_string_width(_maxText)
    _maxTextLength = _maxTextWidth * fontSize + (_maxText.length - 1) * letterSpacing
  }
  if (maxTextLength) {
    _maxTextLength = maxTextLength
  }

  let [_left, _top] = [left, top]
  _top += fontSize / 2

  text.forEach((_text, idx) => {
    let _textLeft = _left
    const _textLenth = get_string_width(_text) * fontSize + (_text.length - 1) * letterSpacing
    _textLeft += _calculateLeft(_maxTextLength, _textLenth, textAlign)

    const _textTop = _top + fontSize * idx + rowGap * idx

    drawRowText(ctx, _text, _textLeft, _textTop, fontSize, borderWidth, letterSpacing)
  })
}

/**
 * 绘制 TextGraphics
 */
export interface TextGraphicsOptions {
  content?: string | string[]
  borderStyle?: BorderStyle
  backgroundStyle?: BackgroundStyle
  fontStyle?: FontStyle
  width?: number | 'auto'
  height?: number | 'auto'
}
export default async function TextGraphics(options: TextGraphicsOptions): Promise<HTMLCanvasElement> {
  const {
    content,
    borderStyle = {},
    backgroundStyle = {},
    fontStyle = {},
    width: canvasWidth = 'auto',
    height: canvasHeight = 'auto'
  } = options
  const { radius: borderRadius = 0, width: borderWidth = 0 } = borderStyle
  const { size: fontSize = 12, padding = 0, rowGap = 0, letterSpacing = 0 } = fontStyle

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
  if (typeof canvasWidth === 'number') {
    width = canvasWidth
  }
  if (typeof canvasHeight === 'number') {
    height = canvasHeight
  }
  let _text = content ? (Array.isArray(content) ? deepCopy(content) : [content]) : []
  _text = _text.filter(Boolean)
  if (!!_text.length && (canvasWidth === 'auto' || canvasHeight === 'auto')) {
    if (canvasWidth === 'auto') {
      const _maxText = deepCopy(_text).reduce((prev, curr) => {
        const prevLength = get_string_width(prev)
        const currLength = get_string_width(curr)
        return prevLength > currLength ? prev : curr
      })
      const _maxTextWidth = get_string_width(_maxText)
      width = _maxTextWidth * fontSize + (_left + _right) + (_maxText.length - 1) * letterSpacing
    }

    if (canvasHeight === 'auto') {
      const _rows = _text.length
      height = _rows * fontSize + (_top + _bottom) + (_rows - 1) * rowGap - (_rows % 2 === 0 ? 2 : 4)
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
      drawText({
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
