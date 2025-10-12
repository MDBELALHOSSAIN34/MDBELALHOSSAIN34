const fs = require("fs");

module.exports = {
  config: {
    name: "groupstats",
    aliases: ["gs", "botstats"],
    version: "1.1",
    author: "Azad",
    countDown: 5,
    role: 0,
    shortDescription: "Shows bot group count and per-user message stats (fast)",
    longDescription: "Shows bot group count and how many messages each member sent across groups (fast version)",
    category: "info",
    guide: "{p}{n}",
  },

  onStart: async function ({ api, event }) {
    try {
      // Fetch all threads (limit 1000)
      const threads = await api.getThreadList(1000, null, ["inbox"]);
      const groupThreads = threads.filter(thread => thread.isGroup);

      const messageCounts = {};

      // Loop through each group (only last 100 messages per group)
      for (const thread of groupThreads) {
        const messages = await api.getThreadHistory(thread.threadID, 100); // fast: only last 100 messages
        messages.forEach(msg => {
          if (!messageCounts[msg.senderID]) messageCounts[msg.senderID] = 0;
          messageCounts[msg.senderID]++;
        });
      }

      // Fetch user info
      const userIds = Object.keys(messageCounts);
      const usersInfo = await api.getUserInfo(userIds);

      // Top 15 active users
      const topUsers = Object.entries(messageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

      const userList = topUsers.map(([id, count]) => {
        const name = usersInfo[id]?.name || "Unknown";
        return `\n『${name}』 — ${count} messages`;
      });

      const messageText = `🤖 Bot is in ${groupThreads.length} group(s)\n\nTop active users (last 100 messages per group):\n${userList.join('')}`;

      api.sendMessage({ body: messageText }, event.threadID);

    } catch (err) {
      console.error("Error fetching group stats:", err);
      api.sendMessage({ body: "❌ Failed to get group stats." }, event.threadID);
    }
  },
};
