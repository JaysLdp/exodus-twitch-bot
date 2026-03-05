const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

let twitchToken = "";
let postedStreams = new Set();

async function getTwitchToken() {
  const response = await axios.post("https://id.twitch.tv/oauth2/token", null, {
    params: {
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      grant_type: "client_credentials"
    }
  });

  twitchToken = response.data.access_token;
}

async function checkStreams() {
  try {
    const res = await axios.get("https://api.twitch.tv/helix/streams", {
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        "Authorization": `Bearer ${twitchToken}`
      }
    });

    res.data.data.forEach(stream => {
      if (
        stream.title.includes("[EXODUS RP]") &&
        !postedStreams.has(stream.id)
      ) {
        const channel = client.channels.cache.get(CHANNEL_ID);

        const message =
`🔴 **${stream.user_name}** est en live !

🎮 ${stream.title}

👀 ${stream.viewer_count} viewers

https://twitch.tv/${stream.user_login}`;

        channel.send(message);

        postedStreams.add(stream.id);
      }
    });

  } catch (error) {
    console.error("Erreur Twitch:", error.message);
  }
}

client.once("ready", async () => {
  console.log("Bot connecté !");
  await getTwitchToken();

  setInterval(checkStreams, 60000);
});

client.login(DISCORD_TOKEN);
