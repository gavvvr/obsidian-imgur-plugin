// @ts-check

import fs from 'node:fs/promises'
import path from 'node:path'
import { exit } from 'node:process'

import enquirer from 'enquirer'
import esbuild from 'esbuild'
import obsidianUtils from 'obsidian-utils'

import { sharedEsbuildConfig } from './esbuild.config.js'

const { findVault, installPluginFromGithub, isPluginInstalled } = obsidianUtils

let vaults
try {
  vaults = await findVault()
} catch (e) {
  console.error('Failed to find  vaults', e)
  exit(1)
}

const vaultsOptions = vaults.map((v) => ({ message: v.name, name: v.path }))

/** @type {{ selectedVaultPath: string }} */
const { selectedVaultPath } = await enquirer.prompt({
  type: 'select',
  name: 'selectedVaultPath',
  message: 'Select Obsidian Vault for development',
  choices: vaultsOptions,
})

if (!(await isPluginInstalled('hot-reload', selectedVaultPath))) {
  console.log('Installing hot-reload from github...')
  await installPluginFromGithub('pjeby/hot-reload', 'latest', selectedVaultPath)
}

const localManifestPath = path.join(process.cwd(), 'manifest.json')
const manifest = JSON.parse(await fs.readFile(localManifestPath, { encoding: 'utf-8' }))

const pluginPath = path.join(selectedVaultPath, '.obsidian', 'plugins', manifest.id)

fs.mkdir(pluginPath, { recursive: true })
await fs.copyFile(localManifestPath, path.join(pluginPath, 'manifest.json'))
await fs.writeFile(path.join(pluginPath, '.hotreload'), '')

const esbuildCtx = await esbuild.context({
  ...sharedEsbuildConfig,
  ...{ outfile: path.join(pluginPath, 'main.js') },
})
esbuildCtx.watch()
