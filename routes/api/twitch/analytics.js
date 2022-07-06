const router = require('express').Router();
const axios = require("axios");
require("dotenv").config;
let subscriberList = [];

router.route("/game")
  .get((req, res) => {
    axios
      .get(`https://api.twitch.tv/helix/channels?broadcaster_id=${process.env.CHANNEL_ID}`, {
        headers: {
          "Authorization": `Bearer ${req.session.token}`,
          "Client-Id": `${process.env.TWITCH_CLIENT_ID}`
        }
      })
      .then(({ data }) => {
        res.json(data);
      })
      .catch(err => {
        res.json(err);
      })
  })

router.route("/subscriptions")
  .get(async (req, res) => {
    const data = await getLatestSub(req, res, "");
  })

router.route("/getUserProfile")
  .get((req, res) => {
    axios.get(`https://api.twitch.tv/helix/users?login=${req.query.login}`, {
      headers: {
        "Authorization": `Bearer ${req.session.token}`,
        "Client-Id": `${process.env.TWITCH_CLIENT_ID}`
      }
    })
      .then(({ data }) => {
        res.json(data);
      })
      .catch(err => {
        res.json(err);
      })
  })

const getLatestSub = async (req, res, pagination) => {
  let data;
  if (pagination) {
    data = await axios.get(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${process.env.CHANNEL_ID}&after=${pagination}&first=100`, {
      headers: {
        "Authorization": `Bearer ${req.session.token}`,
        "Client-Id": `${process.env.TWITCH_CLIENT_ID}`
      }
    })
  } else {
    data = await axios.get(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${process.env.CHANNEL_ID}&first=100`, {
      headers: {
        "Authorization": `Bearer ${req.session.token}`,
        "Client-Id": `${process.env.TWITCH_CLIENT_ID}`
      }
    })
  }
  subscriberList = [...subscriberList, ...data.data.data];
  if (data.data.pagination.cursor) {
    pagination = data.data.pagination.cursor;
    getLatestSub(req, res, pagination);
  } else {
    return res.json(subscriberList[subscriberList.length - 2]);
  }
}
module.exports = router;