const fs = require("fs-extra");
const path = require("path");

const settingsPath = path.join(__dirname, "autoreactSettings.json");

module.exports.config = {
  name: "autoreact",
  version: "6.0",
  author: "Alamin x TOM",
  cooldowns: 3,
  role: 0,
  shortDescription: "Smart AutoReact with sentiment detection & personalized reactions",
  longDescription: "Reacts to messages based on emotion with toggle command and personalized text",
  category: "fun"
};

// Read or create settings file
function getSettings() {
  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, JSON.stringify({ enabled: true }, null, 2));
  }
  return JSON.parse(fs.readFileSync(settingsPath));
}

// Save settings
function saveSettings(settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

// ON/OFF command
module.exports.onStart = async function ({ args, message }) {
  const settings = getSettings();

  if (!args[0]) {
    return message.reply(`🔘 TOM AutoReact is currently ${settings.enabled ? "✅ ON" : "❌ OFF"}\nUse:\n➡️ autoreact on / autoreact off`);
  }

  const option = args[0].toLowerCase();

  if (option === "on") {
    settings.enabled = true;
    saveSettings(settings);
    return message.reply("✅ TOM AutoReact is now ON!");
  } else if (option === "off") {
    settings.enabled = false;
    saveSettings(settings);
    return message.reply("❌ TOM AutoReact is now OFF!");
  } else {
    return message.reply("⚠️ Usage: autoreact on / autoreact off");
  }
};

// Chat reaction system with personalized text
module.exports.onChat = async function ({ event, api }) {
  try {
    const settings = getSettings();
    if (!settings.enabled) return;

    const msg = event.body?.toLowerCase();
    if (!msg) return;

    let emoji = null;
    let text = null;

    // ❤️ Love / Miss
    if (/(love|miss|missing|bhalobashi)/i.test(msg)) {
      emoji = ["❤️","😍","😘","💋"];
      text = "TOM reacted with";
    }
    // 😢 Sad / Hurt
    else if (/(sad|hurt|cry|lonely|broken)/i.test(msg)) {
      emoji = ["😢","😭","🥺","💔"];
      text = "TOM reacted with";
    }
    // 😂 Funny / Laugh
    else if (/(funny|lol|haha|🤣|hahaha)/i.test(msg)) {
      emoji = ["😂","🤣","😆","😹"];
      text = "TOM is laughing with you";
    }
    // 😠 Angry / Frustrated
    else if (/(angry|frustrated|annoyed|rage)/i.test(msg)) {
      emoji = ["😡","🤬","😠"];
      text = "TOM reacted with";
    }
    // 😴 Sleep / Tired
    else if (/(sleep|tired|exhausted)/i.test(msg)) {
      emoji = ["😴","💤","🥱"];
      text = "TOM reacted with";
    }
    // 🙏 Thanks / Gratitude
    else if (/(thanks|thank you|grateful)/i.test(msg)) {
      emoji = ["🙏","😊","🤗"];
      text = "TOM reacted with";
    }
    // 👍 OK / Agree
    else if (/(ok|okay|fine|alright|sure)/i.test(msg)) {
      emoji = ["👍","🙂","👌"];
      text = "TOM reacted with";
    }
    // 🥳 Success / Celebration
    else if (/(congrats|congratulations|success|win|achieved)/i.test(msg)) {
      emoji = ["🥳","🎉","💪","🏆"];
      text = "TOM celebrated with";
    }
    // 🤔 Thinking / Question
    else if (/(why|what|how|thinking|question|wonder)/i.test(msg)) {
      emoji = ["🤔","🧐","😕"];
      text = "TOM reacted with";
    }
    // 😎 Default
    else {
      emoji = ["🙂","😄","🤗","😎"];
      text = "TOM reacted with";
    }

    const randomEmoji = emoji[Math.floor(Math.random() * emoji.length)];

    // Send reaction
    api.setMessageReaction(randomEmoji, event.messageID, event.threadID, (err) => {
      if (err) console.error("Reaction error:", err);
      else {
        // Send personalized text along with emoji
        api.sendMessage(`${text} ${randomEmoji}!`, event.threadID, event.messageID);
      }
    });

  } catch (error) {
    console.error("Smart AutoReact Error:", error);
  }
};
