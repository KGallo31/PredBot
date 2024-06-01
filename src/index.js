require("dotenv").config();
const { Client, IntentsBitField } = require("discord.js");
const cheerio = require('cheerio');
const fetch = require('node-fetch')

const helpMessage = "Hello, Welcome to PredBot! \n I have a few helpful commands to view some of your Pred account stats \n A few commands to get started are: ?rank, ?last, ?current-total"
const omedaPlayerUrl = "https://omeda.city/players/"


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

const fetchOmedaPage = async (m) => {
  const playerId = getPlayerId(m.author)
  const url = omedaPlayerUrl + playerId
  try {
    const response = await fetch(url)
  } catch (e) {
    throw new Error ('Error fetching URL')
  }
  console.log("here")
  return response
}

const getOmedaPage = async (m) => {
  try {
    const response = await fetchOmedaPage(m)
    if (!response.ok) {
      m.reply("That url stinks")
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const rawHtml = await response.text()
    const loadedHtml = cheerio.load(rawHtml)
  }catch (e) {
    return null
  }
  return loadedHtml
}

const getPlayerRank = async (m) => {
  const omedaPage = await getOmedaPage(m)
  if (omedaPage === null){
    return "lol nah"
  }

  const playerRankText = loadedHtml("span.rank").text()
  const mmrText = loadedHtml("span.profile-mmr").text().trim()
  return `Current rank is: ${playerRankText} & MMR is: ${mmrText}`
}

const readMessage = async (m) => {
  const message = m.content

  const command = message.split("?")[1];

  if(command.includes("help")){
    m.reply(helpMessage)
  }else if (command.includes("rank")){
    m.reply(await getPlayerRank(m))
  } else if (command.includes("last")){
    m.reply(await getLastGameMMR(m))
  }else if (command.includes("current-total")){
    m.reply(await getTotalMMRFromFirstPage())
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
  readMessage(m)
});

client.login( process.env.TOKEN
);
