/**
 * 字体配置
 */
interface Font {
  /** 字体样式，例如 normal / italic */
  style?: string
  /** 字重，例如 normal / bold / 100~900 */
  weight?: string
  /** 字号，单位 px */
  size?: number
  /** 字体族名称，例如 sans-serif / Arial */
  family?: string
}

/**
 * 加载字体的配置项
 */
export interface LoadFontOptions {
  /** 要设置字体并进行预渲染的 2D 上下文，不传则内部创建临时 canvas */
  ctx?: CanvasRenderingContext2D
  /** 字体配置，不传则使用默认字体 */
  font?: Font
  /** 用于触发字体渲染的一段文字，通常可以传入实际要渲染的文本 */
  text?: string
}

/**
 * 预加载指定字体，确保后续绘制文字时不会出现闪烁或样式错误
 */
export default async function loadFont(options: LoadFontOptions) {
  const { ctx, font = {}, text } = options
  const { style = 'normal', weight = 'normal', size = 10, family = 'sans-serif' } = font

  await document.fonts.load(`${style} ${weight} ${size}px ${family}`)

  const _ctx = ctx || (document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D)

  _ctx.font = `${style} ${weight} ${size}px ${family}`
  _ctx.fillText(text || '', -999, -999)

  await new Promise(requestAnimationFrame)
}
