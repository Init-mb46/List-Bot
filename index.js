const {Client, MessageEmbed, Intents, Collection} = require("discord.js");
const fs = require("fs");
const Token = fs.existsSync("./token.json") ? require("./token.json") : process.env.token;
const config = require("./config.json");

const client = new Client({intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS]});
client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));

for (const f of commandFiles) {
    const cmd = require(`./commands/${f}`);
    client.commands.set(cmd.data.name, cmd);
    console.log(`${config.prefix}${cmd.data.name} loaded. Description: ${cmd.data.description}`);
}

async function parseMessage(msg) {
    let args = msg.content.replace(/\s+/g,' ').trim().split(" ");
    let cmdWPref = args.shift().toLowerCase();
    return { args: args, cmdWPref: cmdWPref };
}

async function makeEmbed(title, desc) {
    let embed = new Discord.MessageEmbed()
    return embed.setTitle(title).setDescription(desc);
}

client.on("ready", async () =>{
    console.log(`Bot logged in as ${client.user.username} on ${client.guilds.cache.size} servers.`);
})

client.on("messageCreate", async msg => {
    if (msg.author.bot) return;

    
})