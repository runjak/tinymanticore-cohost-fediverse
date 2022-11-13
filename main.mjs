import { config } from "./config.mjs";
import cohost from "cohost";

const getProject = async () => {
  const user = new cohost.User();
  await user.login(config.cohost.email, config.cohost.password);

  const projects = await user.getProjects();
  return projects.find((p) => p.handle === config.cohost.handle);
};

const getLastTwentyPosts = async (project) => {
  return project.getPosts();
};

const main = async () => {
  const project = await getProject();

  const posts = await getLastTwentyPosts(project);

  console.log(
    posts.map((p) => p.blocks.map((b) => b?.markdown ?? b?.attachment))
  );
};

main();
