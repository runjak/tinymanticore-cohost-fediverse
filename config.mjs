export const config = {
  cohost: {
    email: process.env["COHOST_EMAIL"],
    password: process.env["COHOST_PASSWORD"],
    handle: process.env["COHOST_HANDLE"],
  },
  mastodon: {
    baseUrl: process.env["MASTODON_BASE_URL"],
    accessToken: process.env["MASTODON_ACCESS_TOKEN"],
  },
};
