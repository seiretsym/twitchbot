const router = require('express').Router();
const axios = require("axios");
const qs = require("querystring");
const path = require("path")
require("dotenv").config;

// get token
router.route("/getToken")
  .get((req, res) => {
    // const headers = {
    //   client_id: process.env.TWITCH_CLIENT_ID,
    //   redirect_uri: "http://localhost:3377/api/twitch/auth",
    //   response_type: "token",
    //   scope: "bits:read channel:read:subscriptions channel:read:redemptions channel_subscriptions"
    // }
    const headers = {
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: "client_credentials",
      scope: "bits:read channel:read:subscriptions channel:read:redemptions user:read:email"
    }
    axios.post("https://id.twitch.tv/oauth2/token?" + qs.stringify(headers))
      .then(({ data }) => {
        req.session.token = data.access_token;
        res.json(data.access_token);
      })
      .catch(err => {
        res.json(err)
      })
  })

module.exports = router;

router.route("/")
  .get((req, res) => {
    res.sendFile(path.join(__dirname, "token.html"))
  })
  .post((req, res) => {
    req.session.token = req.body.token;
    res.json("success");
  })

router.route("/checkAuth")
  .get((req, res) => {
    if (req.session.token) {
      res.json(true);
    } else {
      res.json(false);
    }
  })