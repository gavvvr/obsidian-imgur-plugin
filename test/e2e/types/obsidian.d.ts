import ImgurPlugin from '../../../src/ImgurPlugin'
import { IMGUR_PLUGIN_ID } from '../constants'

declare module 'obsidian' {
  interface App {
    plugins: {
      plugins: {
        [index: string]: Plugin
        [IMGUR_PLUGIN_ID]: ImgurPlugin
      }
      setEnable(toggle: boolean): void
      enablePlugin(pluginId: string): void
    }
    commands: {
      executeCommandById: (id: string) => boolean
    }
  }
}
