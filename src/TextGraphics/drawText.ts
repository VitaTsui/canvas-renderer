import { deepCopy, get_string_size } from 'hsu-utils'
import loadFont from '../utils/loadFont'
import type { FontStyle, TextAlign, LinearGradient, Font } from './index'

/**
 * Calculate the starting x offset of the current line based on the maximum line width and the alignment
 *
 * @param maxTextLength Maximum available text width
 * @param textLenth Actual width of the current line
 * @param textAlign Text alignment
 */
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

/**
 * Single-line text drawing options
 */
interface DrawRowText {
  /** 2D rendering context */
  ctx: CanvasRenderingContext2D
  /** Text content to draw (single line) */
  text: string
  /** Starting x coordinate of the text */
  left: number
  /** y coordinate of the text baseline */
  top: number
  /** Font size, in px */
  size: number
  /** Stroke line width */
  borderWidth: number
  /** Letter spacing */
  letterSpacing: number
  /** Text color, either a solid color or a linear gradient */
  color: string | LinearGradient
  /** Font configuration */
  font: Font
}
function drawRowText(options: DrawRowText) {
  const { ctx, text, left, top, size, borderWidth, letterSpacing, color, font } = options

  let [_left, _top] = [left, top]

  for (const char of text) {
    if (typeof color === 'string') {
      ctx.fillStyle = color
    } else {
      const gradient = ctx.createLinearGradient(_left, _top - size / 2, _left, _top + size / 2)
      Object.keys(color).forEach((key) => {
        const _color = color[+key]
        gradient.addColorStop(+key, _color)
      })
      ctx.fillStyle = gradient
    }

    ctx.fillText(char, _left, _top)
    if (borderWidth) {
      ctx.strokeText(char, _left, _top)
    }
    _left += get_string_size(char, font).width + letterSpacing
  }
}

/**
 * Multi-line text drawing options
 */
interface DrawTextOptions {
  /** 2D rendering context */
  ctx: CanvasRenderingContext2D
  /** Text content (array of lines, one element per line) */
  text: string[]
  /** Maximum available width per line, affects alignment and truncation */
  maxTextLength?: number
  /** Text style configuration (color, font, stroke, shadow, etc.) */
  fontStyle?: FontStyle
  /** Offset of the whole text from the top of the canvas */
  top?: number
  /** Offset of the whole text from the left of the canvas */
  left?: number
  /** Row gap between lines */
  rowGap?: number
}

/**
 * Draw multi-line text on the given canvas context, including:
 * - Text alignment (left / center / right)
 * - Letter spacing and row gap
 * - Effects such as gradient text, stroke and shadow
 *
 * @param options Text drawing options
 */
export default async function drawText(options: DrawTextOptions) {
  const { ctx, text, maxTextLength, fontStyle = {}, top = 0, left = 0, rowGap = 0 } = options
  const { color = '#000', textAlign = 'center', font = {}, border = {}, shadow, letterSpacing = 0 } = fontStyle
  const { color: borderColor = '#000', width: borderWidth = 0 } = border
  const { style = 'normal', weight = 'normal', size = 10, family: fontFamily = 'sans-serif' } = font

  await loadFont({ ctx, font, text: text[0] || '' })

  ctx.font = `${style} ${weight} ${size}px ${fontFamily}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.strokeStyle = borderColor
  ctx.lineWidth = borderWidth

  let _maxTextLength = 0
  if (!!text.length) {
    const _maxText = deepCopy(text).reduce((prev, curr) => {
      const prevLength = get_string_size(prev, font).width
      const currLength = get_string_size(curr, font).width
      return prevLength > currLength ? prev : curr
    })
    const _maxTextWidth = get_string_size(_maxText, font).width
    _maxTextLength = _maxTextWidth + (_maxText.length - 1) * letterSpacing
  }
  if (maxTextLength) {
    _maxTextLength = maxTextLength
  }

  let [_left, _top] = [left, top]
  _top += size / 2

  text.forEach((_text, idx) => {
    let _textLeft = _left
    const _textLenth = get_string_size(_text, font).width + (_text.length - 1) * letterSpacing
    _textLeft += _calculateLeft(_maxTextLength, _textLenth, textAlign)

    const _textTop = _top + size * idx + rowGap * idx

    drawRowText({
      ctx,
      text: _text,
      left: _textLeft,
      top: _textTop,
      size,
      borderWidth,
      letterSpacing,
      color,
      font
    })
  })

  if (shadow) {
    const _shadow = Array.isArray(shadow) ? shadow : [shadow]

    _shadow.forEach((shadow) => {
      const {
        color: shadowColor = '#000',
        blur: shadowBlur = 0,
        offsetX: shadowOffsetX = 0,
        offsetY: shadowOffsetY = 0
      } = shadow
      ctx.shadowColor = shadowColor
      ctx.shadowBlur = shadowBlur
      ctx.shadowOffsetX = shadowOffsetX
      ctx.shadowOffsetY = shadowOffsetY

      text.forEach((_text, idx) => {
        let _textLeft = _left
        const _textLenth = get_string_size(_text, font).width + (_text.length - 1) * letterSpacing
        _textLeft += _calculateLeft(_maxTextLength, _textLenth, textAlign)

        const _textTop = _top + size * idx + rowGap * idx

        drawRowText({
          ctx,
          text: _text,
          left: _textLeft,
          top: _textTop,
          size,
          borderWidth,
          letterSpacing,
          color,
          font
        })
      })
    })
  }
}
