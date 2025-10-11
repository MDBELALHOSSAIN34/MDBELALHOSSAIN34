const axios = require("axios");
const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "spy",
    aliases: ["whoishe", "whoisshe", "whoami", "atake"],
    version: "1.0",
    role: 0,
    author: "Azad",
    Description: "Get user information and profile photo",
    category: "information",
    countDown: 10,
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions)[0];
    let uid;

    if (args[0]) {
      if (/^\d+$/.test(args[0])) {
        uid = args[0];
      } else {
        const match = args[0].match(/profile\.php\?id=(\d+)/);
        if (match) {
          uid = match[1];
        }
      }
    }

    if (!uid) {
      uid =
        event.type === "message_reply"
          ? event.messageReply.senderID
          : uid2 || uid1;
    }

    const response = await axios.get(`${await baseApiUrl()}/baby?list=all`);
    const dataa = response.data || { teacher: { teacherList: [] } };
    let babyTeach = 0;

    if (dataa?.teacher?.teacherList?.length) {
      babyTeach = dataa.teacher.teacherList.find((t) => t[uid])?.[uid] || 0;
    }

    const userInfo = await api.getUserInfo(uid);
    const avatarUrl = await usersData.getAvatarUrl(uid);

    let genderText;
    switch (userInfo[uid].gender) {
      case 1:
        genderText = "👩‍🦰 𝐆𝐢𝐫𝐥";
        break;
      case 2:
        genderText = "👨 𝐁𝐨𝐲";
        break;
      default:
        genderText = "❓ 𝐔𝐧𝐤𝐧𝐨𝐰𝐧";
    }

    const money = (await usersData.get(uid)).money;
    const allUser = await usersData.getAll();
    const rank =
      allUser.slice().sort((a, b) => b.exp - a.exp).findIndex((user) => user.userID === uid) + 1;
    const moneyRank =
      allUser.slice().sort((a, b) => b.money - a.money).findIndex((user) => user.userID === uid) + 1;

    const position = userInfo[uid].type;

    const userInformation = `
╔═══════ 🎯 𝗨𝗦𝗘𝗥 𝗜𝗡𝗙𝗢 🎯 ═══════╗
║ 📛 𝗡𝗮𝗺𝗲: ${userInfo[uid].name}
║ 🚻 𝗚𝗲𝗻𝗱𝗲𝗿: ${genderText}
║ 🆔 𝗨𝗜𝗗: ${uid}
║ 🎖 𝗖𝗹𝗮𝘀𝘀: ${position ? position?.toUpperCase() : "Normal User 🥺"}
║ 🪪 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: ${userInfo[uid].vanity ? userInfo[uid].vanity : "None"}
║ 🌐 𝗣𝗿𝗼𝗳𝗶𝗹𝗲: ${userInfo[uid].profileUrl}
║ 🎂 𝗕𝗶𝗿𝘁𝗵𝗱𝗮𝘆: ${userInfo[uid].isBirthday !== false ? userInfo[uid].isBirthday : "Private"}
║ 🏷 𝗡𝗶𝗰𝗸𝗡𝗮𝗺𝗲: ${userInfo[uid].alternateName || "None"}
║ 🤝 𝗙𝗿𝗶𝗲𝗻𝗱 𝗪𝗶𝘁𝗵 𝗕𝗼𝘁: ${userInfo[uid].isFriend ? "✅ Yes" : "❌ No"}
╚════════════════════════════════╝

╔═══════ 📊 𝗨𝗦𝗘𝗥 𝗦𝗧𝗔𝗧𝗦 📊 ═══════╗
║ 💰 𝗠𝗼𝗻𝗲𝘆: $${formatMoney(money)}
║ 🏆 𝗥𝗮𝗻𝗸: #${rank}/${allUser.length}
║ 💹 𝗠𝗼𝗻𝗲𝘆 𝗥𝗮𝗻𝗸: #${moneyRank}/${allUser.length}
║ 👶 𝗕𝗮𝗯𝘆 𝗧𝗲𝗮𝗰𝗵: ${babyTeach || 0}
╚════════════════════════════════╝
`;

    // প্রথমে তথ্য পাঠানো
    await message.reply(userInformation);

    // তারপর প্রোফাইল পিকচার ক্যাপশন সহ পাঠানো
    message.reply({
      body: `🖼 𝗣𝗿𝗼𝗳𝗶𝗹𝗲 𝗣𝗶𝗰𝘁𝘂𝗿𝗲 𝗼𝗳 ${userInfo[uid].name}`,
      attachment: await global.utils.getStreamFromURL(avatarUrl),
    });
  },
};

function formatMoney(num) {
  const units = ["", "K", "M", "B", "T", "Q", "Qi", "Sx", "Sp", "Oc", "N", "D"];
  let unit = 0;
  while (num >= 1000 && ++unit < units.length) num /= 1000;
  return num.toFixed(1).replace(/\.0$/, "") + units[unit];
}
