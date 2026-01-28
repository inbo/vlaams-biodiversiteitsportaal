import fs from "fs/promises";
import decompress from "decompress";
import { open } from "fs/promises";
import { basename, dirname } from "path";

export async function downloadSpeciesPluginTabAssets({
  outputFolder,
  assetsS3RelativePath,
  assetsFilepath,
}: {
  outputFolder: string;
  assetsS3RelativePath: string;
  assetsFilepath: string;
}): Promise<Map<string, string>> {
  try {
    const fileHandle = await open(assetsFilepath);
    await fileHandle.close();
  } catch (e) {
    console.log(assetsFilepath + " not found, downloading...");

    const response = await fetch(
      "https://build.natuurdata.dev.inbo.be/" + assetsS3RelativePath,
    );
    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(assetsFilepath, buffer);
    console.log(
      assetsS3RelativePath +
      " assets downloaded from S3 successfully and written into " +
      assetsFilepath,
    );
  }

  await decompress(assetsFilepath, outputFolder);
  console.log(
    assetsFilepath + " assets unzipped successfully into " + outputFolder,
  );

  const files = await fs.readdir(outputFolder);
  return files.reduce((acc, file) => {
    if (file.endsWith(".html")) {
      const lastSlash = outputFolder.lastIndexOf("/");
      const directoryName = outputFolder.substring(lastSlash + 1);
      const name = `${directoryName}/${basename(file, ".html")}`;
      acc[name] = outputFolder + "/" + file;
    }
    return acc;
  }, new Map<string, string>());
}
