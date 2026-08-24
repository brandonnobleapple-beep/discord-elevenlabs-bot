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

// Someone joins a voice channel
client.on("voiceStateUpdate", async (oldState, newState) => {
  try {
    if (newState.member?.user.bot) return;
    if (oldState.channelId || !newState.channelId) return;

    const voiceChannel = newState.channel;

    console.log(
      `${newState.member.displayName} joined ${voiceChannel.name}`
    );

  } catch (error) {
    console.error("Voice state error:", error);
  }
});
  try {
    if (newState.member?.user.bot) return;
    if (oldState.channelId || !newState.channelId) return;

    const voiceChannel = newState.channel;

    console.log(
      `${newState.member.displayName} joined ${voiceChannel.name}`
    );

  } catch (error) {
    console.error("Voice state error:", error);
  }
});
  try {
    // Ignore the bot itself
    if (newState.member?.user.bot) return;

    // Only react when someone goes from no voice channel
    // to being in a voice channel.
    if (oldState.channelId || !newState.channelId) return;

    const voiceChannel = newState.channel;

    if (!voiceChannel) return;

    const memberName =
      newState.member.displayName ||
      newState.member.user.username;

    console.log(`${memberName} joined ${voiceChannel.name}`);

    // Join the same voice channel
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false
    });

    // Generate greeting with ElevenLabs
    const audio = await elevenlabs.textToSpeech.convert(
      "JBFqnCBsd6RMkjVDRZzb",
      {
        text: `Hey ${memberName}! Welcome to the voice channel!`,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128"
      }
    );

    // Convert ElevenLabs audio into a Buffer
    const chunks = [];

    for await (const chunk of audio) {
      chunks.push(chunk);
    }

    const audioBuffer = Buffer.concat(chunks);

    // Play audio
    const player = createAudioPlayer();

    const resource = createAudioResource(audioBuffer, {
      inputType: StreamType.Arbitrary
    });

    connection.subscribe(player);
    player.play(resource);

    console.log(`Greeting ${memberName} with ElevenLabs.`);

  } } catch (error) {
  console.error("===== ELEVENLABS ERROR START =====");
  console.error(JSON.stringify(error, null, 2));
  console.error(String(error));
  console.error(error);
  console.error("===== ELEVENLABS ERROR END =====");
}
});

client.login(process.env.DISCORD_TOKEN);
