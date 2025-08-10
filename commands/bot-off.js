module.exports = {
    execute: async (sock, msg, args, botEnabledGroups) => {
        botEnabledGroups[msg.key.remoteJid] = false;
        await sock.sendMessage(msg.key.remoteJid, { text: "⛔ Bot désactivé dans ce groupe." });
    }
};