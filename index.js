const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs-extra");
const config = require("./config");
const handleMessage = require("./utils/messageHandler");

async function startBot() {
    // Assurer que le dossier de session existe
    fs.ensureDirSync(config.sessionDir);

    // Charger la session si elle existe
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    // Créer la connexion Baileys
    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        auth: state,
        printQRInTerminal: false
    });

    // Sauvegarder les credentials
    sock.ev.on("creds.update", saveCreds);

    // Gestion de la connexion
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
            console.log("✅ NICE-DEV_ASSISTANT connecté à WhatsApp !");
        }

        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
            if (shouldReconnect) {
                console.log("♻️ Reconnexion...");
                startBot();
            } else {
                console.log("❌ Déconnecté définitivement.");
            }
        }

        // Si on n'est pas encore enregistré, générer le code pairing
        if (!sock.authState.creds.registered && connection === "connecting") {
            try {
                const code = await sock.requestPairingCode(config.phoneNumber);
                console.log(`📲 Code de liaison pour ${config.phoneNumber} : ${code}`);
                console.log("➡ Ouvre WhatsApp > Appareils connectés > Lier un appareil > Entrer le code");
            } catch (err) {
                console.error("⚠️ Erreur génération code pairing :", err.message);
            }
        }
    });

    // Gestion des messages
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        await handleMessage(sock, msg);
    });
}

startBot();
