const config = require("../config");
const fs = require("fs");

let botEnabledGroups = {};

module.exports = async (sock, msg) => {
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const sender = msg.key.participant || from;

    if (!text.startsWith(config.prefix)) return;
    const [command, ...args] = text.slice(config.prefix.length).trim().split(/\s+/);

    if (isGroup && botEnabledGroups[from] === false && command !== "bot-on") return;

    const commandFile = `../commands/${command}.js`;
    if (fs.existsSync(__dirname + "/" + commandFile)) {
        const cmd = require(commandFile);
        await cmd.execute(sock, msg, args, botEnabledGroups);
    } else {
        await sock.sendMessage(from, { text: "❌ Commande inconnue." });
    }
};