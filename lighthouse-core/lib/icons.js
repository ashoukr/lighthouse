/**
 * @license Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/**
 * @param {NonNullable<LH.Artifacts.Manifest['value']>} manifest
 * @return {boolean} Does the manifest have any icons?
 */
function doExist(manifest) {
  if (!manifest || !manifest.icons) {
    return false;
  }
  if (manifest.icons.value.length === 0) {
    return false;
  }
  return true;
}

/**
 * @param {number} sizeRequirement
 * @param {NonNullable<LH.Artifacts.Manifest['value']>} manifest
 * @return {Array<string>} Value of satisfactory sizes (eg. ['192x192', '256x256'])
 */
function sizeAtLeast(sizeRequirement, manifest) {
  // An icon can be provided for a single size, or for multiple sizes.
  // To handle both, we flatten all found sizes into a single array.
  const iconValues = manifest.icons.value;
  /** @type {Array<string>} */
  const flattenedSizes = [];
  iconValues.forEach(icon => {
    if (icon.value.sizes.value) {
      flattenedSizes.push(...icon.value.sizes.value);
    }
  });

  return flattenedSizes
      // discard sizes that are not AAxBB (eg. "any")
      .filter(size => /\d+x\d+/.test(size))
      .filter(size => {
        // Split the '24x24' strings into ['24','24'] arrays
        const sizeStrs = size.split(/x/i);
        // Cast the ['24','24'] strings into [24,24] numbers
        const sizeNums = [parseFloat(sizeStrs[0]), parseFloat(sizeStrs[1])];
        // Only keep sizes that are as big as our required size
        const areIconsBigEnough = sizeNums[0] >= sizeRequirement && sizeNums[1] >= sizeRequirement;
        // Square is required: https://code.google.com/p/chromium/codesearch#chromium/src/chrome/browser/manifest/manifest_icon_selector.cc&q=ManifestIconSelector::IconSizesContainsBiggerThanMinimumSize&sq=package:chromium
        const areIconsSquare = sizeNums[0] === sizeNums[1];
        return areIconsBigEnough && areIconsSquare;
      });
}

/**
 * @param {NonNullable<LH.Artifacts.Manifest['value']>} manifest
 * @return {boolean} True/False whether the icons are all PNGs
 */
function isPng(manifest) {
  // get all icons
  const iconValues = manifest.icons.value;

  // check that the filetypes are 'png'
  for (const icon of iconValues) {
    if (!icon.value.src.value || !icon.value.type.value) {
      return false;
    }

    // validate that the src is of format [path]/[filename].[ext]
    // regex -> .*\/?.*\.(.{3}) -> outputs ['whole match', 'ext']
    const extension = icon.value.src.value.match(/.*\/?.*\.(.{3})$/);

    const typehint = icon.value.type.value;

    if (extension === null || extension[1] !== 'png' || typehint !== 'image/png') {
      return false;
    }
  }
  return true;
}

module.exports = {
  doExist,
  sizeAtLeast,
  isPng,
};
