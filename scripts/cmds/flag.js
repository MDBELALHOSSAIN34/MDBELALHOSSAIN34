const axios = require("axios");

const USAGE_LIMIT = 15;
const RESET_TIME = 7 * 60 * 60 * 1000; // 7 hours

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "flaggame",
    aliases: ["flag"],
    version: "1.7",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "game",
    guide: {
      en: "{pn} - Guess the flag to earn coins and XP!"
    }
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    const { flag, author } = Reply;
    const getCoin = 500;
    const getExp = 121;
    const userData = await usersData.get(event.senderID);

    if (event.senderID !== author) {
      return api.sendMessage("⚠️ | Ei challenge ta tomar na, baby! 🐸", event.threadID, event.messageID);
    }

    const reply = event.body.toLowerCase();
    await api.unsendMessage(Reply.messageID);

    if (reply === flag.toLowerCase()) {
      userData.money += getCoin;
      userData.exp += getExp;
      await usersData.set(event.senderID, userData);

      return api.sendMessage(
        `✅ | 𝐂𝐨𝐫𝐫𝐞𝐜𝐭 𝐀𝐧𝐬𝐰𝐞𝐫! 🥳\n━━━━━━━━━━━━━━\n🏅 𝐑𝐞𝐰𝐚𝐫𝐝𝐬:\n➤ 💰 +${getCoin} coins\n➤ ✨ +${getExp} exp\n━━━━━━━━━━━━━━\nKeep playing and become the Flag Master! 🏆`,
        event.threadID,
        event.messageID
      );
    } else {
      return api.sendMessage(
        `❌ | 𝐖𝐫𝐨𝐧𝐠 𝐀𝐧𝐬𝐰𝐞𝐫! 😢\n━━━━━━━━━━━━━━\n💡 Correct answer was: 🌍 ${flag}\n━━━━━━━━━━━━━━\nTry again next time, explorer! 🧭`,
        event.threadID,
        event.messageID
      );
    }
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const userData = await usersData.get(event.senderID) || {};
      const now = Date.now();

      // Initialize or reset usage tracking
      if (!userData.flagGameUsage) {
        userData.flagGameUsage = {
          count: 0,
          lastReset: now
        };
      }

      if (now - userData.flagGameUsage.lastReset >= RESET_TIME) {
        userData.flagGameUsage.count = 0;
        userData.flagGameUsage.lastReset = now;
      }

      // Limit check
      if (userData.flagGameUsage.count >= USAGE_LIMIT) {
        const remainingTime = RESET_TIME - (now - userData.flagGameUsage.lastReset);
        const minutes = Math.ceil(remainingTime / (60 * 1000));
        return api.sendMessage(
          `⏳ | 𝐋𝐢𝐦𝐢𝐭 𝐫𝐞𝐚𝐜𝐡𝐞𝐝!\n━━━━━━━━━━━━━━\nYou’ve played this game 15 times already.\nPlease wait ${minutes} more minutes to play again.\n━━━━━━━━━━━━━━\n🎮 Keep your mind sharp, champ!`,
          event.threadID,
          event.messageID
        );
      }

      // Increase usage count and save
      userData.flagGameUsage.count += 1;
      await usersData.set(event.senderID, userData);

      // Fetch and send flag
      const apiUrl = await baseApiUrl();
      const response = await axios.get(`${apiUrl}/api/flag`, {
        responseType: "json",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const { link, country } = response.data;
      const imageStream = await axios({
        method: "GET",
        url: link,
        responseType: "stream",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      api.sendMessage(
        {
          body: "🌍 | 𝐅𝐥𝐚𝐠 𝐆𝐚𝐦𝐞 𝐓𝐢𝐦𝐞!\n━━━━━━━━━━━━━━\nCan you guess the name of this country’s flag?\nReply within 40 seconds to answer! ⏱️",
          attachment: imageStream.data
        },
        event.threadID,
        (error, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            flag: country
          });

          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 40000);
        },
        event.messageID
      );
    } catch (error) {
      console.error(`Error: ${error.message}`);
      api.sendMessage(
        `🚨 | 𝐄𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝:\n${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
