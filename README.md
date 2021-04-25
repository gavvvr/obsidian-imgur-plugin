Obsidian Imgur Plugin
===

This plugin uploads images to [imgur.com](https://imgur.com/).
You can either paste right from your clipboard or drag and drop multiple images from your filesystem.

![obsidian-imgur-plugin-demo](https://user-images.githubusercontent.com/1719646/104514289-080e2480-5602-11eb-8a1d-c59feb37cb4f.gif)

Getting started
---

All you need to start using the plugin is imgur.com **Client ID**. 

![image](https://user-images.githubusercontent.com/1719646/104515726-3bea4980-5604-11eb-92c5-9e448ff9c364.png)

If you do not have an imgur.com account, you need to [get one](https://imgur.com/register) first.

When you sign in, go to https://api.imgur.com/oauth2/addclient 
and generate **Client ID** for Obsidan:
- provide application name, i.e. "Obsidian"
- choose "OAuth 2 authorization without a callback URL"
- and specify your e-mail

### Notes:
- You only need **Client ID**, Client secret is not required.
- Images uploaded by thins plugin get posted "anonymously" (without being tied to your imgur account). 
  So you will not find pasted images in your imgur.com account.
  
### Limitations
- you can not paste animated gifs from the clipboard (they are copied as static images to the clipboard). 
  Use drag and drop instead if you want to upload animated gif.
- There are daily [upload limits](https://apidocs.imgur.com/#rate-limits), 
  but reaching them by manually making notes is hard to imagine.
