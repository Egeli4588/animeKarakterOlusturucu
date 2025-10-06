/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// FIX: Define and export Frame and AnimationAssets types.
export interface Frame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnimationAssets {
  imageData: {
    data: string;
    mimeType: string;
  } | null;
  frameDuration: number | null;
}
