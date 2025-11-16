const fs = require("fs-extra");
const Canvas = require("canvas");

module.exports = {
  config: {
    name: "gf",
    aliases: ["couple"],
    version: "3.2",
    author: "Rahad",
    countDown: 5,
    role: 0,
    shortDescription: "Couple edit with template background",
    longDescription: "Put profile pictures on given template background",
    category: "funny",
    guide: "{pn} @tag"
  },

  onStart: async function ({ event, api }) {
    try {
      let id1 = event.senderID;
      let id2 = Object.keys(event.mentions)[0];
      if (!id2) 
        return api.sendMessage("❌ | কাউকে mention করো!", event.threadID, event.messageID);

      // Load avatars
      const avatar1 = await Canvas.loadImage(
        `https://graph.facebook.com/${id1}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );
      const avatar2 = await Canvas.loadImage(
        `https://graph.facebook.com/${id2}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );

      // Load background
      const background = await Canvas.loadImage("https://i.imgur.com/iaOiAXe.jpeg");

      // Create canvas
      const canvas = Canvas.createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");

      // Draw background
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // === Avatar 1 (left, 200x200) ===
      ctx.save();
      ctx.beginPath();
      ctx.arc(70 + 100, 110 + 100, 100, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar1, 70, 110, 200, 200);
      ctx.restore();

      // === Avatar 2 (right, 200x200) ===
      ctx.save();
      ctx.beginPath();
      ctx.arc(465 + 100, 110 + 100, 100, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar2, 465, 110, 200, 200);
      ctx.restore();

      // Save
      const path = __dirname + "/cache/gf.png";
      const out = fs.createWriteStream(path);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      out.on("finish", () => {
        api.sendMessage(
          {
            body: `⚡⪼━━━━━━━━━━━━━━⪻⚡
💞 ━━━━『সফল জুটি তৈরি হয়েছে』━━━━ 💞
⚡⪼━━━━━━━━━━━━━━⪻⚡`,
            attachment: fs.createReadStream(path)
          },
          event.threadID,
          () => fs.unlinkSync(path),
          event.messageID
        );
      });
    } catch (err) {
      console.log(err);
      api.sendMessage("❌ | কিছু ভুল হয়েছে!", event.threadID, event.messageID);
    }
  }
};
