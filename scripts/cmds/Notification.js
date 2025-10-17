const { getStreamsFromAttachment } = global.utils;

module.exports = {
	config: {
		name: "notification",
		aliases: ["notify", "noti"],
		version: "1.8",
		author: "NTKhang & Modified by You",
		countDown: 5,
		role: 2,
		description: {
			vi: "Gửi thông báo từ admin đến all box",
			en: "Send notification from admin to all box"
		},
		category: "owner",
		guide: {
			en: "{pn} <your message>"
		},
		envConfig: {
			delayPerGroup: 250
		}
	},

	langs: {
		vi: {
			missingMessage: "Vui lòng nhập tin nhắn bạn muốn gửi đến tất cả các nhóm",
			sendingNotification: "Bắt đầu gửi thông báo từ admin bot đến %1 nhóm chat",
			sentNotification: "✅ Đã gửi thông báo đến %1 nhóm thành công",
			errorSendingNotification: "Có lỗi xảy ra khi gửi đến %1 nhóm:\n%2"
		},
		en: {
			missingMessage: "Bby ki ki pathaibo oita bolo 🐸",
			sendingNotification: "Start sending notification from admin bot to %1 chat groups",
			sentNotification: "✅ Sent notification to %1 groups successfully",
			errorSendingNotification: "An error occurred while sending to %1 groups:\n%2"
		}
	},

	onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, getLang }) {
		const permission = global.GoatBot.config.owner;
		if (!permission.includes(event.senderID)) {
			api.sendMessage("Permission denied", event.threadID, event.messageID);
			return;
		}

		const { delayPerGroup } = envCommands[commandName];
		if (!args[0]) return message.reply(getLang("missingMessage"));

		const allThreads = (await threadsData.getAll()).filter(
			t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup
		);

		message.reply(getLang("sendingNotification", allThreads.length));

		const attachment = await getStreamsFromAttachment([
			...event.attachments,
			...(event.messageReply?.attachments || [])
		].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type)));

		let sendSuccess = 0;
		const sendError = [];
		const waitingSend = [];

		const messageBody = args.join(" ");

		for (const thread of allThreads) {
			const groupName = thread.threadName || "this group";
			const formSend = {
				body: `💠 ${groupName} \n — 彡 𝙈𝘿 𝘽𝙀𝙇𝘼𝙇 𝙃𝙊𝙎𝙎𝘼𝙄𝙉 彡:\n\n🔸 \n ${messageBody} \n🔹 `,
				attachment
			};

			try {
				waitingSend.push({
					threadID: thread.threadID,
					pending: api.sendMessage(formSend, thread.threadID)
				});
				await new Promise(resolve => setTimeout(resolve, delayPerGroup));
			} catch (e) {
				sendError.push(thread.threadID);
			}
		}

		for (const sended of waitingSend) {
			try {
				await sended.pending;
				sendSuccess++;
			} catch (e) {
				const { errorDescription } = e;
				if (!sendError.some(item => item.errorDescription == errorDescription)) {
					sendError.push({
						threadIDs: [sended.threadID],
						errorDescription
					});
				} else {
					sendError.find(item => item.errorDescription == errorDescription).threadIDs.push(sended.threadID);
				}
			}
		}

		let msg = "";
		if (sendSuccess > 0)
			msg += getLang("sentNotification", sendSuccess) + "\n";
		if (sendError.length > 0)
			msg += getLang("errorSendingNotification",
				sendError.reduce((a, b) => a + b.threadIDs.length, 0),
				sendError.reduce((a, b) =>
					a + `\n - ${b.errorDescription}\n  + ${b.threadIDs.join("\n  + ")}`, ""));

		message.reply(msg);
	}
};
