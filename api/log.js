// api/log.js - Empfängt Logs vom Minecraft Plugin
// Vercel Serverless Function

const logs = []; // In-Memory für Demo - für Produktion: Vercel KV oder Supabase nutzen

export default function handler(req, res) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // POST: neuen Log empfangen (vom Plugin)
    if (req.method === "POST") {
        const { secret, type, target, moderator, reason, timestamp } = req.body;

        // Secret prüfen
        if (secret !== process.env.MOD_SECRET) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const entry = {
            id: Date.now(),
            type,
            target,
            moderator,
            reason,
            timestamp
        };

        logs.unshift(entry); // Neueste zuerst
        if (logs.length > 500) logs.pop(); // Max 500 Einträge

        return res.status(200).json({ success: true });
    }

    // GET: Logs abrufen (von der Website)
    if (req.method === "GET") {
        const auth = req.headers["authorization"];
        if (auth !== "Bearer " + process.env.WEB_PASSWORD) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        return res.status(200).json({ logs });
    }

    return res.status(405).json({ error: "Method not allowed" });
}
