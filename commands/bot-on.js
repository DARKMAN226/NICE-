module.exports = {
    execute: async (sock, msg, args, botEnabledGroups) => {
        botEnabledGroups[msg.key.remoteJid] = true;
        await sock.sendMessage(msg.key.remoteJid, { text: "✅ Bot activé dans ce groupe." });
    }
};