/// <reference types="wdio-electron-service" />
import ObsidianApp from './specs/pageobjects/obsidian-app.page'

export const config: WebdriverIO.Config = {
  runner: 'local',
  specs: ['./specs/*.ts'],
  exclude: [],
  maxInstances: 10,
  capabilities: [
    {
      browserName: 'electron',
      browserVersion: '28.2.3',
      'wdio:electronServiceOptions': {
        // custom application args
        appBinaryPath: '/Applications/Obsidian.app/Contents/MacOS/Obsidian',
        appArgs: [],
      },
    },
  ],
  // Level of logging verbosity: trace | debug | info | warn | error | silent
  logLevel: 'info',
  //
  // Set specific log levels per logger
  // loggers:
  // - webdriver, webdriverio
  // - @wdio/browserstack-service, @wdio/devtools-service, @wdio/sauce-service
  // - @wdio/mocha-framework, @wdio/jasmine-framework
  // - @wdio/local-runner
  // - @wdio/sumologic-reporter
  // - @wdio/cli, @wdio/config, @wdio/utils
  // Level of logging verbosity: trace | debug | info | warn | error | silent
  // logLevels: {
  //     webdriver: 'info',
  //     '@wdio/appium-service': 'info'
  // },
  //
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: ['electron'],
  framework: 'mocha',

  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
  beforeSuite: async () => {
    await ObsidianApp.removeE2eTestVaultIfExists()
    await ObsidianApp.createAndOpenFreshVault()
    await ObsidianApp.activateImgurPlugin()
  },
}
