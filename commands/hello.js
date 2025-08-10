module.exports = {
    execute: async (sock, msg) => {
        await sock.sendMessage(msg.key.remoteJid, { text: "👋 Salut, je suis NICE-DEV_ASSISTANT.J'ai été dev par mon maître NICE-DEV 🙂🥈" });
    }
};