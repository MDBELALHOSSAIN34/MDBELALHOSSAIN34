const { GoatWrapper } = require('fca-liane-utils');

module.exports = {
  config: {
    name: "info",
    aliases: ["info"],
    author: "ALAMIN 🚀",
    role: 0,
    shortDescription: "Show fancy styled profile",
    longDescription: "Displays a colorful, fancy profile of the owner.",
    category: "profile",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    const time = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });

    const profile = `
╔══════════════════╗
║ 🌈𝗣𝗥𝗢𝗙𝗜𝗟𝗘 𝗢𝗙 𝗕𝗘𝗟𝗔𝗟 🌈 
╠══════════════════╣
║ 👤 Name  : Md.Belal Hossain
║ 🎓 Class  : Moja Kora
║ ⚧ Gender  : Male
║ 🎂 DOB    : 13-09-2003
║ 🩸 Blood  : AB+
║ 📏 Height  : 5.5 ft
║ 📍 Location  : Barisal, Dhaka
║ 🎯 Hobby    : Flirting
║ 💖 Status   : Single
║ 🌐 FB  : Mohammed Belal Hossain
╠══════════════════╣
║ ⏰ Time      : ${time}
╚══════════════════╝
✨💫 Stay Awesome! 💫✨
`;

    api.sendMessage(profile, event.threadID, (err) => {
      if (err) console.error(err);
    });
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
