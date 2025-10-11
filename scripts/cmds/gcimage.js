const axios = require("axios");

const baseApiUrl = "https://api-pvn4.onrender.com"; // ⬅️ আপনি এটা render.com এ deploy করেছেন

async function getAvatarUrls(userIDs) {
  let avatarURLs = [];

  for (let userID of userIDs) {
    try {
      const shortUrl = `https://graph.facebook.com/${userID}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const d = await axios.get(shortUrl);
      let url = d.request.res.responseUrl;
      avatarURLs.push(url);
    } catch (error) {
      avatarURLs.push(
        "https://i.ibb.co/qk0bnY8/363492156-824459359287620-3125820102191295474-n-png-nc-cat-1-ccb-1-7-nc-sid-5f2048-nc-eui2-Ae-HIhi-I.png"
      );
    }
  }
  return avatarURLs;
}

module.exports = {
  config: {
    name: "gcimg",
    aliases: ["gcimage", "grpimage"],
    version: "1.2",
    author: "Dipto + ChatGPT",
    countDown: 5,
    role: 0,
    description: "Generate group image with admin/member split view",
    category: "𝗜𝗠𝗔𝗚𝗘",
    guide: "{pn} --admincolor yellow --membercolor skyblue",
  },

  onStart: async function ({ api, args, event, message }) {
    try {
      // Default Colors
      let color = "white";
      let bgColor = "#000000";
      let adminColor = "yellow";
      let memberColor = "skyblue";
      let groupborderColor = "lime";
      let glow = false;

      // Parse CLI args
      for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
          case "--color":
            color = args[i + 1];
            args.splice(i, 2);
            break;
          case "--bgcolor":
            bgColor = args[i + 1];
            args.splice(i, 2);
            break;
          case "--admincolor":
            adminColor = args[i + 1];
            args.splice(i, 2);
            break;
          case "--membercolor":
            memberColor = args[i + 1];
            args.splice(i, 2);
            break;
          case "--groupBorder":
            groupborderColor = args[i + 1];
            args.splice(i, 2);
            break;
          case "--glow":
            glow = args[i + 1];
            args.splice(i, 2);
            break;
        }
      }

      // Group info fetch
      const threadInfo = await api.getThreadInfo(event.threadID);
      const participantIDs = threadInfo.participantIDs;
      const adminIDs = threadInfo.adminIDs.map(admin => admin.id);
      const memberIDs = participantIDs.filter(id => !adminIDs.includes(id));

      // Get avatar images
      const adminURLs = await getAvatarUrls(adminIDs);
      const memberURLs = await getAvatarUrls(memberIDs);

      const payload = {
        groupName: threadInfo.threadName,
        groupPhotoURL: threadInfo.imageSrc,
        adminURLs,
        memberURLs,
        bgcolor: bgColor,
        color: color,
        admincolor: adminColor,
        membercolor: memberColor,
        groupborderColor: groupborderColor,
        glow: glow
      };

      const waiting = await api.sendMessage("⏳ Generating group image...", event.threadID);
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const { data } = await axios.post(`${baseApiUrl}/gcimg`, payload, {
        responseType: "stream"
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      message.unsend(waiting.messageID);

      return message.reply({
        body: "🎉 𝙂𝙧𝙤𝙪𝙥 𝙄𝙢𝙖𝙜𝙚 𝙂𝙚𝙣𝙚𝙧𝙖𝙩𝙚𝙙!",
        attachment: data
      });

    } catch (err) {
      console.error("Error:", err);
      message.reply(`❌ | 𝙴𝚛𝚛𝚘𝚛: ${err.message}`);
    }
  }
};
