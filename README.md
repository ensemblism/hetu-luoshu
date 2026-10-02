<a id="english"></a>

# Hetu × Luoshu

An interactive 3D study of the River Map and Luo Writing: numbers, directions, yin–yang and five-phase relations, with traceable sources.

[Open the work](https://ensemblism.github.io/hetu-luoshu/?lang=en) · [中文说明](#中文说明)

## Use

Switch between Hetu, Luoshu and their comparison. Drag to orbit, scroll to zoom, select a number to explore. In **Five phases**, begin with associations, then step through generating or controlling relations. Hover, focus or tap ※ for sources. Sound is optional.

## Develop

Node 24. No runtime server or external API.

```sh
npm ci
npm run dev
```

`npm run check` checks types and data; `npm run test:e2e` checks browser behavior; `npm run build` produces `dist/`.

## Deploy & sources

Pushes to `main` deploy through GitHub Actions to Pages. Default base: `/hetu-luoshu/`; the workflow handles custom domains. [Development notes](docs/development.md).

The diagrams follow *Yixue Qimeng*. Spatial layers and the original synthesized soundscape are contemporary interpretations. [Sources](docs/content-model.md) · [Visual conventions](docs/visual-direction.md).

---

# 中文说明

以三维交互阅读河图与洛书：点数、方位、阴阳与五行关系，随文可查真实出处。

[在线体验](https://ensemblism.github.io/hetu-luoshu/?lang=zh-CN) · [English](#english)

## 使用

切换河图、洛书与对照；拖动旋转，滚动缩放，点击数字探索。**五行**先认配属，再逐步观察相生、相克。悬停、聚焦或轻触 ※ 查看出处；声音按需开启。

## 开发

Node 24。运行时无需服务端或外部 API。

```sh
npm ci
npm run dev
```

`npm run check` 检查类型与数据；`npm run test:e2e` 检查浏览器行为；`npm run build` 输出 `dist/`。

## 部署与来源

推送至 `main` 后，GitHub Actions 自动部署至 Pages。默认子路径 `/hetu-luoshu/`，工作流兼容自定义域名。[开发说明](docs/development.md)。

图式采用《易学启蒙》所论十数河图、九数洛书；空间分层与原创合成音景为当代表达。[文献来源](docs/content-model.md) · [视觉约定](docs/visual-direction.md)。
