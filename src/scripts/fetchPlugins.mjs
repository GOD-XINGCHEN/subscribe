/**
 * @author: leroy
 * @date: 2024-04-17 09:30
 * @description：fetchPlugins
 */

import axios from 'axios';
import plugins from '../utils/plugins.json' assert { type: 'json' };
import products from '../utils/products.json' assert { type: 'json' };
import fs from 'fs-extra';
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
// 获取 __filename 的 ESM 写法
const __filename = fileURLToPath(import.meta.url)
// 获取 __dirname 的 ESM 写法
const __dirname = dirname(fileURLToPath(import.meta.url))

const pluginBaseUrl = 'https://plugins.jetbrains.com';
const pluginMap = new Map(plugins.map((plugin) => [plugin.id, plugin.code]));
const [paid, freemium] = await Promise.all(
  ['PAID', 'FREEMIUM'].map(async (type) => {
    const res = await axios.get(`${pluginBaseUrl}/api/searchPlugins`, {
      params: { pricingModels: type, max: 1000, offset: 0 },
    });

    return res.data.plugins.filter(ele => products.findIndex(product => product.id === ele.id) < 0).map((plugin) => ({
      id: plugin.id,
      name: plugin.name,
      link: `${pluginBaseUrl}${plugin.link}`,
      icon: plugin.icon ? `${pluginBaseUrl}${plugin.icon}` : '',
      code: '',
    }));
  }),
);
const list = [...paid, ...freemium];
const pluginList = [];
for (const product of list) {
  const code =
    pluginMap.get(product.id) ||
    (await axios.get(`${pluginBaseUrl}/api/plugins/${product.id}`)).data.purchaseInfo.productCode;
  pluginList.push({ ...product, code });
}

fs.writeJson(resolve(__dirname,'../utils/plugins.json'), pluginList.sort((a, b) => a.id - b.id), { spaces: 2 });
