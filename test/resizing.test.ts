import { expect, describe, it } from "vitest";
import resizeTo from "../src/imgur/resizing/resizing";
import ImgurSize from "../src/imgur/resizing/ImgurSize";
import imgurMarkdownImageRegexMatch from "../src/imgur/resizing/md-image-parsing";

describe("resizeTo", () => {
  it.each([
    {
      input: "![](https://i.imgur.com/m3RpPCVm.png)",
      size: ImgurSize.SMALL_SQUARE,
      output:
        "[![](https://i.imgur.com/m3RpPCVs.png)](https://i.imgur.com/m3RpPCV.png)",
    },
    {
      input: "![](https://i.imgur.com/m3RpPCVm.png)",
      size: ImgurSize.BIG_SQUARE,
      output:
        "[![](https://i.imgur.com/m3RpPCVb.png)](https://i.imgur.com/m3RpPCV.png)",
    },
    {
      input: "![](https://i.imgur.com/m3RpPCVm.png)",
      size: ImgurSize.SMALL_THUMBNAIL,
      output:
        "[![](https://i.imgur.com/m3RpPCVt.png)](https://i.imgur.com/m3RpPCV.png)",
    },
    {
      input: "![](https://i.imgur.com/m3RpPCVm.png)",
      size: ImgurSize.MEDIUM_THUMBNAIL,
      output:
        "[![](https://i.imgur.com/m3RpPCVm.png)](https://i.imgur.com/m3RpPCV.png)",
    },
    {
      input: "![](https://i.imgur.com/m3RpPCVm.png)",
      size: ImgurSize.LARGE_THUMBNAIL,
      output:
        "[![](https://i.imgur.com/m3RpPCVl.png)](https://i.imgur.com/m3RpPCV.png)",
    },
    {
      input: "![](https://i.imgur.com/m3RpPCVm.png)",
      size: ImgurSize.HUGE_THUMBNAIL,
      output:
        "[![](https://i.imgur.com/m3RpPCVh.png)](https://i.imgur.com/m3RpPCV.png)",
    },
  ])("resizes an image to '$size' as expected", ({ input, size, output }) => {
    const match = imgurMarkdownImageRegexMatch(input, 0);
    const replacement = resizeTo(size)(match.mdImagePieces).content;

    expect(replacement).toBe(output);
  });

  it("can resize already resized image", () => {
    const smallThumbnail =
      "[![](https://i.imgur.com/m3RpPCVt.png)](https://i.imgur.com/m3RpPCV.png)";
    const match = imgurMarkdownImageRegexMatch(smallThumbnail, 0);
    const replacement = resizeTo(ImgurSize.LARGE_THUMBNAIL)(
      match.mdImagePieces
    ).content;

    expect(replacement).toBe(
      "[![](https://i.imgur.com/m3RpPCVl.png)](https://i.imgur.com/m3RpPCV.png)"
    );
  });

  it("provides correct range to be replaced", () => {
    const originalImage = "   ![](https://i.imgur.com/m3RpPCV.png)";
    const match = imgurMarkdownImageRegexMatch(originalImage, 3);
    const replacement = resizeTo(ImgurSize.LARGE_THUMBNAIL)(
      match.mdImagePieces
    );

    expect(replacement.from).toBe(3);
    expect(replacement.to).toBe(39);
  });

  it.each([
    {
      input:
        "[![](https://i.imgur.com/m3RpPCVs.png)](https://i.imgur.com/m3RpPCV.png)",
      inputDescription: "wrapped resized image",
    },
    {
      input: "![](https://i.imgur.com/m3RpPCVm.png)",
      inputDescription: "resized image",
    },
  ])("resizes '$inputDescription' to original size", ({ input }) => {
    const match = imgurMarkdownImageRegexMatch(input, 0);
    const replacement = resizeTo(ImgurSize.ORIGINAL)(
      match.mdImagePieces
    ).content;

    expect(replacement).toBe("![](https://i.imgur.com/m3RpPCV.png)");
  });
});
