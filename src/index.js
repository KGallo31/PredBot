require("dotenv").config();
const { Client, IntentsBitField } = require("discord.js");
const cheerio = require('cheerio');

const data = 
{
    "users": [
        {
            "discordUsername": "zxhr",
            "omedaPlayerId": "22a7c07c-60de-4ab0-b0b8-88ec48d2c80a"
        },
        {
            "discordUsername": "kaygees",
            "omedaPlayerId": "eff49d2e-d9bd-41e4-b5bc-e58802a781e6"
        },
        {
            "discordUsername": "billybob1551",
            "omedaPlayerId": "cee38ee8-f8db-458d-9a25-f0ce08f9e438"
        }
    ]
}

async function makeGetRequest(url, m) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      m.reply("That url stinks")
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const rawHtml = await response.text()
    const loadedHtml = cheerio.load(rawHtml)
    const playerRankText = loadedHtml("span.rank").text()
    const mmrText = loadedHtml("span.profile-mmr").text().trim()
    m.reply(`Current rank is: ${playerRankText} & MMR is: ${mmrText}`)
  }catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

const getPlayerId = (author) => {
    const username = author.username.toLowerCase().trim()
    let playerId;
    data.users.forEach(d => {
        if(d.discordUsername.trim().toLowerCase().includes(username)){
            playerId = d.omedaPlayerId;
        }
    })
    return playerId
}

async function GetTotalEntires(m) {
  try {
    const playerId = getPlayerId(m.author);
    const url = `https://omeda.city/players/${playerId}`;
    console.log(url)
    await makeGetRequest(url,m);
  } catch (error) {
    console.log(error)
    m.reply("Oh shit I broke")
  }
}
client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("messageCreate", (m) => {
  if (m.author.bot) {
    return;
  }
  if (m.content.toLowerCase().includes("what's my rank?")){
    GetTotalEntires(m)
  }else{
    m.reply("Ngl you're gonna have to say the magic phrase")
  }
});

client.login( process.env.TOKEN
);
