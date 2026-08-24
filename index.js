require("dotenv").config();

const http = require("http");
const {
  Client,
  GatewayIntentBits
} = require("discord.js");

const PORT = process.env.PORT || 10000;

// Render Web Service
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Discord ElevenLabs bot is running!");
}).listen(PORT, "0.0.0.0", () => {
  console.log(`Web server listening on port ${PORT}`);
});

// Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once("ready", () => {
  console.log(`Discord bot online as ${client.user.tag}`);
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  if (newState.member?.user.bot) return;
  if (oldState.channelId || !newState.channelId) return;

  console.log(
    `${newState.member.displayName} joined ${newState.channel.name}`
  );
});

client.login(process.env.DISCORD_TOKEN);
