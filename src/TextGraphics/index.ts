import { deepCopy, get_string_size } from 'hsu-utils'
import loadImage from '../utils/loadImage'
import drawCtx from './drawCtx'
import drawBorder from './drawBorder'
import drawText from './drawText'

// 基础类型
export type Padding = number | [number, number] | [number, number, number, number]
export type Size = number | 'auto' | 'bgImg'
export type Align = 'top' | 'center' | 'bottom'
export type Radius = number | [number, number, number, number]
export type Direction = 'vertical' | 'horizontal'
export type Fill = 'ctx' | 'img'

// 渐变类型
export interface LinearGradient {
  [key: number]: string
}

// 文本相关类型
export type TextAlign = 'left' | 'center' | 'right'

/** 文本阴影样式 */
export interface TextShadowStyle {
  /** 阴影颜色 */
  color?: string
  /** 阴影模糊半径 */
  blur?: number
  /** 阴影 x 方向偏移 */
  offsetX?: number
  /** 阴影 y 方向偏移 */
  offsetY?: number
}

/** 描边样式 */
export interface TextBorderStyle {
  /** 描边颜色 */
  color?: string
  /** 描边线宽 */
  width?: number
}

/** 字体配置 */
export interface Font {
  /** 字号，单位 px */
  size?: number
  /** 字体样式，例如 normal / italic */
  style?: string
  /** 字重，例如 normal / bold */
  weight?: string
  /** 字体族名称，例如 sans-serif / Arial */
  family?: string
}

/** 背景样式 */
export interface BackgroundStyle {
  /** 背景颜色，可以是纯色或线性渐变 */
  color?: string | LinearGradient
  /** 渐变方向 */
  colorDirection?: Direction
  /** 背景图片地址 */
  image?: string
  /** 背景图片尺寸，支持百分比和绝对值 */
  imageSize?: [string, string] | string
  /** 背景图片位置，支持 [x, y] 或 单值 */
  imagePosition?: [number, number] | number
  /** 背景图片填充方式：填满画布或按图片原尺寸 */
  imageFill?: Fill
}

/** 边框样式 */
export interface BorderStyle {
  /** 边框颜色 */
  color?: string
  /** 边框线宽 */
  width?: number
  /** 边框圆角 */
  radius?: Radius
}

/** 文本字体样式 */
export interface FontStyle {
  /** 字体配置 */
  font?: Font
  /** 文本颜色，可以是纯色或线性渐变 */
  color?: string | LinearGradient
  /** 文本对齐方式（相对于可用宽度） */
  textAlign?: TextAlign
  /** 字符间距 */
  letterSpacing?: number
  /** 文本描边样式 */
  border?: TextBorderStyle
  /** 文本阴影，可传单个或数组以实现多重阴影 */
  shadow?: TextShadowStyle | TextShadowStyle[]
}

/**
 * `TextGraphics` 主配置
 */
export interface TextGraphicsOptions {
  /** 文本内容，单行或多行数组 */
  content?: string | string[]
  /** 边框样式 */
  borderStyle?: BorderStyle
  /** 背景样式 */
  backgroundStyle?: BackgroundStyle
  /** 文本字体及颜色样式 */
  fontStyle?: FontStyle
  /** 文本与边框/背景之间的内边距（含边框） */
  padding?: Padding
  /** 画布尺寸：数字为固定值，`auto` 为根据文本计算，`bgImg` 为跟随背景图尺寸 */
  size?: Size | [Size, Size]
  /** 文本在固定高度中的垂直对齐方式 */
  align?: Align
  /** 行间距 */
  rowGap?: number
}

/**
 * 根据文本、背景、边框等配置生成文字画布
 *
 * @param options 文本图形配置
 * @returns 已绘制完成内容的 `HTMLCanvasElement`
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
