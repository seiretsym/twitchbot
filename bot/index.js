module.exports = async function (db) {
  const tmi = require("tmi.js");
  const axios = require("axios");
  require("dotenv").config();

  // get token
  // const { data } = await axios.post(`https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${process.env.BOT_CLIENT_ID}&redirect_uri=http://localhost:3377&scope=chat:read+chat:edit+channel:moderate&state=c3ab8aa609ea11e793ae92361f002671`);
  // console.log(data);
  const opts = {
    identity: {
      username: "derpbothk",
      password: process.env.OAUTH_BOT_TOKEN
    },
    channels: ["derpwinhk"]
  }

  const client = new tmi.client(opts);
  client.on("connected", (addr, port) => {
    console.log(`DerpBotHK loaded on ${addr}:${port}`)
    require("./commands")(client, db);
  })

  client.connect();
}