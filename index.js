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
    // Créer le dossier session si n'existe pas
    fs.ensureDirSync(config.sessionDir);

    const { state, saveCreds } = await useMultiFileAuthState(config.sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        auth: state,
        printQRInTerminal: false
    });

    if (!sock.authState.creds.registered) {
        const code = await sock.requestPairingCode(config.phoneNumber);
        console.log(`📲 Code de liaison pour ${config.phoneNumber} : ${code}`);
        console.log(`➡ Va sur WhatsApp > Appareils connectés > Lier un appareil > Entrer le code`);
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection }) => {
        if (connection === "open") {
            console.log("✅ NICE-DEV_ASSISTANT connecté à WhatsApp !");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        await handleMessage(sock, msg);
    });
}

startBot();