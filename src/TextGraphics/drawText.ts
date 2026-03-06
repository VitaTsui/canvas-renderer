import { deepCopy, get_string_size } from 'hsu-utils'
import loadFont from '../utils/loadFont'
import type { FontStyle, TextAlign, LinearGradient, Font } from './index'

/**
 * 根据最大行宽与对齐方式，计算当前行文本的起始 x 坐标偏移
 *
 * @param maxTextLength 可用的最大文本宽度
 * @param textLenth 当前行文本实际宽度
 * @param textAlign 文本对齐方式
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
 * 单行文本绘制配置
 */
interface DrawRowText {
  /** 2D 绘制上下文 */
  ctx: CanvasRenderingContext2D
  /** 要绘制的文本内容（单行） */
  text: string
  /** 文本起始 x 坐标 */
  left: number
  /** 文本基线位置 y 坐标 */
  top: number
  /** 字号，单位 px */
  size: number
  /** 描边线宽 */
  borderWidth: number
  /** 字符间距 */
  letterSpacing: number
  /** 文本颜色，可以是纯色或线性渐变 */
  color: string | LinearGradient
  /** 字体配置 */
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
 * 多行文本绘制配置
 */
interface DrawTextOptions {
  /** 2D 绘制上下文 */
  ctx: CanvasRenderingContext2D
  /** 文本内容（多行数组，每个元素为一行） */
  text: string[]
  /** 单行可用的最大宽度，影响对齐与截断 */
  maxTextLength?: number
  /** 文本样式配置（颜色、字体、描边、阴影等） */
  fontStyle?: FontStyle
  /** 文本整体相对画布顶部的偏移量 */
  top?: number
  /** 文本整体相对画布左侧的偏移量 */
  left?: number
  /** 行间距 */
  rowGap?: number
}

/**
 * 在给定画布上下文中绘制多行文本，包括：
 * - 文本对齐（left / center / right）
 * - 字间距、行间距
 * - 渐变文字、描边、阴影等效果
 *
 * @param options 文本绘制参数
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
