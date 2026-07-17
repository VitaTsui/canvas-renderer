import { deepCopy, get_string_size } from 'hsu-utils'
import loadImage from '../utils/loadImage'
import drawCtx from './drawCtx'
import drawBorder from './drawBorder'
import drawText from './drawText'

// Basic types
export type Padding = number | [number, number] | [number, number, number, number]
export type Size = number | 'auto' | 'bgImg'
export type Align = 'top' | 'center' | 'bottom'
export type Radius = number | [number, number, number, number]
export type Direction = 'vertical' | 'horizontal'
export type Fill = 'ctx' | 'img'

// Gradient type
export interface LinearGradient {
  [key: number]: string
}

// Text related types
export type TextAlign = 'left' | 'center' | 'right'

/** Text shadow style */
export interface TextShadowStyle {
  /** Shadow color */
  color?: string
  /** Shadow blur radius */
  blur?: number
  /** Shadow offset along the x axis */
  offsetX?: number
  /** Shadow offset along the y axis */
  offsetY?: number
}

/** Text stroke style */
export interface TextBorderStyle {
  /** Stroke color */
  color?: string
  /** Stroke line width */
  width?: number
}

/** Font configuration */
export interface Font {
  /** Font size, in px */
  size?: number
  /** Font style, e.g. normal / italic */
  style?: string
  /** Font weight, e.g. normal / bold */
  weight?: string
  /** Font family name, e.g. sans-serif / Arial */
  family?: string
}

/** Background style */
export interface BackgroundStyle {
  /** Background color, either a solid color or a linear gradient */
  color?: string | LinearGradient
  /** Gradient direction */
  colorDirection?: Direction
  /** Background image URL */
  image?: string
  /** Background image size, supports percentages and absolute values */
  imageSize?: [string, string] | string
  /** Background image position, supports [x, y] or a single value */
  imagePosition?: [number, number] | number
  /** Background image fill mode: fill the canvas or use the image's original size */
  imageFill?: Fill
}

/** Border style */
export interface BorderStyle {
  /** Border color */
  color?: string
  /** Border line width */
  width?: number
  /** Border corner radius */
  radius?: Radius
}

/** Text font style */
export interface FontStyle {
  /** Font configuration */
  font?: Font
  /** Text color, either a solid color or a linear gradient */
  color?: string | LinearGradient
  /** Text alignment (relative to the available width) */
  textAlign?: TextAlign
  /** Letter spacing */
  letterSpacing?: number
  /** Text stroke style */
  border?: TextBorderStyle
  /** Text shadow; pass a single value or an array for multiple shadows */
  shadow?: TextShadowStyle | TextShadowStyle[]
}

/**
 * Main options of `TextGraphics`
 */
export interface TextGraphicsOptions {
  /** Text content, a single line or an array of lines */
  content?: string | string[]
  /** Border style */
  borderStyle?: BorderStyle
  /** Background style */
  backgroundStyle?: BackgroundStyle
  /** Text font and color style */
  fontStyle?: FontStyle
  /** Padding between the text and the border/background (border included) */
  padding?: Padding
  /** Canvas size: a number for a fixed value, `auto` to compute from the text, `bgImg` to follow the background image size */
  size?: Size | [Size, Size]
  /** Vertical alignment of the text within a fixed height */
  align?: Align
  /** Row gap between lines */
  rowGap?: number
}

/**
 * Render text to a canvas, supporting multi-line text, border, background (solid color / gradient / image), font styles, text stroke and shadow
 * @param options Text rendering options, see TextGraphicsOptions
 * @returns The rendered `HTMLCanvasElement`
 */
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
