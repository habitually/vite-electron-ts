import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'
import { resolve } from 'path'
import type { ConfigEnv, ProxyOptions, UserConfig } from 'vite'
import { svgBuilder } from '/@/components/icon/svg/index'
import { isProd, loadEnv } from '/@/utils/vite'

import * as path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import electron from 'vite-plugin-electron'
import polyfillExports from 'vite-plugin-electron/polyfill-exports'
import electronRenderer from 'vite-plugin-electron/renderer'

const pathResolve = (dir: string): any => {
    return resolve(__dirname, '.', dir)
}

// https://vitejs.dev/config/
const viteConfig = ({ mode, command }: ConfigEnv): UserConfig => {
    console.log('🚀 ~ file: vite.config.ts ~ line 20 ~ viteConfig ~ command', command)
    const prodMock = true
    const { VITE_PORT, VITE_OPEN, VITE_BASE_PATH, VITE_OUT_DIR, VITE_PROXY_URL } = loadEnv(mode)

    const alias: Record<string, string> = {
        '/@': pathResolve('./src/'),
        assets: pathResolve('./src/assets'),
        'vue-i18n': isProd(mode) ? 'vue-i18n/dist/vue-i18n.cjs.prod.js' : 'vue-i18n/dist/vue-i18n.cjs.js',
    }

    let proxy: Record<string, string | ProxyOptions> = {}
    if (VITE_PROXY_URL) {
        proxy = {
            '/index.php': {
                target: VITE_PROXY_URL,
                changeOrigin: true,
            },
        }
    }
    return {
        server: {
            host: '0.0.0.0',
            port: 5000,
            proxy: proxy,
        },
        resolve: { alias },
        plugins: [
            vue(),
            electron({
                main: {
                    entry: 'electron-main/index.ts',
                },
                preload: {
                    input: path.join(__dirname, './electron-preload/index.ts'),
                },
            }),
            electronRenderer(),
            polyfillExports(),
            AutoImport({
                include: [
                    /\.vue$/,
                    /\.vue\?vue/, // .vue
                    /\.md$/, // .md
                ],
                vueTemplate: false,
                dts: false,
                imports: ['vue', 'vue-router'],
            }),
            svgBuilder('./src/assets/icons/'),
            viteMockServe({
                mockPath: 'mock',
                localEnabled: command === 'serve',
                prodEnabled: command !== 'serve' && prodMock,
                injectCode: `
                  import { setupProdMockServer } from './mockProdServer';
                  setupProdMockServer();
                `,
                logger: true,
            }),
        ],
        build: {
            emptyOutDir: false,
        },
        css: {
            postcss: {
                plugins: [
                    {
                        postcssPlugin: 'internal:charset-removal',
                        AtRule: {
                            charset: (atRule) => {
                                if (atRule.name === 'charset') {
                                    atRule.remove()
                                }
                            },
                        },
                    },
                ],
            },
        },
    }
}

export default viteConfig
