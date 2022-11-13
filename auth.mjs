import { Mastodon } from "megalodon";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { config } from "./config.mjs";

const rl = readline.createInterface({ input, output });
const client = new Mastodon(config.mastodon.baseUrl);

(async () => {
  const appData = await client.registerApp(
    "Tiny Manticore Cohost Fediverse",
    {}
  );
  console.log(`Authorization URL:\n\t${appData.url}`);

  const code = await rl.question("What is the authorization code?\n");

  const token = await client.fetchAccessToken(
    appData.clientId,
    appData.clientSecret,
    code
  );

  console.log(`MASTODON_ACCESS_TOKEN=${token.accessToken}`);
  process.exit(0);
})();
