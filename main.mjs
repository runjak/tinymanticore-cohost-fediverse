import { createReadStream } from "fs";
import { join } from "path";
import { writeFile, mkdtemp, rm, rmdir } from "fs/promises";
import cohost, { Post } from "cohost";
import { login } from "masto";
import { config } from "./config.mjs";

const getCohostProject = async () => {
  const user = new cohost.User();
  await user.login(config.cohost.email, config.cohost.password);

  const projects = await user.getProjects();
  return projects.find((p) => p.handle === config.cohost.handle);
};

async function* cohostPosts() {
  const project = await getCohostProject();

  let page = 0;
  while (true) {
    const posts = await project.getPosts(page);

    if (posts.length === 0) {
      break;
    }

    yield* posts;
    page += 1;
  }
}

const markCohostPostCrossposted = async (post, syncedUrl) =>
  Post.update(post.project, post.id, {
    postState: post.state,
    headline: post.headline,
    adultContent: post.effectiveAdultContent,
    blocks: [
      ...post.blocks,
      {
        type: "markdown",
        markdown: {
          content: `-----\n\nCrossposted to [${
            new URL(syncedUrl).hostname
          }](${syncedUrl})`,
        },
      },
    ],
    cws: post.cws,
    tags: post.tags,
  });

const isCohostPostCrossposted = (post) =>
  post.plainTextBody.includes(config.mastodon.baseUrl);

const mastodonClientPromise = login({
  url: config.mastodon.baseUrl,
  accessToken: config.mastodon.accessToken,
});

const uploadMediaToMastodon = async (sourceUrl, description) => {
  const response = await fetch(sourceUrl);

  const tempDir = await mkdtemp("/tmp/");
  const tempFile = join(tempDir, "buffer");

  await writeFile(tempFile, response.body);

  const mastodonClient = await mastodonClientPromise;
  const attachment = await mastodonClient.mediaAttachments.create({
    file: createReadStream(tempFile),
    description,
  });

  rm(tempFile).then(() => rmdir(tempDir));

  return attachment;
};

const crosspostToMastodon = async (post) => {
  const { plainTextBody, blocks, singlePostPageUrl } = post;
  const fromLine = `\n\nFrom: ${singlePostPageUrl}`;

  const uploads = blocks
    .filter(({ type }) => type === "attachment")
    .map(({ attachment: { fileURL, altText } }) =>
      uploadMediaToMastodon(fileURL, altText)
    );
  const uploadedAttachments = await Promise.all(uploads);

  const mastodonClient = await mastodonClientPromise;
  const status = await mastodonClient.statuses.create({
    status: `${plainTextBody.substring(0, 500 - fromLine.length)}${fromLine}`,
    mediaIds: Boolean(uploadedAttachments.length)
      ? uploadedAttachments.map(({ id }) => id)
      : undefined,
  });

  await markCohostPostCrossposted(post, status.url || status.uri);

  const now = new Date().toISOString();
  console.log(`${now}: Posted ${status.url || status.uri}`);
  console.log(`${now}: Updated ${singlePostPageUrl}`);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  while (true) {
    try {
      let postsToCrosspost = [];
      for await (const post of cohostPosts()) {
        if (isCohostPostCrossposted(post)) {
          break;
        } else {
          postsToCrosspost.unshift(post);
        }
      }

      console.log(
        `${new Date().toISOString()}: Found ${
          postsToCrosspost.length
        } posts to crosspost.`
      );

      for (const post of postsToCrosspost) {
        try {
          await crosspostToMastodon(post);
        } catch (e) {
          console.error(
            `${new Date().toISOString()}: Error in crosspostToMastodon for post ${
              post.singlePostPageUrl
            }:\n${e}`
          );
        } finally {
          await sleep(60 * 1000);
        }
      }
    } catch (e) {
      console.error(`${new Date().toISOString()}: Error in main:\n${e}`);
    } finally {
      await sleep(9 * 60 * 1000);
    }
  }
};

main();
