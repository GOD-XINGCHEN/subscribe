import { defineConfig } from 'umi';

export default defineConfig({
  esbuildMinifyIIFE: true,
  title: '订阅转换',
  routes: [{ path: '/', component: 'index' },{ path: '/jetbra', component: 'jetbra' }],
  favicons: ['https://cdn.leroytop.com/images/icon.ico'],
  hash: true,
  codeSplitting: {jsStrategy: 'depPerChunk'},
  headScripts: [
    // 解决首次加载时白屏的问题
    { src: `/static/scripts/loading.js`, async: true },
  ],
  metas: [
    { name: 'robots', content: 'noindex,nofollow' },
    {name: 'referrer', content: 'never'},
  ],
});
