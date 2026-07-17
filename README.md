# @hsu-canvas/renderer

[![npm version](https://img.shields.io/npm/v/@hsu-canvas/renderer.svg)](https://www.npmjs.com/package/@hsu-canvas/renderer)
[![license](https://img.shields.io/npm/l/@hsu-canvas/renderer.svg)](./LICENSE)

Canvas 渲染工具集：把富样式文本（边框 / 背景 / 渐变 / 阴影）与多张图片渲染成 `HTMLCanvasElement`，并提供图片与字体的异步加载工具。

## 安装

```bash
npm install @hsu-canvas/renderer
# 或
yarn add @hsu-canvas/renderer
```

## 使用

```ts
import { TextGraphics, ImageGraphics, loadImage, loadFont } from "@hsu-canvas/renderer";

// 文本渲染：返回 Promise<HTMLCanvasElement>
const textCanvas = await TextGraphics({
  content: ["第一行", "第二行"],
  fontStyle: { font: { size: 16 }, color: "#333" },
  backgroundStyle: { color: "#fff" },
  padding: 8,
  rowGap: 4,
});

// 图片合成：返回 Promise<HTMLCanvasElement>
const imageCanvas = await ImageGraphics({
  imgs: ["https://example.com/a.png", { url: "https://example.com/b.png", zIndex: 1 }],
  direction: "horizontal",
  gap: 8,
});

document.body.append(textCanvas, imageCanvas);
```

## API

- [**TextGraphics**](#textgraphics) 文本渲染
- [**ImageGraphics**](#imagegraphics) 图片渲染
- [**loadImage**](#loadimage) 异步加载图片并缓存
- [**loadFont**](#loadfont) 预加载字体，避免首次渲染闪烁

## TextGraphics

`(options: TextGraphicsOptions) => Promise<HTMLCanvasElement>`

### TextGraphicsOptions

| 参数            | 说明        | 类型                                | 默认值           | 备注                                             |
| --------------- | ----------- | ----------------------------------- | ---------------- | ------------------------------------------------ |
| content         | 渲染文本    | string \| string[]                  | -                | -                                                |
| borderStyle     | 边框样式    | [BorderStyle](#borderstyle)         | -                | -                                                |
| backgroundStyle | 背景样式    | [BackgroundStyle](#backgroundstyle) | -                | -                                                |
| fontStyle       | 字体样式    | [FontStyle](#fontstyle)             | -                | -                                                |
| padding         | 内距        | [Padding](#padding)                 | 0                | -                                                |
| size            | canvas 大小 | [Size](#size) \| [Size, Size]       | ['auto', 'auto'] | bgImg 只在 backgroundStyle 中设置了 image 时生效 |
| align           | 对齐方式    | [Align](#align)                     | center           | -                                                |
| rowGap          | 文本间隔    | number                              | 0                | -                                                |

### BorderStyle

| 参数   | 说明     | 类型              | 默认值 | 备注 |
| ------ | -------- | ----------------- | ------ | ---- |
| color  | 边框颜色 | string            | -      | -    |
| width  | 边框宽度 | number            | 0      | -    |
| radius | 边框圆角 | [Radius](#radius) | 0      | -    |

### BackgroundStyle

| 参数           | 说明         | 类型                                        | 默认值     | 备注                |
| -------------- | ------------ | ------------------------------------------- | ---------- | ------------------- |
| color          | 背景颜色     | string \| [LinearGradient](#lineargradient) | -          | 与 image 互斥       |
| colorDirection | 背景颜色方向 | [Direction](#direction)                     | horizontal | -                   |
| image          | 背景图片     | string                                      | -          | 与 color 互斥       |
| imageSize      | 背景图片大小 | [string, string] \| string                  | -          | 百分比或数字        |
| imagePosition  | 背景图片位置 | [number, number] \| number                  | -          | -                   |
| imageFill      | 背景填充     | [Fill](#fill)                               | ctx        | 会被 imageSize 覆盖 |

### FontStyle

| 参数          | 说明     | 类型                                                     | 默认值 | 备注 |
| ------------- | -------- | -------------------------------------------------------- | ------ | ---- |
| font          | 字体     | [Font](#font)                                            | -      | -    |
| color         | 颜色     | string \| [LinearGradient](#lineargradient)              | #000   | -    |
| textAlign     | 文字对齐 | [TextAlign](#textalign)                                  | center | -    |
| letterSpacing | 文字间隔 | number                                                   | 0      | -    |
| border        | 文字边框 | [TextBorderStyle](#textborderstyle)                      | -      | -    |
| shadow        | 文字阴影 | [TextShadowStyle](#textshadowstyle) \| TextShadowStyle[] | -      | -    |

### Padding

> type Padding = number | [number, number] | [number, number, number, number]

### Size

> type Size = number | 'auto' | 'bgImg'

### Align

> type Align = 'top' | 'center' | 'bottom'

### Radius

> type Radius = number | [number, number, number, number]

### LinearGradient

```ts
interface LinearGradient {
  [key: number]: string
}
```

> **key** 的范围为 0 - 1

### Direction

> type Direction = 'vertical' | 'horizontal'

### Fill

> type Fill = 'ctx' | 'img'

| 类型 | 说明                   |
| ---- | ---------------------- |
| ctx  | 图片大小为 canvas 大小 |
| img  | 图片大小为图片自身大小 |

### Font

| 参数   | 说明     | 类型   | 默认值     | 备注 |
| ------ | -------- | ------ | ---------- | ---- |
| size   | 字体大小 | number | 10         | -    |
| style  | 字体样式 | string | normal     | -    |
| weight | 字体粗细 | string | normal     | -    |
| family | 字体系列 | string | sans-serif | -    |

### TextAlign

> type TextAlign = 'left' | 'center' | 'right'

### TextBorderStyle

| 参数  | 说明     | 类型   | 默认值 | 备注 |
| ----- | -------- | ------ | ------ | ---- |
| color | 边框颜色 | string | #000   | -    |
| width | 边框宽度 | number | 0      | -    |

### TextShadowStyle

| 参数    | 说明             | 类型   | 默认值 | 备注 |
| ------- | ---------------- | ------ | ------ | ---- |
| color   | 阴影颜色         | string | #000   | -    |
| blur    | 阴影模糊度       | number | 0      | -    |
| offsetX | 阴影水平偏移距离 | number | 0      | -    |
| offsetY | 阴影垂直偏移距离 | number | 0      | -    |

## ImageGraphics

`(options: ImageGraphicsOptions) => Promise<HTMLCanvasElement>`

### ImageGraphicsOptions

| 参数 | 说明 | 类型 | 默认值 | 备注 |
| --- | --- | --- | --- | --- |
| imgs | 图片 | string \| [ImageItem](#imageitem) \| Array<string \| ImageItem> | - | 必填 |
| padding | 内边距 | [Padding](#paddingimage) | 0 | - |
| direction | 布局样式 | [Direction](#directionimage) | vertical | - |
| gap | 间隔 | number | 0 | - |
| imgAlign | 对齐方式 | [ImgAlign](#imgalign) | center | - |
| width | canvas 宽度 | number \| 'auto' | auto | auto 时：vertical 为「图片最大宽度 + padding + 垂直排列额外 gap」，horizontal 为「所有图片宽度之和 + padding + 水平排列额外 gap」 |
| height | canvas 高度 | number \| 'auto' | auto | auto 时：horizontal 为「图片最大高度 + padding + 水平排列额外 gap」，vertical 为「所有图片高度之和 + padding + 垂直排列额外 gap」 |

### ImageItem

| 参数   | 说明     | 类型   | 默认值   | 备注 |
| ------ | -------- | ------ | -------- | ---- |
| url    | 图片地址 | string | -        | 必填 |
| width  | 宽度     | number | 图片宽度 | -    |
| height | 高度     | number | 图片高度 | -    |
| zIndex | 图片层级 | number | 0        | -    |

### Padding(Image)

> type Padding = number | [number, number] | [number, number, number, number]

### Direction(Image)

> type Direction = 'vertical' | 'horizontal'

### ImgAlign

> type ImgAlign = 'start' | 'center' | 'end'

## loadImage

`(url: string) => Promise<HTMLImageElement>`

异步加载图片；同一 url 的结果会被缓存，重复加载直接复用。

| 参数 | 说明     | 类型   | 默认值 | 备注 |
| ---- | -------- | ------ | ------ | ---- |
| url  | 图片地址 | string | -      | 必填 |

## loadFont

`(options: LoadFontOptions) => Promise<void>`

在绘制文字前预加载字体（`document.fonts.load` + 离屏预热），避免首次渲染时出现闪烁或回退字体。

| 参数 | 说明          | 类型                     | 默认值 | 备注 |
| ---- | ------------- | ------------------------ | ------ | ---- |
| ctx  | Canvas 上下文 | CanvasRenderingContext2D | -      | 不传则使用内部离屏 canvas |
| font | 字体配置      | [Font](#font)            | -      | 结构与 [TextGraphics](#font) 的 `Font` 一致 |
| text | 预热文本      | string                   | -      | 通常传入实际要渲染的文本 |

## 开发

```bash
yarn          # 安装依赖
yarn build    # 构建 es/ + lib/ + dist/
```

## 贡献

日常开发在 `develop` 分支进行（feature 分支合入 `develop`），`main` 只接受来自 `develop` 的 PR；合入 `main` 后按 `package.json` 版本自动打 tag 并发布 npm。PR 标题遵循 [Conventional Commits](https://www.conventionalcommits.org/)。

## License

[MIT](./LICENSE) © VitaHsu
