interface Font {
  style?: string
  weight?: string
  size?: number
  fontFamily?: string
}

export interface LoadFontOptions {
  ctx?: CanvasRenderingContext2D
  font?: Font
  text?: string
}

export default async function loadFont(options: LoadFontOptions) {
  const { ctx, font = {}, text } = options
  const { style = 'normal', weight = 'normal', size = 10, fontFamily = 'sans-serif' } = font

  await document.fonts.load(`${style} ${weight} ${size}px ${fontFamily}`)

  const _ctx = ctx || (document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D)

  _ctx.font = `${style} ${weight} ${size}px ${fontFamily}`
  _ctx.fillText(text || '', -999, -999)

  await new Promise(requestAnimationFrame)
}
