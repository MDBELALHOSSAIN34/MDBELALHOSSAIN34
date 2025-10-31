const request = require("request");
const fs = require("fs");
const axios = require("axios");

module.exports = {
  config: {
    name: "random",
    version: "0.0.2",
    permission: 0,
    credits: "XNil",
    description: "rndm video",
    category: "media",
    usages: "[name]",
    cooldowns: 5,
  },
  onStart: async function ({ api, message, args }) {
    const nameParam = args.join(" ");

    if (!nameParam) {
      return message.reply(`[ ! ] Input Name.\nEx: ${global.GoatBot.config.prefix}rndm abir`);
    }

    try {
      const apis = await axios.get('https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json');
      const n = apis.data.api;
      const res = await axios.get(`${n}/random?name=${encodeURIComponent(nameParam)}`);

      const videoUrl = res.data.data.url;
      const name = res.data.data.name;
      const cp = res.data.data.cp;
      const ln = res.data.data.length;
      const filePath = `${__dirname}/cache/video.mp4`;

      const file = fs.createWriteStream(filePath);
      request(videoUrl)
        .pipe(file)
        .on("close", () => {
          message.reply({
            body: `${cp}\n\n𝐓𝐨𝐭𝐚𝐥 𝐕𝐢𝐝𝐞𝐨𝐬: [${ln}]\n𝐀𝐝𝐝𝐞𝐝 𝐓𝐡𝐢𝐬 𝐕𝐢𝐝𝐞𝐨 𝐓𝐨 𝐓𝐡𝐞 𝐀𝐩𝐢 𝐁𝐲 [${name}]`,
            attachment: fs.createReadStream(filePath)
          }, () => fs.unlinkSync(filePath));
        });

    } catch (err) {
      console.error(err);
      return message.reply("Something went wrong. Please try again later.");
    }
  }
};
