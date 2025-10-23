const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "info",
    aliases: ["info"],
    version: "1.0",
    author: "BADHON",
    role: 0,
    shortDescription: {
      en: "Get the Bot information such as uptime, ping, and group info."
    },
    longDescription: {
      en: "Displays bot uptime, ping, and information about the current group."
    },
    category: "Info",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      let imgPath = path.join(__dirname, "botinfo.jpg");
      

      const imageSources = [

        () => {
          const imageUrl = "https://files.catbox.moe/fz1v1w.jpg";
          return axios.get(imageUrl, { responseType: "arraybuffer" })
            .then(response => {
              fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));
              return imgPath;
            });
        },
        

        () => {
          if (fs.existsSync(imgPath)) {
            return Promise.resolve(imgPath);
          }
          return Promise.reject("Local file not found");
        },
        

        () => {
          const fileId = "1gkpMollzPqSrRByClg58EV8LBh-Cj0jH";
          const fileUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
          
          return axios.get(fileUrl, { responseType: "arraybuffer" })
            .then(response => {
              fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));
              return imgPath;
            });
        },
        

        () => {

          const { createCanvas } = require("canvas");
          const canvas = createCanvas(600, 400);
          const ctx = canvas.getContext("2d");
          

          const gradient = ctx.createLinearGradient(0, 0, 600, 400);
          gradient.addColorStop(0, "#3498db");
          gradient.addColorStop(1, "#2c3e50");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 600, 400);
          

          ctx.font = "30px Arial";
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.fillText("BOT INFORMATION", 300, 200);
          

          const buffer = canvas.toBuffer("image/jpeg");
          fs.writeFileSync(imgPath, buffer);
          return imgPath;
        }
      ];


      let imageSourceSuccess = false;
      for (const source of imageSources) {
        try {
          imgPath = await source();
          imageSourceSuccess = true;
          break;
        } catch (err) {
          console.log("Image source failed:", err);

        }
      }

      if (!imageSourceSuccess) {
        throw new Error("All image sources failed");
      }


      const threadInfo = await api.getThreadInfo(event.threadID);
      const threadMem = threadInfo.participantIDs.length;
      const messageCount = threadInfo.messageCount || 0;
      const threadName = threadInfo.threadName || "Unnamed Group";
      const threadID = threadInfo.threadID;
      const adminIDs = threadInfo.adminIDs || [];


      let maleCount = 0, femaleCount = 0;
      for (const user of threadInfo.userInfo) {
        if (user.gender === "MALE") maleCount++;
        else if (user.gender === "FEMALE") femaleCount++;
      }


      let adminNames = "";
      if (adminIDs.length > 0) {
        const adminInfo = await api.getUserInfo(adminIDs.map(a => a.id));
        for (const admin of adminIDs) {
          const name = adminInfo[admin.id]?.name || "Unknown";
          adminNames += `• ${name}\n`;
        }
      }


      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeString = `${hours}Hrs ${minutes}min ${seconds}sec`;


      const timeStart = Date.now();
      await api.sendMessage("𝗖𝗵𝗲𝗰𝗸𝗶𝗻𝗴 𝗕𝗼𝘁'𝘀 𝗜𝗻𝗳𝗼...", event.threadID);
      const ping = Date.now() - timeStart;


      const message = `╭───── 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢 ─────⭓
├─「𝐔𝐏𝐓𝐈𝐌𝐄」
│» ${uptimeString}
├─「𝐏𝐈𝐍𝐆」
│» ${ping}ms
├─「𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎」
│» Name: ${threadName}
│» ID: ${threadID}
│» Members: ${threadMem}
│» Male: ${maleCount} | Female: ${femaleCount}
│» Admins: ${adminIDs.length}
│» Messages: ${messageCount}
╰────────────────────⭓`;


      api.sendMessage(
        {
          body: message,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        (err) => {
 
          if (fs.existsSync(imgPath)) {
            try {
              fs.unlinkSync(imgPath);
            } catch (e) {
              console.error("Error deleting temp image:", e);
            }
          }
          
          if (err) {
            console.error("Error sending message:", err);

            api.sendMessage(message, event.threadID);
          }
        }
      );

    } catch (error) {
      console.error("ERROR in info.js:", error);
      api.sendMessage(`An error occurred: ${error.message}`, event.threadID);
    }
  }
};
