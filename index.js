require("dotenv").config();

const http = require("http");
const {
  Client,
  GatewayIntentBits
} = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState
} = require("@discordjs/voice");

const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");

const PORT = process.env.PORT || 10000;

// Render Web Service health server
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Discord ElevenLabs bot is running!");
}).listen(PORT, "0.0.0.0", () => {
  console.log(`Web server listening on port ${PORT}`);
});

// ElevenLabs
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
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

client.login(process.env.DISCORD_TOKEN);
