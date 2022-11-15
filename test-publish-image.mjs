import { Mastodon } from "megalodon";
import { config } from "./config.mjs";
import { writeFile, readFile } from "fs/promises";

const client = new Mastodon(
  config.mastodon.baseUrl,
  config.mastodon.accessToken
);

const imageUrl =
  "https://www.runjak.codes/_next/image?url=%2Fimages%2Fprofile.jpg&w=256&q=75";
const imageDescription = "Lurch lurch!";

(async () => {
  console.log("fetching image");
  const imageResponse = await fetch(imageUrl);
  const imageData = Buffer.from(await imageResponse.arrayBuffer());

  console.log("uploading image");
  const mediaResponse = await client.uploadMedia(new Blob([imageData]), {
    description: imageDescription,
  });
  console.log(mediaResponse.data);

  console.log("posting status");
  await client.postStatus("test post", { media_ids: [mediaResponse.data.id] });

  console.log("it fiiiine, we're done, the war is over.");
})();
