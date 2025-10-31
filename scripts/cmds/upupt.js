const os = require("os");

module.exports = {
  config: {
    name: "up",
    version: "2.2",
    author: "xnil6x",
    role: 0,
    shortDescription: "Show bot uptime info",
    longDescription: "Display stylish uptime, system stats, RAM, prefix, threads, etc.",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ message, threadsData }) {
    const uptime = process.uptime();
    const days = Math.floor(uptime / (60 * 60 * 24));
    const hours = Math.floor((uptime % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);
    const seconds = Math.floor(uptime % 60);

    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const cpu = os.cpus()[0].model;
    const cores = os.cpus().length;
    const platform = os.platform();
    const arch = os.arch();
    const nodeVersion = process.version;
    const hostname = os.hostname();

    const totalMem = os.totalmem() / 1024 / 1024;
    const freeMem = os.freemem() / 1024 / 1024;
    const usedMem = totalMem - freeMem;

    const prefix = global.GoatBot.config.PREFIX || "#";
    const totalThreads = await threadsData.getAll().then(t => t.length);
    const totalCommands = global.GoatBot.commands.size;

    const line = "═".repeat(40);
    const box = `
╔═══════════╗
║ ⏰  𝙍𝙊𝘽𝙊𝙏 𝙐𝙋𝙏𝙄𝙈𝙀 ⏰
╠═══════════╣
║⏳𝙐𝙋𝙏𝙄𝙈𝙀: ${uptimeString}
╠═══════════╣
║彡 𝙈𝘿 𝘽𝙀𝙇𝘼𝙇 𝙃𝙊𝙎𝙎𝘼𝙄𝙉 彡
╚═══════════╝`;

    message.reply(box);
  }
};
