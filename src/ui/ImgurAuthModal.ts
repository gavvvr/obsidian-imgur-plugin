import { Modal, ButtonComponent, App } from 'obsidian'

const ONE_SECOND_MILLIS = 1_000
const OPEN_BROWSER_IN_SECONDS = 4

export default class ImgurAuthModal extends Modal {
  secondsLeft = OPEN_BROWSER_IN_SECONDS

  private opened = false

  get isOpen(): boolean {
    return this.opened
  }

  private timerDiv: HTMLDivElement

  private readonly authLink: string

  private intervalId: NodeJS.Timeout | null = null

  constructor(
    clientId: string,
    app: App,
    private readonly afterClose?: () => Promise<void>,
  ) {
    super(app)
    this.authLink = `https://api.imgur.com/oauth2/authorize?client_id=${clientId}&response_type=token`
  }

  onOpen(): void {
    this.opened = true

    this.timerDiv = this.modalEl.createDiv()
    this.updateText()

    this.intervalId = setInterval(() => {
      this.secondsLeft -= 1
      this.updateText()

      if (this.secondsLeft === 0) {
        window.open(this.authLink)
        clearInterval(this.intervalId)
      }
    }, ONE_SECOND_MILLIS)
    this.addNoWaitDiv(this.intervalId)

    new ButtonComponent(this.modalEl.createDiv())
      .setButtonText('Cancel')
      .setCta()
      .onClick(() => this.close())
  }

  async onClose(): Promise<void> {
    clearInterval(this.intervalId)
    this.opened = false
    if (this.afterClose) await this.afterClose()
  }

  private addNoWaitDiv(interval: NodeJS.Timeout) {
    const linkEl = createEl('a', { href: this.authLink, text: 'here' })
    const noWaitDiv = this.modalEl.createDiv()
    noWaitDiv.appendText('If you do not want to wait, click ')
    noWaitDiv.append(linkEl)
    linkEl.onclick = () => {
      clearInterval(interval)
      this.secondsLeft = 0
      this.updateText()
    }
    return noWaitDiv
  }

  private updateText() {
    this.timerDiv.setText(
      `Please complete authentication at imgur.com; Opening browser in ${this.secondsLeft} seconds...`,
    )
  }
}
