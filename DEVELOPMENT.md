Development how-to
===

### Prerequisites

- Get a [Node.js](https://nodejs.org/)

### Development

- create a new Obsidian vault for development
- `git clone` the repo to any place
- `npm install`
- `npx obsidian-plugin dev -v=$YOUR_DEV_VAULT_PATH src/main.ts`

---

Special thanks to:
- [@pjeby][pjeby] for [hot-reload plugin][hot-reload] which gives an instant feedback on code change
- [@zephraph][zephraph] for his [tools for Obsidian plugin development][obsidian-tools] which makes development a breeze

[zephraph]: https://github.com/zephraph/
[obsidian-tools]: https://github.com/zephraph/obsidian-tools
[pjeby]: https://github.com/pjeby
[hot-reload]: https://github.com/pjeby/hot-reload
