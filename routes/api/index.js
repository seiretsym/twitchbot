const router = require('express').Router();
const twitch = require("./twitch");

router.use("/twitch", twitch);

module.exports = router;