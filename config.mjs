export const config = {
  cohost: {
    email: process.env["COHOST_EMAIL"],
    password: process.env["COHOST_PASSWORD"],
  },
};

console.log(config);
