import { defineConfig } from 'umi';

export default defineConfig({
  title: '订阅转换',
  routes: [{ path: '/', component: 'index' }],
  favicons: ['https://cdn.leroytop.com/images/icon.ico'],
  hash: true,
  codeSplitting: {jsStrategy: 'depPerChunk'}
});
