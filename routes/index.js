const router = require('express').Router();
const path = require('path');
const api = require("./api");

// connect api routes
router.use("/api", api);

// connect scene overlays
router.use("/game_scene", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/game_scene.html"));
});
router.use("/game_charity_scene", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/game_charity_scene.html"));
});
router.use("/intermission_scene", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/intermission_scene.html"));
});
router.use("/intermission_charity_scene", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/intermission_charity_scene.html"));
});
router.use("/dj_scene", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dj_scene.html"));
});
router.use("/dj_charity_scene", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dj_charity_scene.html"));
});

// export routes
module.exports = router;