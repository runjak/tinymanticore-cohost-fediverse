import cohost from "cohost";
import { Mastodon } from "megalodon";
import { config } from "./config.mjs";

const getCohostProject = async () => {
  const user = new cohost.User();
  await user.login(config.cohost.email, config.cohost.password);

  const projects = await user.getProjects();
  return projects.find((p) => p.handle === config.cohost.handle);
};

const getLastTwentyPosts = async (project) => {
  return project.getPosts();
};

const getLastPost = async (project) => {
  const [somePost] = await project.getPosts();
  return somePost;
};

const mastodon = new Mastodon(
  config.mastodon.baseUrl,
  config.mastodon.accessToken
);

const getAccountId = async () => {
  const { data: account } = await mastodon.verifyAccountCredentials();

  if (!account.bot) {
    console.log("FIXME mark as bot!");
    // mastodon.updateCredentials({ bot: true })
  }

  return account.id;
};

const main = async () => {
  // const project = await getCohostProject();

  // const post = await getLastPost(project);

  // console.log({
  //   id: post.id,
  //   plainTextBody: post.plainTextBody,
  //   publishedAt: post.publishedAt,
  //   filename: post.filename,
  //   singlePostPageUrl: post.singlePostPageUrl
  // });

  // await mastodon.postStatus(`${post.plainTextBody}\n\nFrom: ${post.singlePostPageUrl}`)

  const accountId = await getAccountId();
  const statuses = await mastodon.getAccountStatuses(accountId);
  console.log(statuses);
};

main();
