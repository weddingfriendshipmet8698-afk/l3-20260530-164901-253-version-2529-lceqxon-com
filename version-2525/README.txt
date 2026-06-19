静态电影网站生成说明

生成结果：
- 影片详情页：2000 个
- 独立分类页：267 个
- 全部影片分页：84 个
- 可复用 HLS 播放源：20 个，详情页按影片顺序循环绑定

使用方式：
1. 解压 ZIP 后可直接打开 index.html 浏览。
2. 如需让封面与 Hero 图片正常显示，请将 1.jpg 到 150.jpg 放在网站顶级目录，与 index.html 同级。
3. 详情页播放器使用 m3u8 地址与 HLS 初始化逻辑；在线访问时浏览器可通过 hls.js 或原生 HLS 播放。
4. 每个 HTML 页面都已插入百度统计脚本，代码不作为页面文字显示。

主要入口：
- index.html
- categories.html
- rankings.html
- search.html
- archive/page-1.html
