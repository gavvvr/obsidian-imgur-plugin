class CanvasCard {
  getText = async () => await $('.cm-line.cm-active').getText()
}

export default new CanvasCard()
