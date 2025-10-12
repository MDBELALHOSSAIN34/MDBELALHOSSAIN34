const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const crypto = require("crypto");

const baseApiUrl = async () => {
    const base = await axios.get(
        `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`
    );
    return base.data.api;
};

module.exports = {
    config: {
        name: "pin3",
        aliases: ["pin3"],
        version: "1.3",
        author: "Dipto",
        countDown: 15,
        role: 0,
        shortDescription: "Pinterest Image Search",
        longDescription: "Pinterest Image Search",
        category: "download",
        guide: {
            en: "{pn} query - number",
        },
    },

    onStart: async function ({ api, event, args }) {
        if (!args[0]) {
            return api.sendMessage(
                "❌ | Please provide a search query and limit.\n👉 Example: pin3 cat - 5",
                event.threadID,
                event.messageID
            );
        }

        const queryAndLength = args.join(" ").split("-");
        const q = queryAndLength[0]?.trim();
        const length = queryAndLength[1]?.trim();

        if (!q || !length || isNaN(length)) {
            return api.sendMessage(
                "❌ | Wrong Format!\n👉 Example: pin3 cat - 5",
                event.threadID,
                event.messageID
            );
        }

        try {
            const waitMsg = await api.sendMessage(
                "⏳ | Please wait, fetching images...",
                event.threadID
            );

            const response = await axios.get(
                `${await baseApiUrl()}/pinterest?search=${encodeURIComponent(
                    q
                )}&limit=${encodeURIComponent(length)}`
            );

            const data = response.data.data;

            if (!data || data.length === 0) {
                return api.sendMessage(
                    "⚠️ | No images found.",
                    event.threadID,
                    event.messageID
                );
            }

            const totalImagesCount = Math.min(data.length, parseInt(length));

            // Create a unique temp folder for this request
            const tempDir = path.join(
                __dirname,
                "dvassets",
                `${Date.now()}_${crypto.randomBytes(4).toString("hex")}`
            );
            await fs.ensureDir(tempDir);

            const attachments = [];

            for (let i = 0; i < totalImagesCount; i++) {
                const imgUrl = data[i];
                const imgResponse = await axios.get(imgUrl, { responseType: "arraybuffer" });
                const imgPath = path.join(tempDir, `${i + 1}.jpg`);
                await fs.writeFile(imgPath, imgResponse.data);
                attachments.push(fs.createReadStream(imgPath));
            }

            if (waitMsg?.messageID) await api.unsendMessage(waitMsg.messageID);

            await api.sendMessage(
                {
                    body: `✅ | Here are your images for **${q}**\n🐤 | Total Images: ${totalImagesCount}`,
                    attachment: attachments,
                },
                event.threadID,
                event.messageID
            );

            // Delete the whole temp folder after sending
            fs.remove(tempDir).catch(() => {});
        } catch (error) {
            console.error(error);
            return api.sendMessage(
                `❌ | Error: ${error.message}`,
                event.threadID,
                event.messageID
            );
        }
    },
};
