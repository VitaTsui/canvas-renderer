import TextGraphics from './TextGraphics'
import ImageGraphics from './ImageGraphics'
export { TextGraphics, ImageGraphics }

import loadImage from './utils/loadImage'
export { loadImage }

import loadFont from './utils/loadFont'
export { loadFont }

// 导出 TextGraphics 相关类型
export type {
  TextGraphicsOptions,
  Padding as TextPadding,
  Size,
  Align,
  Radius,
  Direction as TextDirection,
  Fill,
  LinearGradient,
  TextAlign,
  TextShadowStyle,
  TextBorderStyle,
  Font,
  BackgroundStyle,
  BorderStyle,
  FontStyle
} from './TextGraphics'

// 导出 ImageGraphics 相关类型
export type {
  ImageGraphicsOptions,
  ImgAlign,
  ImageItem,
  Padding as ImagePadding,
  Direction as ImageDirection
} from './ImageGraphics'
