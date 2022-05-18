import { expect, describe, it } from "vitest";
import { isWrapped } from "../src/imgur/resizing/MarkdownImagePieces";
import findImgurMarkdownImage from "../src/imgur/resizing/md-image-parsing";

describe("findImgurMarkdownImage", () => {
  const simplestImage = "![](https://i.imgur.com/m3RpPCV.png)";

  it.each([
    { line: simplestImage, cursorAt: 0 },
    { line: simplestImage, cursorAt: 35 },
    { line: "![](https://i.imgur.com/m3RpPCVm.png)", cursorAt: 0 },
  ])("GIVEN line '$line' and cursor pos: $cursorAt", ({ line, cursorAt }) => {
    const match = findImgurMarkdownImage(line, cursorAt);
    expect(match.exists).toBeTruthy();
  });

  it("matches an image when cursor position is set to last character of image", () => {
    const match = findImgurMarkdownImage(simplestImage, 35);
    expect(match.exists).toBeTruthy();
  });

  it("does not match an image when cursor position is after an image", () => {
    const match = findImgurMarkdownImage(simplestImage, 36);
    expect(match.exists).toBeFalsy();
  });

  it("matches 2nd image when cursor is between the 1st and second one", () => {
    const match = findImgurMarkdownImage(
      "![](https://i.imgur.com/m3RpPCV.png)![](https://i.imgur.com/pLIMYhw.png)",
      36
    );
    expect(match.exists).toBeTruthy();
    expect(match.mdImagePieces.imageId).toBe("pLIMYhw");
  });

  it("throws error for images with unexpected length of image id", () => {
    it.each([
      { line: "![](https://i.imgur.com/m3RpPCVsm.png)" },
      { line: "![](https://i.imgur.com/m3RpPC.png)" },
    ])(
      "GIVEN line '$line' an error reporting incorrect image id size will be thrown",
      ({ line }) => {
        const match = findImgurMarkdownImage(line, 0);
        expect(match.mdImagePieces).toThrowError();
      }
    );
  });
});

describe("isWrapped type predicate", () => {
  it("treats simple image as not-wrapped", () => {
    const matchedPieces = findImgurMarkdownImage(
      "![](https://i.imgur.com/m3RpPCV.png)",
      0
    ).mdImagePieces;
    expect(isWrapped(matchedPieces)).toBeFalsy();
  });

  it("correctly detects wrapped image", () => {
    const matchedPieces = findImgurMarkdownImage(
      "[![](https://i.imgur.com/m3RpPCVs.png)](https://i.imgur.com/m3RpPCV.png)",
      0
    ).mdImagePieces;
    expect(isWrapped(matchedPieces)).toBeTruthy();
  });
});
