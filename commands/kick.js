module.exports = {
    execute: async (sock, msg, args) => {
        if (!args[0]) {
            await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Utilise: !kick numéro" });
            return;
        }

        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
        const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
        const sender = msg.key.participant || msg.key.remoteJid;

        if (!admins.includes(sender)) {
            await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Seuls les admins peuvent utiliser cette commande." });
            return;
        }

        const number = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        await sock.groupParticipantsUpdate(msg.key.remoteJid, [number], "remove");
        await sock.sendMessage(msg.key.remoteJid, { text: `🚫 Utilisateur ${args[0]} expulsé.` });
    }
};