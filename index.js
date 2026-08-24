const http = require("http");

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Discord ElevenLabs bot is running!");
}).listen(PORT, "0.0.0.0", () => {
  console.log(`Web server listening on port ${PORT}`);
});require("dotenv").config();

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
  NoSubscriberBehavior,
  StreamType
} = require("@discordjs/voice");

const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");

const PORT = process.env.PORT || 3000;
const VOICE_ID = "c6SfcYrb2t09NHXiT80T";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!say ")) return;

  const text = message.content.slice(5).trim();

  if (!text) {
    await message.reply("Please give me something to say.");
    return;
  }

  const voiceChannel = message.member?.voice?.channel;

  if (!voiceChannel) {
    await message.reply("Join a voice channel first!");
    return;
  }

  try {
    await message.reply("Generating speech...");

    const audio = await elevenlabs.textToSpeech.convert(VOICE_ID, {
      text,
      modelId: "eleven_flash_v2_5",
      outputFormat: "mp3_44100_128"
    });

    const audioBuffer = Buffer.from(await new Response(audio).arrayBuffer());

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator
    });

    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play
      }
    });

    const resource = createAudioResource(audioBuffer, {
      inputType: StreamType.Arbitrary
    });

    connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

  } catch (error) {
    console.error("ElevenLabs/Discord voice error:", error);
    await message.reply("I couldn't generate the voice audio.");
  }
});

client.login(process.env.DISCORD_TOKEN);

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain"
  });

  res.end("Discord ElevenLabs bot is running!");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`HTTP server listening on port ${PORT}`);
});
