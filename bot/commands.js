module.exports = async function (client, db) {
  // global command list
  const list = {};
  const axios = require("axios");
  require("dotenv").config();

  // track shoutouts
  const shoutoutQueue = [];
  let shoutoutInProgress = false;
  console.log("Listening to chat...");

  const customCommands = async () => {
    let counters = await db.Counter.find({});
    const commands = await db.Command.find({});
    for (let i = 0; i < commands.length; i++) {
      list[commands[i].name.replace("!", "")] = (channel, userstate, message, self) => {
        if (userstate.username === "derpbothk") return;
        const sender = userstate["display-name"];
        const target = message.split(" ")[1];
        const command = message.split(" ")[0].toLowerCase();
        if (command === commands[i].name) {
          // parse message
          let msg = commands[i].message;
          if (msg.indexOf("${sender}") > -1) {
            msg = msg.replace(/\$\{sender\}/g, sender);
          }
          if (msg.indexOf("${target}") > -1) {
            msg = msg.replace(/\$\{target\}/g, target)
          }
          // rng parsing
          while (msg.indexOf("${rng") > -1) {
            const rng = msg.slice(msg.indexOf("[", msg.indexOf("${rng")) + 1, msg.indexOf("]", msg.indexOf("${rng")));
            const [min, max] = rng.split("-");
            let num;
            if (!isNaN(min)) {
              num = Math.floor(Math.random() * max) + parseInt(min);
              if (isNaN(num)) {
                num = Math.ceil(Math.random() * min);
              }
              msg = msg.replace("${rng[" + rng + "]}", num);
            } else {
              break;
            }
          }
          // array parsing
          while (msg.indexOf("${array") > -1) {
            const temp = msg.slice(msg.indexOf("[", msg.indexOf("${array")) + 1, msg.indexOf("]", msg.indexOf("${array")));
            const array = temp.split(", ");
            msg = msg.replace("${array[" + temp + "]}", array[Math.floor(Math.random() * array.length)]);
          }
          while (msg.indexOf("${count") > -1) {
            const temp = msg.slice(msg.indexOf("[", msg.indexOf("${count")) + 1, msg.indexOf("]", msg.indexOf("${count")));
            // update counter list
            counters = counters.map(counter => {
              console.log("map", counter);
              if (counter.name === temp) {
                counter.count = counter.count + 1;
              }
              return counter;
            })
            const counter = counters.find(counter => counter.name === temp) || {};
            // update db
            db.Counter.updateOne({ name: temp }, { $set: { count: counter.count } }).then(data => {
              console.log("counter updated");
            })
              .catch(() => {
                client.say(`This command no longer works because the counter, '${temp}', doesn't exist.`)
              })
            msg = msg.replace("${count[" + temp + "]}", counter.count || null);
          }
          // api fetch
          if (msg.indexOf("${fetch") > -1) {
            const url = msg.slice(msg.indexOf("[", msg.indexOf("${fetch")) + 1, msg.indexOf("]", msg.indexOf("${fetch")));
            console.log(url);
            axios.get(url, {
              headers: {
                "Accept": "text/plain",
                "User-Agent": "DerpBotHK/twitch"
              }
            }).then(({ data }) => {
              console.log(data);
              msg = msg.replace("${fetch[" + url + "]}", data);
              client.say("derpwinhk", msg);
            }).catch(err => { console.log("error") });
          } else {
            client.say("derpwinhk", msg);
          }
        }
      };
      client.on("chat", list[commands[i].name.replace("!", "")]);
    }
    return true;
  }

  const refreshCommands = async () => {
    const currentEvents = client.listeners("chat");
    for (let i = 0; i < currentEvents.length; i++) {
      client.off("chat", currentEvents[i]);
    }
    await customCommands();
    await defaultCommands();
    return true;
  }

  // set up default commands
  const defaultCommands = async () => {
    client.on("chat", (channel, userstate, message, self) => {
      if (userstate.username === "derpbothk") return;

      // get command
      const command = message.split(" ")[0].toLowerCase();
      const sender = userstate["display-name"];
      const target = message.split(" ")[1];
      switch (command) {
        case "!counter":
          const variation = message.split(" ")[1].toLowerCase() || "";
          const counterName = message.split(" ")[2].toLowerCase() || "";
          switch (variation) {
            case "add":
              const data = {
                name: counterName,
                count: 0
              };
              db.Counter.create(data)
                .then(() => {
                  client.say("derpwinhk", `@${sender}, a new counter has been created: ${counterName}`);
                  refreshCommands();
                })
                .catch(() => {
                  client.say("derpwinhk", `@${sender}, uhhh... that counter already exists.`);
                })
              break;
            case "reset":
              db.Counter.updateOne({ name: counterName }, { $set: { count: 0 } })
                .then(() => {
                  client.say("derpwinhk", `@${sender}, a counter has been reset: ${counterName}`);
                  refreshCommands();
                })
                .catch(() => {
                  client.say("derpwinhk", `@${sender}, stop trying to reset something that doesn't exist!`)
                })
              break;
            case "delete":
              db.Counter.deleteOne({ name: counterName })
                .then(() => {
                  client.say("derpwinhk", `@${sender}, a counter has been deleted: ${counterName}`);
                  refreshCommands();
                })
                .catch(() => {
                  client.say("derpwinhk", `Sure, @${sender}. Let's delete a counter that didn't exist to begin with.`)
                })
              break;
            default:
          }
          break;
        case "!command":
        case "!cmd":
          // check if moderator or broadcaster
          if (checkMod(userstate)) {
            // get variation
            const variation = message.split(" ")[1].toLowerCase() || "";
            const cmdName = message.split(" ")[2].toLowerCase() || "";
            const cmdMsg = message.slice(message.indexOf(cmdName) + cmdName.length + 1, message.length);
            switch (variation) {
              case "add":
                if (cmdName && cmdMsg) {
                  if (cmdMsg.indexOf("${count")) {
                    const counter = cmdMsg.slice(cmdMsg.indexOf("[", cmdMsg.indexOf("${count")) + 1, cmdMsg.indexOf("]", cmdMsg.indexOf("${count")));
                    db.Counter.create({ name: counter, count: 0 }).catch(() => { console.log("counter already exists.") })
                  }
                  const data = {
                    name: cmdName,
                    message: cmdMsg
                  }
                  db.Command.create(data)
                    .then(() => {
                      client.say("derpwinhk", `@${sender}: ${cmdName} is obviously the newest and most fetch command! derpwi2Love`);
                      refreshCommands();
                    })
                    .catch(() => {
                      client.say("derpwinhk", `@${sender}: ${cmdName} is already a command! Ugh, you're so stupid! derpwi2Brows`);
                    })
                }
                break;
              case "edit":
                if (cmdName && cmdMsg) {
                  db.Command.updateOne({ name: cmdName }, { $set: { message: cmdMsg } })
                    .then((data) => {
                      if (data.modifiedCount === 0) {
                        client.say("derpwinhk", `@${sender}: ${cmdName} doesn't even exist. On a scale of 1 to even, I can't with you. derpwi2Brows`)
                      } else {
                        client.say("derpwinhk", `@${sender}: ${cmdName} is even more fetch than before! derpwi2Love`);
                        refreshCommands();
                      }
                    })
                    .catch((err) => {
                      console.log(err);
                    })
                }
                break;
              case "delete":
                if (cmdName) {
                  db.Command.deleteOne({ name: cmdName })
                    .then((data) => {
                      if (data.deletedCount === 0) {
                        client.say("derpwinhk", `@${sender}: ${cmdName} isn't even a command. What's wrong with you? derpwi2Brows`);
                      } else {
                        client.say("derpwinhk", `@${sender}: ${cmdName} is such a lame command, let's add it to the burn book. derpwi2Gasp`);
                        refreshCommands();
                      }
                    })
                    .catch((err) => {
                      console.log(err);
                    })
                }
                break;
            }
          }
          break;
        case "!shoutout":
        case "!so":
          if (target && checkMod(userstate)) {
            let message = "";
            const link = `twitch.tv/${target.replace("@", "").toLowerCase()}`

            switch (target.replace("@", "").toLowerCase()) {
              case "narcissus293":
                message = `A.S.M.R Daddy has arrived! Be careful, or his voice will drown you like a dark river. We don't kink shame, though, so drown @ ${link}`;
                break;
              case "djpyroglyphix":
                message = `The lovely Ferny Fern just trance-planted. His music leaves you uprooted and ready to bloom! Tune in @ ${link}`;
                break;
              case "swearyprincess":
                message = `Life begins at 1(40), but her love transcends infinity. This lovely princess' can make the energy on the dance floor explode! Give her a follow @ ${link}`;
                break;
              case "daffie___":
                message = `Did you know? In China, Daffies symbolize good fortune. Give this auspicious flower a follow @ ${link}`;
                break;
              case "eloiserxdj":
                message = `3, 2, 1, SHOT TIME! One of my bestest friend on Twitch who plays amazing vocal trance! Tune in @ ${link}`;
                break;
              case "bootey":
                message = `It's a bat, it's a man, no, it's a beard, wait, it's a chicken, I mean, it's Bootey! Give him a follow for smashing tunes @ ${link}`;
                break;
              case "rjayker":
                message = `One of the biggest tech trance influencers in my life, so if you like hammers & slammers, give Rjayker a follow @ ${link}`;
                break;
              case "djstevebradley":
                message = `Yo-ho-ho! Going hard takes form in djstevebradley! Whether it's drinks, music or pirate-stuff, it's ALL HARD @ ${link}`;
                break;
              case "gavcrayton_dj":
                message = `Colorful tunes all around, from trance to hard house, give it up for Gav and follow him @ ${link}`;
                break;
              case "tronedj":
                message = `I mustache you a question, have you been following the mo? No? Well, do it now and thank me later: ${link}`;
                break;
              case "djandygolden":
                message = `Quack quack quack, quack quack-quack! (Translation: Please give Ducky Golden a follow) @ ${link}`;
                break;
              case "darksin":
                message = `If you're not already following Sinny, then you're muzzing out! Give this legend a follow @ ${link}`;
                break;
              case "djwillshake":
                message = `DerpwinHK is obsessed with this guy, so he's probably worth following @ ${link}`;
                break;
              case "ausmosiswho":
                message = `This is PeiPei Mabilz' alter-ego; you won't regret following @ ${link}`;
                break;
              case "poizonazn":
                message = `If your poison is pro dbd killer shenanigans, get your fix @ ${link}`;
                break;
              case "rtec_music":
                message = `The Booze Cult Leader welcomes you with an open bar, get your free drinks @ ${link}`;
                break;
              case "huushidoh":
                message = `Who she, though? Huushi Doh! Exactly. Find out @ ${link}`;
                break;
              case "scrubtasticily":
                message = `It's scrufftasticily! Give him a follow for some pro dbd survivor plays @ ${link}`;
                break;
              case "trancebears":
                message = `Who doesn't like bears? They're adorable, especially trancebears! Give them a follow @ ${link}`;
                break;
              case "lsoinferno":
                message = `This DJ brings the heat to the dance floor with his amazing tunes, check him out @ ${link}`;
                break;
              case "leipzigmusicstation":
                message = `Tune into LeipzigMusicStation for gummibaers and awesome music @ ${link}`;
                break;
              case "boybluelondon":
                message = `BoyBlueLondon is an amazing person and one of the people who encouraged me to start streaming on twitch, so give him a follow @ ${link}`;
                break;
              case "bigredexpress":
                message = `bigredexpress is one of the most wholesome and nicest people I've ever met on Twitch, so follow her @ ${link}`;
                break;
              case "synthxiii":
                message = `An amazing variety streamer with lots of artistic talent! Follow him for drag, art, gaming and more @ ${link}`;
                break;
              default:
                message = `Hey everyone, check out ${target} for some amazing content @ ${link}! derpwi2Love`;
            }
            shoutoutQueue.push(message);
            if (!shoutoutInProgress) {
              shoutout();
            }
          }
          break;
      }
    })

    const checkMod = userstate => {
      if (userstate.badges.broadcaster || userstate.badges.moderator) {
        return true;
      } else {
        return false;
      }
    }

    const shoutout = () => {
      if (shoutoutQueue.length > 0 && !shoutoutInProgress) {
        shoutoutInProgress = true;
        const message = shoutoutQueue.shift();
        client.say("derpwinhk", message);
        setTimeout(() => {
          shoutoutInProgress = false;
          if (shoutoutQueue.length > 0) {
            shoutout();
          }
        }, 7000)
      }
    }
    return true;

  }

  // load commands
  defaultCommands();
  customCommands();
}