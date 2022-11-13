import { config } from "./config.mjs";
import cohost from "cohost";

const getProject = async () => {
  const user = new cohost.User();
  await user.login(config.cohost.email, config.cohost.password);

  const projects = await user.getProjects();
  return projects.find((p) => p.handle === config.cohost.handle);
};

getProject();
