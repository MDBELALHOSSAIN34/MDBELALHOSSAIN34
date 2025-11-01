const MAX_BET = 600600060006000000;
const MAX_PLAYS = 220;
const LIMIT_INTERVAL_HOURS = 12;

module.exports = {
  config: {
    name: "triplematch",
    aliases: ["tm", "match3"],
    version: "1.9",
    countDown: 5,
    author: "xnil6x",
    description: "Match 3 random rows, win x1, x2 or JACKPOT with animation",
    category: "game",
    role: 0,
    guide: {
      en: "Usage:\n/tm <bet>\nExample: /tm 5000\n/tm top → Show top players\n\nNote: Max 20 plays per 12 hours"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, senderID, messageID } = event;

    if (args[0]?.toLowerCase() === "top") {
      const allUsers = await usersData.getAll();
      const sorted = allUsers
        .filter(u => u.tmwin1 > 0)
        .sort((a, b) => (b.tmwin1 || 0) - (a.tmwin1 || 0))
        .slice(0, 5);

      if (sorted.length === 0)
        return api.sendMessage("❌ No winners yet!", threadID, messageID);

      let rankText = "🏆 Top 5 TripleMatch Winners:\n\n";
      for (let i = 0; i < sorted.length; i++) {
        const name = sorted[i].name || `User ${sorted[i].userID || "?"}`;
        rankText += `${i + 1}. ${name} — 🏅 ${sorted[i].tmwin1} wins\n`;
      }
      return api.sendMessage(rankText, threadID, messageID);
    }

    const bet = parseInt(args[0]);
    if (isNaN(bet) || bet <= 0)
      return api.sendMessage("⚠️ Invalid bet amount.", threadID, messageID);

    if (bet > MAX_BET)
      return api.sendMessage(`⚠️ Max bet allowed is ${MAX_BET.toLocaleString()}`, threadID, messageID);

    let user = await usersData.get(senderID) || {
      money: 0,
      tmwin1: 0,
      data: {}
    };
    if (!user.data) user.data = {};

    const now = Date.now();
    const lastPlay = user.data.lastTMTime || 0;

    if (now - lastPlay > LIMIT_INTERVAL_HOURS * 60 * 60 * 1000) {
      user.data.tmPlayCount = 0;
      user.data.lastTMTime = now;
    }

    if ((user.data.tmPlayCount || 0) >= MAX_PLAYS) {
      const remainingMs = LIMIT_INTERVAL_HOURS * 60 * 60 * 1000 - (now - lastPlay);
      const remainingMin = Math.ceil(remainingMs / 60000);
      return api.sendMessage(
        `⛔ You've reached the ${MAX_PLAYS} plays limit in ${LIMIT_INTERVAL_HOURS} hours.\n⏳ Try again in ${remainingMin} minutes.`,
        threadID, messageID
      );
    }

    if ((user.money || 0) < bet)
      return api.sendMessage("❌ You don't have enough balance.", threadID, messageID);

    user.data.tmPlayCount = (user.data.tmPlayCount || 0) + 1;
    user.data.lastTMTime = now;

    const emojis = ["✅", "❌"];
    const matchedLines = [];
    const winChance = Math.random();
    let matchCount = winChance <= 0.4 ? Math.floor(Math.random() * 3) + 1 : 0;

    while (matchedLines.length < matchCount) {
      const line = Math.floor(Math.random() * 3);
      if (!matchedLines.includes(line)) matchedLines.push(line);
    }

    const generateRow = (i) =>
      matchedLines.includes(i)
        ? ["✅", "✅", "✅"]
        : Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * 2)]);

    const finalGrid = [generateRow(0), generateRow(1), generateRow(2)];

    const getOrdinal = n => (n === 1 ? "st" : n === 2 ? "nd" : "rd");
    let resultText = "", totalMultiplier = 0;

    // ✅ FIXED: Now checking actual row content for match
    for (let i = 0; i < 3; i++) {
      const row = finalGrid[i];
      const isMatched = row.every(cell => cell === "✅");

      if (isMatched) {
        if (i === 0) {
          resultText += `✅ 1st line matched (x1)\n`;
          totalMultiplier += 1;
        } else if (i === 1) {
          resultText += `✅ 2nd line matched (x2)\n`;
          totalMultiplier += 2;
        } else {
          resultText += `🎉 3rd line matched — JACKPOT (x5)\n`;
          totalMultiplier += 5;
        }
      } else {
        resultText += `❌ ${i + 1}${getOrdinal(i + 1)} line didn't match\n`;
      }
    }

    const wonCoins = bet * totalMultiplier;
    user.money = user.money - bet + wonCoins;

    if (totalMultiplier > 0)
      user.tmwin1 = (user.tmwin1 || 0) + 1;

    await usersData.set(senderID, user);

    const prizeText = totalMultiplier > 0
      ? `💰 Total Prize Multiplier: x${totalMultiplier}\n💰 You won: ${wonCoins.toLocaleString()}`
      : `😢 No match. You lost your bet of ${bet.toLocaleString()}`;

    const playsLeft = MAX_PLAYS - user.data.tmPlayCount;

    const finalAnim = `🎰 FINAL GRID\n\n┌────────────┐
│ ${finalGrid[0][0]} | ${finalGrid[0][1]} | ${finalGrid[0][2]} │
│ ${finalGrid[1][0]} | ${finalGrid[1][1]} | ${finalGrid[1][2]} │
│ ${finalGrid[2][0]} | ${finalGrid[2][1]} | ${finalGrid[2][2]} │
└────────────┘

${resultText}${prizeText}

💵 Balance: ${user.money.toLocaleString()} coins
🕹️ Plays: ${user.data.tmPlayCount}/${MAX_PLAYS} (${playsLeft} left)
`;

    const delay = ms => new Promise(res => setTimeout(res, ms));
    const anim1 = "🎰 Rolling the grid...\n\n┌────────────┐\n│ ⏳ | ⏳ | ⏳ │\n│ ⏳ | ⏳ | ⏳ │\n│ ⏳ | ⏳ | ⏳ │\n└────────────┘";
    const anim2 = `🎰 Rolling the grid...\n\n┌────────────┐\n│ ${finalGrid[0][0]} | ${finalGrid[0][1]} | ${finalGrid[0][2]} │\n│ ⏳ | ⏳ | ⏳ │\n│ ⏳ | ⏳ | ⏳ │\n└────────────┘`;
    const anim3 = `🎰 Rolling the grid...\n\n┌────────────┐\n│ ${finalGrid[0][0]} | ${finalGrid[0][1]} | ${finalGrid[0][2]} │\n│ ${finalGrid[1][0]} | ${finalGrid[1][1]} | ${finalGrid[1][2]} │\n│ ⏳ | ⏳ | ⏳ │\n└────────────┘`;

    api.sendMessage(anim1, threadID, async (err, info) => {
      if (!err && info?.messageID) {
        await delay(1000);
        await api.editMessage(anim2, info.messageID, threadID);
        await delay(1000);
        await api.editMessage(anim3, info.messageID, threadID);
        await delay(1000);
        await api.editMessage(finalAnim, info.messageID, threadID);
      }
    });
  }
};
