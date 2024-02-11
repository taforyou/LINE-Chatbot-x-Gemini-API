/* eslint-disable max-len */
const axios = require("axios");

const LINE_HEADER = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`,
};

const getImageBinary = async (messageId) => {
  const originalImage = await axios({
    method: "get",
    headers: LINE_HEADER,
    url: `https://api-data.line.me/v2/bot/message/${messageId}/content`,
    responseType: "arraybuffer",
  });
  return originalImage.data;
};

const reply = (token, payload) => {
  return axios({
    method: "post",
    url: "https://api.line.me/v2/bot/message/reply",
    headers: LINE_HEADER,
    data: {replyToken: token, messages: payload},
  });
};

const quickReply = (token) => {
  return axios({
    method: "post",
    url: "https://api.line.me/v2/bot/message/reply",
    headers: LINE_HEADER,
    data: {replyToken: token, messages: [{
      type: "text",
      text: "อยากให้ผมทำอะไรกับรูปภาพ ? ครับ",
      quickReply: { // 2
        "items": [
          {
            "type": "action",
            // "imageUrl": "https://source.unsplash.com/random/15×15",
            "action": {
              "type": "postback",
              "label": "Analyze",
              "data": "analyze",
            },
          },
          {
            "type": "action",
            // "imageUrl": "https://source.unsplash.com/random/15×15",
            "action": {
              "type": "postback",
              "label": "Describe",
              "data": "describe",
            },
          },
          {
            "type": "action",
            // "imageUrl": "https://source.unsplash.com/random/15×15",
            "action": {
              "type": "postback",
              "label": "Extract",
              "data": "extract",
            },
          },
        ]},
    }]},
  });
};

module.exports = {getImageBinary, reply, quickReply};
