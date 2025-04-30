import fs from "fs/promises";
import decompress from "decompress";
import { open } from "fs/promises";

export async function downloadAbvAssets(
  { outputFolder = "./dist" }: { outputFolder?: string },
): Promise<void> {
  const abvAssetsFilepath = "./abv-assets.zip";

  try {
    await open(abvAssetsFilepath);
  } catch (e) {
    console.log("abv-assets.zip not found, downloading...");

    const response = await fetch(
      "https://inbo-vbp-global-public-artifacts.s3.eu-west-1.amazonaws.com/ABV/abv-content.zip",
    );
    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(abvAssetsFilepath, buffer);
  }

  await decompress(abvAssetsFilepath, outputFolder + "/abv");
  console.log("Abv assets unzipped successfully into " + outputFolder);
}
