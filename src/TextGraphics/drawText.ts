import { deepCopy, get_string_size } from 'hsu-utils'

type TextAlign = 'left' | 'center' | 'right'

interface LinearGradient {
  [key: number]: string
}

interface TextShadowStyle {
  color?: string
  blur?: number
  offsetX?: number
  offsetY?: number
}

interface TextBorderStyle {
  color?: string
  width?: number
}

interface Font {
  size?: number
  style?: string
  variant?: string
  weight?: string
  family?: string
}

export interface FontStyle {
  font?: Font
  color?: string | LinearGradient
  textAlign?: TextAlign
  letterSpacing?: number
  border?: TextBorderStyle
  shadow?: TextShadowStyle | TextShadowStyle[]
}

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

interface DrawRowText {
  ctx: CanvasRenderingContext2D
  text: string
  left: number
  top: number
  size: number
  borderWidth: number
  letterSpacing: number
  color: string | LinearGradient
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

interface DrawTextOptions {
  ctx: CanvasRenderingContext2D
  text: string[]
  maxTextLength?: number
  fontStyle?: FontStyle
  top?: number
  left?: number
  rowGap?: number
}
export default async function drawText(options: DrawTextOptions) {
  const { ctx, text, maxTextLength, fontStyle = {}, top = 0, left = 0, rowGap = 0 } = options
  const { color = '#000', textAlign = 'center', font = {}, border = {}, shadow, letterSpacing = 0 } = fontStyle
  const { color: borderColor = '#000', width: borderWidth = 0 } = border
  const { style = 'normal', variant = 'normal', weight = 'normal', size = 10, family: fontFamily = 'sans-serif' } = font

  await document.fonts.load(`${style} ${variant} ${weight} ${size}px ${fontFamily}`)

  ctx.font = `${style} ${variant} ${weight} ${size}px ${fontFamily}`
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
