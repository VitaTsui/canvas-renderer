import type { Radius } from './index'

/**
 * 边框样式配置
 */
export interface BorderStyle {
  /** 边框颜色 */
  color?: string
  /** 边框线宽 */
  width?: number
  /** 边框圆角，支持单值或 [lt, rt, rb, lb] */
  radius?: Radius
}

/**
 * 边框绘制配置
 */
export interface DrawBorderOptions {
  /** 用于绘制边框的 2D 上下文 */
  ctx: CanvasRenderingContext2D
  /** 绘制区域宽度 */
  width: number
  /** 绘制区域高度 */
  height: number
  /** 边框样式 */
  borderStyle?: BorderStyle
}

/**
 * 根据配置在画布上绘制矩形圆角边框
 *
 * @param options 边框绘制参数
 */
export default function drawBorder(options: DrawBorderOptions) {
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
