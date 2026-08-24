require("dotenv").config();

const http = require("http");
const {
  Client,
  GatewayIntentBits
} = require("discord.js");

const PORT = process.env.PORT || 10000;
const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});
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

client.on("voiceStateUpdate", async (oldState, newState) => {
  try {
    if (newState.member?.user.bot) return;
    if (oldState.channelId || !newState.channelId) return;

    const memberName =
      newState.member.displayName ||
      newState.member.user.username;

    console.log(`${memberName} joined ${newState.channel.name}`);
    console.log("Testing ElevenLabs...");

    const audio = await elevenlabs.textToSpeech.convert(
      "JBFqnCBsd6RMkjVDRZzb",
      {
        text: `Hey ${memberName}! Welcome to the voice channel!`,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128"
      }
    );

    let totalBytes = 0;

    for await (const chunk of audio) {
      totalBytes += chunk.length;
    }

    console.log(`ElevenLabs generated ${totalBytes} bytes of audio.`);

  } catch (error) {
    console.error("ELEVENLABS TEST FAILED");
    console.error(error);
  }
});

client.login(process.env.DISCORD_TOKEN);
