const { GoatWrapper } = require('fca-liane-utils');

module.exports = {
  config: {
    name: "info",
    aliases: ["info"],
    author: "Amit Max ⚡",
    role: 0,
    shortDescription: "Show owner's profile",
    longDescription: "Shows a short personal profile of the owner.",
    category: "profile",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    const time = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });

    const profile = `
╔════════════════════
════════════════════╝

║ MY INFORMATION ⚡ ║

║ Name: Md.Belal Hossain⚡  
║ Class: Moja kora ⚡  
║ Gender: Male ⚡
║ DOB: 13-09-2003 ⚡
║ Blood: AB+ ⚡
║ Height: 5.5 ft ⚡
║ Location: Barisal, Dhaka ⚡
║ Hobby: Flirting ⚡
║ Status: Single ⚡
║ FB: Mohammed Belal Hossain ⚡
╔════════════════════
════════════════════╝

⏰ Time: ${time}`;

    api.sendMessage(profile, event.threadID, (err, info) => {
      if (err) return console.error(err);
      setTimeout(() => {
        api.unsendMessage(info.messageID);
      }, 20000); // 300 seconds = 20000 ms
    });
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
