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
 * Preload the given font, ensuring later text drawing does not flicker or fall back to a wrong style
 * @param options.ctx Canvas context used for warm-up; an internal offscreen canvas is used if not provided
 * @param options.font Font configuration (style / weight / size / family)
 * @param options.text Warm-up text
 */
export default async function loadFont(options: LoadFontOptions) {
  const { ctx, font = {}, text } = options
  const { style = 'normal', weight = 'normal', size = 10, family = 'sans-serif' } = font

  await document.fonts.load(`${style} ${weight} ${size}px ${family}`)

  const _ctx = ctx || (document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D)

  // Draw the text once outside the visible area to warm up the font, forcing the browser to actually load and apply it (not debug code)
  _ctx.font = `${style} ${weight} ${size}px ${family}`
  _ctx.fillText(text || '', -999, -999)

  // Wait one frame to ensure the font has taken effect before returning
  await new Promise(requestAnimationFrame)
}
