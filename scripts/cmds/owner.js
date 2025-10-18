const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
	config: {
		name: "owner",
		author: "ShAn",
		role: 0,
		shortDescription: " ",
		longDescription: "",
		category: "admin",
		guide: "{pn}"
	},

	onStart: async function ({ api, event }) {
		try {
			const ownerInfo = {
				name: '★彡 𝙈𝘿 𝘽𝙀𝙇𝘼𝙇 𝙃𝙊𝙎𝙎𝘼𝙄𝙉 彡★',
				gender: '𝗠𝗔𝗟𝗘',
				Birthday: '𝟭𝟯-𝟬𝟵-𝟮𝟬𝟬𝟯',
				religion: '𝗜𝗦𝗟𝗔𝗠',
				hobby: '𝗦𝗟𝗘𝗘𝗣𝗜𝗡𝗚',
				Fb: 'https://www.facebook.com/share/1BfRKCBTd4/',
				Relationship: '𝗦𝗜𝗡𝗚𝗟𝗘',
				Height: '𝟱"𝟯'
			};

			const bold = 'https://drive.google.com/uc?export=download&id=1J4yQ13L2WTpdOuqcP0yEmzULACdwfvnQ';
			const tmpFolderPath = path.join(__dirname, 'tmp');

			if (!fs.existsSync(tmpFolderPath)) {
				fs.mkdirSync(tmpFolderPath);
			}

			const videoResponse = await axios.get(bold, { responseType: 'arraybuffer' });
			const videoPath = path.join(tmpFolderPath, 'owner_video.mp4');

			fs.writeFileSync(videoPath, Buffer.from(videoResponse.data, 'binary'));

			const response = `
◈ 𝖮𝖶𝖭𝖤𝖱 𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖳𝖨𝖮𝖭:\n
 ~Name: ${ownerInfo.name}
 ~Gender: ${ownerInfo.gender}
 ~Birthday: ${ownerInfo.Birthday}
 ~Religion: ${ownerInfo.religion}
 ~Relationship: ${ownerInfo.Relationship}
 ~Hobby: ${ownerInfo.hobby}
 ~Fb: ${ownerInfo.Fb}
 ~Height: ${ownerInfo.Height}
			`;

			await api.sendMessage({
				body: response,
				attachment: fs.createReadStream(videoPath)
			}, event.threadID, event.messageID);
			
			fs.unlinkSync(videoPath);

			api.setMessageReaction('😍', event.messageID, (err) => {}, true);
		} catch (error) {
			console.error('Error in ownerinfo command:', error);
			return api.sendMessage('An error occurred while processing the command.', event.threadID);
		}
	},

	onChat: async function ({ api, event }) {
		if (event.body && event.body.toLowerCase() === "owner") {
			this.onStart({ api, event });
		}
	}
};
