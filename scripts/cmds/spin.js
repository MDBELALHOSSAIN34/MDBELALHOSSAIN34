module.exports = {
  config: {
    name: "spin",
    version: "2.1",
    author: "sp",
    countDown: 5,
    role: 0,
    description: "Spin and win/loss money. Use '/spin <amount>' or '/spin top'.",
    category: "game",
    guide: { en: "{p}spin <amount>\n{p}spin top" }
  },

  onStart: async function ({ message, event, args, usersData }) {
    const senderID = event.senderID;
    const subCommand = args[0];

    // --- Helper functions ---
    const sendSpinUsage = () => message.reply(
`✦━━━━━━━━━━━━━━━━━✦
🎰 𝗦𝗣𝗜𝗡 𝗚𝗨𝗜𝗗𝗘 🎰
✦━━━━━━━━━━━━━━━━━✦

❌ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗨𝗦𝗔𝗚𝗘 ❌

🎲 Spin with a bet:  /spin <amount>
🏆 See top winners:  /spin top

✨💥 Test your luck and chase the JACKPOT! 💥✨
🎰━━━━━━━━━━━━━━━━━🎰`
    );

    const sendNotEnoughMoney = (balance) => message.reply(
`✦━━━━━━━━━━━━━━━━━✦
❌ 𝗡𝗢𝗧 𝗘𝗡𝗢𝗨𝗚𝗛 𝗠𝗢𝗡𝗘𝗬 ❌
✦━━━━━━━━━━━━━━━━━✦

💰 Your balance: ${balance}$

🎲 Place a smaller bet or earn more coins to spin!
✨ Try your luck again and hit the JACKPOT! ✨
✦━━━━━━━━━━━━━━━━━✦`
    );

    const sendNoWinners = () => message.reply(
`✦━━━━━━━━━━━━━━━━━✦
🏆 𝗧𝗢𝗣 𝗦𝗣𝗜𝗡 𝗟𝗘𝗔𝗗𝗘𝗥𝗕𝗢𝗔𝗥𝗗 🏆
✦━━━━━━━━━━━━━━━━━✦

❌ 𝗡𝗢 𝗦𝗣𝗜𝗡 𝗪𝗜𝗡𝗡𝗘𝗥𝗦 𝗬𝗘𝗧 ❌

🎲 Start spinning now to see your name here!
✨ Your luck could change anytime! ✨
✦━━━━━━━━━━━━━━━━━✦`
    );

    // --- /spin top leaderboard ---
    if (subCommand === "top") {
      const allUsers = await usersData.getAll();
      const top = allUsers
        .filter(u => typeof u.data?.totalSpinWin === "number" && u.data.totalSpinWin > 0)
        .sort((a, b) => b.data.totalSpinWin - a.data.totalSpinWin)
        .slice(0, 10);

      if (!top.length) return sendNoWinners();

      const result = top.map((user, i) => {
        const name = user.name || `User ${user.userID?.slice(-4) || "??"}`;
        return `${i + 1}. ${name} – 💸 ${user.data.totalSpinWin} coins`;
      }).join("\n");

      return message.reply(
`✦━━━━━━━━━━━━━━━━━✦
🏆 𝗧𝗢𝗣 𝗦𝗣𝗜𝗡 𝗪𝗜𝗡𝗡𝗘𝗥𝗦 🏆
✦━━━━━━━━━━━━━━━━━✦

${result.split("\n").map(line => `🎖️ ${line}`).join("\n")}

✨ Keep spinning to see your name here! ✨
✦━━━━━━━━━━━━━━━━━✦`
      );
    }

    // --- /spin <amount> ---
    const betAmount = parseInt(subCommand);
    if (isNaN(betAmount) || betAmount <= 0) return sendSpinUsage();

    const userData = await usersData.get(senderID) || {};
    userData.money = userData.money || 0;
    userData.data = userData.data || {};
    userData.data.totalSpinWin = userData.data.totalSpinWin || 0;

    if (userData.money < betAmount) return sendNotEnoughMoney(userData.money);

    userData.money -= betAmount;

    // --- Spin outcomes with weighted chance ---
    const outcomes = [
      { text: "💥 You lost everything!", multiplier: 0, weight: 30 },
      { text: "😞 You got back half.", multiplier: 0.5, weight: 25 },
      { text: "🟡 You broke even.", multiplier: 1, weight: 20 },
      { text: "🟢 You doubled your money!", multiplier: 2, weight: 15 },
      { text: "🔥 You tripled your bet!", multiplier: 3, weight: 8 },
      { text: "🎉 JACKPOT! 10x reward!", multiplier: 10, weight: 2 }
    ];

    function weightedRandom(outcomes) {
      const totalWeight = outcomes.reduce((sum, o) => sum + o.weight, 0);
      let random = Math.random() * totalWeight;
      for (let o of outcomes) {
        if (random < o.weight) return o;
        random -= o.weight;
      }
      return outcomes[0];
    }

    const resultOutcome = weightedRandom(outcomes);
    const reward = Math.floor(betAmount * resultOutcome.multiplier);
    userData.money += reward;

    if (reward > betAmount) userData.data.totalSpinWin += reward - betAmount;
    await usersData.set(senderID, userData);

    // --- Slot reels effect ---
    const reels = ['🍒','🍋','🍊','🍉','🍇','7️⃣'];
    const spinResult = `${reels[Math.floor(Math.random()*reels.length)]} ${reels[Math.floor(Math.random()*reels.length)]} ${reels[Math.floor(Math.random()*reels.length)]}`;

    return message.reply(
`✦━━━━━━━━━━━━━━━━━✦
🎰 𝗦𝗣𝗜𝗡 𝗧𝗜𝗠𝗘! 🎰
✦━━━━━━━━━━━━━━━━━✦

💥 ${resultOutcome.text.toUpperCase()}
🎰 ${spinResult} 🎰

🎲 𝗕𝗘𝗧     : ${betAmount}$
🤑 𝗬𝗢𝗨 𝗪𝗢𝗡 : ${reward}$
🪙 𝗕𝗔𝗟𝗔𝗡𝗖𝗘 : ${userData.money}$

🔥 Will you hit the JACKPOT next spin?
✨ Keep spinning and test your luck! ✨
✦━━━━━━━━━━━━━━━━━✦`
    );
  }
};
