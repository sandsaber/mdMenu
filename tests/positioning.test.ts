import { describe, expect, it } from "vitest";
import { clampPosition, positionNearRect } from "../src/toolbar/positioning";

describe("clampPosition", () => {
  it("keeps the toolbar inside the viewport with padding", () => {
    expect(
      clampPosition(
        { left: 490, top: 490 },
        { width: 100, height: 40 },
        { width: 500, height: 500 },
      ),
    ).toEqual({ left: 392, top: 452 });
  });

  it("pins oversized toolbars to the viewport padding", () => {
    expect(
      clampPosition(
        { left: 20, top: 20 },
        { width: 400, height: 280 },
        { width: 320, height: 240 },
      ),
    ).toEqual({ left: 8, top: 8 });
  });
});

describe("positionNearRect", () => {
  it("centers the toolbar above the rect when there is room", () => {
    expect(
      positionNearRect(
        { left: 100, top: 100, right: 200, bottom: 120 },
        { width: 120, height: 40 },
        { width: 800, height: 600 },
      ),
    ).toEqual({ left: 90, top: 52 });
  });

  it("places the toolbar below when there is more room below", () => {
    expect(
      positionNearRect(
        { left: 100, top: 20, right: 200, bottom: 40 },
        { width: 120, height: 40 },
        { width: 800, height: 600 },
      ),
    ).toEqual({ left: 90, top: 48 });
  });

  it("chooses the side with more room when neither side fully fits", () => {
    expect(
      positionNearRect(
        { left: 100, top: 90, right: 200, bottom: 110 },
        { width: 120, height: 100 },
        { width: 800, height: 170 },
      ),
    ).toEqual({ left: 90, top: 8 });
  });
});
