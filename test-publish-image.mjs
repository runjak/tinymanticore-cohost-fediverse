import { createReadStream } from "fs";
import { join } from "path";
import { writeFile, mkdtemp, rm, rmdir } from "fs/promises";
import { login } from "masto";
import { config } from "./config.mjs";

const clientPromise = login({
  url: config.mastodon.baseUrl,
  accessToken: config.mastodon.accessToken,
});

const imageUrl =
  "https://www.runjak.codes/_next/image?url=%2Fimages%2Fprofile.jpg&w=256&q=75";
const imageDescription = "Aha, der selbe Post, nochmal!";

(async () => {
  console.log("fetching image");
  const imageResponse = await fetch(imageUrl);

  const tempDir = await mkdtemp("/tmp/");
  const tempFile = join(tempDir, "foo");
  await writeFile(tempFile, imageResponse.body);

  console.log("uploading image");

  const client = await clientPromise;

  const attachment = await client.mediaAttachments.create({
    file: createReadStream(tempFile),
    description: imageDescription,
  });
  console.log(attachment);

  console.log("posting status");
  const status = await client.statuses.create({
    mediaIds: [attachment.id],
    status: "Oh nice, mach den selben Post nochmal!!",
  });
  console.log(status);

  await rm(tempFile);
  await rmdir(tempDir);
  console.log("it fiiiine, we're done, the war is over.");
})();
