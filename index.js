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
  StreamType
} = require("@discordjs/voice");

const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");

const PORT = process.env.PORT || 10000;

const TEXT_CHANNEL_ID = process.env.TEXT_CHANNEL_ID;
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;

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
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once("ready", () => {
  console.log(`Discord bot online as ${client.user.tag}`);
  console.log(`Watching text channel: ${TEXT_CHANNEL_ID}`);
  console.log(`Speaking in voice channel: ${VOICE_CHANNEL_ID}`);
});

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;
    if (message.channel.id !== TEXT_CHANNEL_ID) return;

    const text = message.content.trim();
    if (!text) return;

    console.log(`Speaking: ${text}`);

    const voiceChannel = await client.channels.fetch(VOICE_CHANNEL_ID);

    if (!voiceChannel || !voiceChannel.isVoiceBased()) {
      console.error("VOICE_CHANNEL_ID is not a valid voice channel.");
      return;
    }

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false
    });

    const audio = await elevenlabs.textToSpeech.convert(
      "JBFqnCBsd6RMkjVDRZzb",
      {
        text,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128"
      }
    );

    const player = createAudioPlayer();

    const resource = createAudioResource(audio, {
      inputType: StreamType.Arbitrary
    });

    connection.subscribe(player);
    player.play(resource);

    console.log("Playing ElevenLabs audio.");

  } catch (error) {
    console.error("Speech error:", error);
  }
});

client.login(process.env.DISCORD_TOKEN);
