# Obsidian Imgur Plugin

[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=gavvvr_obsidian-imgur-plugin&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=gavvvr_obsidian-imgur-plugin)
[![Installations count](https://img.shields.io/github/downloads/gavvvr/obsidian-imgur-plugin/main.js.svg)][installation-instructions]

[installation-instructions]: https://help.obsidian.md/Advanced+topics/Third-party+plugins#Discover+and+install+community+plugins

This plugin uploads images to [imgur.com](https://imgur.com/) instead of storing them locally in your vault.

![obsidian-imgur-plugin-demo](https://user-images.githubusercontent.com/1719646/120395609-efe33b80-c33d-11eb-9960-95b9aac0b0b9.gif)

## Why?

Obsidian stores all the data locally by design
(which is perfect for text and, in my opinion, can be improved for images).
If you often add pictures to your notes, your vault can quickly grow in size.
Which in turn can lead to reaching limits if you use free plans of cloud storage services to sync your notes
or can lead to growth of repository size if you use git to back up your notes.

This plugin is a perfect solution for people
who paste images to their notes on daily basis (i.e. students making screenshots of lecture slides)
and do not want to clutter their vaults with image files.

Having remote images also makes it much easier to share a note with anyone else,
you will only need to share a single file.

If you are uncertain if this solution is for you, you can check out the [FAQ](#faq) section
and/or a video created by [@santiyounger][santiyounger] discussing pros and cons of this approach

[![Santi Younger - Use Images Like A Pro](https://img.youtube.com/vi/-a1vJVy20cQ/0.jpg)](https://www.youtube.com/watch?v=-a1vJVy20cQ)

[santiyounger]: https://github.com/santiyounger

## Features

- Upload images anonymously or to your Imgur account
- Upload images by either pasting from the clipboard or by dragging them from the file system
- Animated gifs upload support on drag-and-drop

## Installation

Install the plugin via the [Community Plugins][installation-instructions] tab within Obsidian

## Getting started

### Authenticated upload

Go to plugin's settings, select 'Authenticated Imgur upload' and complete authentication.
That's all! Now you are ready to make notes and upload all your images remotely.
You will see all your uploaded images at <https://your_login.imgur.com/all/>

### Anonymous upload

You might not want to see your Obsidian images tied to Imgur account.

For this case there is an 'Anonymous Imgur upload' option.
To perform anonymous uploads, the plugin needs a **Client ID**.
This plugin is already shipped with the embedded **Client ID**, which will be used by default until you provide your own.
But this same Client ID will also be used by other users around the world,
which may lead to [reaching daily upload limits](#known-limitations) for this shared Client ID.

If you face problems with anonymous images upload, it is recommended to generate your own Client ID.
Please follow instructions below.

#### Obtaining your own Client ID

If you do not have an imgur.com account, you need to [get one](https://imgur.com/register) first.

After you signed in, go to <https://api.imgur.com/oauth2/addclient>
and generate **Client ID** for Obsidian:

- provide application name, i.e. "Obsidian"
- choose "OAuth 2 authorization without a callback URL"
- and specify your e-mail

You only need **Client ID**, Client secret is not required, no need to record it.

## FAQ

**Q:** How secure this approach is?  
**A:** Nobody sees your uploaded image unless you share a link or someone magically guesses an URL to your image.

**Q:** Can I remove a remote image uploaded by accident?  
**A:** For authenticated uploads - yes, go to <https://your_login.imgur.com/all/>,
for anonymous uploads - no
(it is technically possible, but you will need a `deleteHash` which is not recorded. I would record it, but there is no place for logging in Obsidian yet)

**Q:** For how long an image stays at imgur.com? Is there a chance to lose the data?  
**A:** For authenticated uploads, I guess they are never deleted. What about anonymous uploads?
Earlier it [was stated on Imgur website][early-imgur-guarantees] that the image you upload stays **forever**.
I think this is true [since 2015][imgur-pro-free]. Today I could not find this statement on Imgur website.
I can assume that images that did not receive any view for years, can be removed, but there is nothing to worry about.
You can read my detailed thoughts on this in [discussions][ttl-discussion]

[imgur-pro-free]: https://blog.imgur.com/2015/02/09/imgur-pro-for-everyone/
[early-imgur-guarantees]: https://webapps.stackexchange.com/questions/75993/how-long-does-imgur-store-uploaded-images/75994#75994
[ttl-discussion]: https://github.com/gavvvr/obsidian-imgur-plugin/discussions/4#discussioncomment-590286

**Q:** Imgur supports videos. Does the plugin support videos upload?  
**A:** No. Initially, I did not consider videos upload support since there is no Markdown syntax to embed videos.
On the other hand, you can simply use `<video>` HTML tag, so I will probably add support for videos in future

**Q:** Can it upload images to some other service?  
**A:** For now, there are no plans to support other image hosting solutions,
but it should not be difficult for you to make a fork and create your own implementation of `ImageUploader` interface.

### Discussion

If you have any questions/suggestions, consider using [GitHub Discussions][gh-discussions].
There is also a [plugin's thread][forum-thread] on Obsidian forum.

[gh-discussions]: https://forum.obsidian.md/t/imgur-plugin-for-pasting-images/11462/10
[forum-thread]: https://forum.obsidian.md/t/imgur-plugin-for-pasting-images/11462

### Known limitations

- you can not paste animated gifs from the clipboard (they initially get copied as a static images to the clipboard).
  Use drag and drop instead if you want to upload an animated gif.
- There are daily [upload limits](https://apidocs.imgur.com/#rate-limits) for [Anonymous uploads](#anonymous-upload)
  using the same Client ID. That's why it is [recommended to generate your own](#obtaining-your-own-client-id)

### Known issues

- Sometimes Imgur can reject your request to upload an image for no obvious reason.
  The error [usually reported in this case][known-cors-problem-issue] is a failed CORS request,
  which does not allow Obsidian to proceed with image upload. If you face this problem, no action required from your side:
  just wait, and it will disappear soon. Whenever the plugin fails to upload an image remotely,
  it will fall back to the default method of storing an image locally.

[known-cors-problem-issue]: https://github.com/gavvvr/obsidian-imgur-plugin/issues/8

### Contribution

Contributions are welcomed.
Check out the [DEVELOPMENT.md](DEVELOPMENT.md) to get started with the code.

### Your support

If this plugin is helpful to you, you can show your ❤️ by giving it a star ⭐️ on GitHub.
You can also buy me a coffee using Ko-fi:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/F2F44TOP7)
