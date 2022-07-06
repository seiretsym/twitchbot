console.log("script on")
$.get("./api/twitch/auth/getToken")
  .then((data) => {
    console.log(data);
    getTitle();
  })


function getTitle() {
  $.get("./api/twitch/analytics/game")
    .then(({ data }) => {
      setTitle(data[0].game_name);
    })
}

function setTitle(title) {
  $("#game-title h1").html(title);
}

setInterval(getTitle, 300000);