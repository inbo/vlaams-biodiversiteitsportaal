import fs from "fs/promises";
import decompress from "decompress";
import {basename} from "path";

export async function downloadAbvAssets({outputFolder = "./dist",}: { outputFolder?: string; }): Promise<void> {
  const response = await fetch("https://inbo-vbp-global-public-artifacts.s3.eu-west-1.amazonaws.com/ABV/abv-content.zip")
  const buffer = Buffer.from(await response.arrayBuffer())
  var abvAssetsFilepath= './abv-assets.zip'
  await fs.writeFile(abvAssetsFilepath, buffer)
  decompress(abvAssetsFilepath, outputFolder + "/abv-info")
  .then((files) => {
    console.log("Abv assets unzipped successfully into " + outputFolder);
  })
  .catch((error) => {
    console.log(error);
  });
}