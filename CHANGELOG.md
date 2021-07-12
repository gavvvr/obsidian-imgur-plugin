# obsidian-imgur-plugin changelog

## [2.0.0] - 2021-07-10

This release brings images upload on behalf of authenticated user.

Now you have a choice:

- either to upload "anonymously" with `client_id`
- or to sign in with your Imgur account and have your images uploaded to your account

### Added

- User-friendly OAuth authentication (#5)

## [1.2.0] - 2021-06-02

### Fixed

- fall back to default behavior if image upload fails (#8, #9)

### Added

- An `ImageUploader` interface which should simplify creating forks supporting other image providers

## [1.1.0] - 2021-04-26

### Added

- support for upload on drag-and-drop
- which enabled gifs upload support (#6)

## [1.0.0] - 2021-01-15

- Initial version
- Works by providing `client_id` manually
- Only supports paste action

[2.0.0]: https://github.com/gavvvr/obsidian-imgur-plugin/releases/tag/2.0.0
[1.2.0]: https://github.com/gavvvr/obsidian-imgur-plugin/releases/tag/1.2.0
[1.1.0]: https://github.com/gavvvr/obsidian-imgur-plugin/releases/tag/1.1.0
[1.0.0]: https://github.com/gavvvr/obsidian-imgur-plugin/releases/tag/1.0.0
