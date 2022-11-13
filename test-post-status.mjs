import { Mastodon } from "megalodon";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { config } from "./config.mjs";

const rl = readline.createInterface({ input, output });

const client = new Mastodon(
  config.mastodon.baseUrl,
  config.mastodon.accessToken
);

(async () => {
  const statusLine = await rl.question(
    "Please enter a status line to post ;)\n"
  );

  const [result] = await Promise.allSettled([
    client.postStatus(statusLine, {}),
  ]);
  console.log(result.status, result.reason);

  process.exit(0);
})();
