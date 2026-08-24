const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  StreamType
} = require("@discordjs/voice");require("dotenv").config();

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

    const voiceChannel = newState.channel;

    const memberName =
      newState.member.displayName ||
      newState.member.user.username;

    console.log(`${memberName} joined ${voiceChannel.name}`);

    // Join the voice channel
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false
    });

    // Generate ElevenLabs audio
    const audio = await elevenlabs.textToSpeech.convert(
      "JBFqnCBsd6RMkjVDRZzb",
      {
        text: `Hey ${memberName}! Welcome to the voice channel!`,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128"
      }
    );

    // Collect the MP3 data
    const chunks = [];

    for await (const chunk of audio) {
      chunks.push(chunk);
    }

    const audioBuffer = Buffer.concat(chunks);

    console.log(`Audio received: ${audioBuffer.length} bytes`);

    // Create Discord audio player
    const player = createAudioPlayer();

    const resource = createAudioResource(audioBuffer, {
      inputType: StreamType.Arbitrary
    });

    connection.subscribe(player);

    player.play(resource);

    console.log("Playing ElevenLabs greeting.");

  } catch (error) {
    console.error("VOICE AUDIO ERROR:", error);
  }
});

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
