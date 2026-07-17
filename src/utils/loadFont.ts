/**
 * Font configuration
 */
interface Font {
  /** Font style, e.g. normal / italic */
  style?: string
  /** Font weight, e.g. normal / bold / 100~900 */
  weight?: string
  /** Font size, in px */
  size?: number
  /** Font family name, e.g. sans-serif / Arial */
  family?: string
}

/**
 * Options for loading a font
 */
export interface LoadFontOptions {
  /** 2D context to set the font on and pre-render with; a temporary canvas is created internally if omitted */
  ctx?: CanvasRenderingContext2D
  /** Font configuration; the default font is used if omitted */
  font?: Font
  /** A piece of text used to trigger font rendering, usually the actual text to be rendered */
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
