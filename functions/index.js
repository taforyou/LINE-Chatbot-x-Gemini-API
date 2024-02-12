/* eslint-disable max-len */
const {onRequest} = require("firebase-functions/v2/https");
const line = require("./utils/line");
const gemini = require("./utils/gemini");
const NodeCache = require( "node-cache" );

// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
// const {onDocumentCreated} = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

initializeApp();
const myCache = new NodeCache();

// Define the async function that encapsulates the extracted code
// eslint-disable-next-line require-jsdoc
async function handleChatAndStoreHistory(event) {
  // Send a chat message using `gemini.chat` and await its response
  const msg = await gemini.chat(event.message.text, {});

  // Store the conversation history in Firestore
  await getFirestore()
      .collection(event.source.userId)
      .add({
        history: [
          {
            role: "user",
            parts: event.message.text, // The actual text from the user
          },
          {
            role: "model",
            parts: msg, // The actual response message
          },
        ],
      });

  // Reply via the LINE Messaging API
  await line.reply(event.replyToken, [{type: "text", text: msg}]);
}

exports.webhook = onRequest(async (req, res) => {
  if (req.method === "POST") {
    // console.log("Request headers:", JSON.stringify(req.headers));
    // console.log("req.body.events:", req.body.events);
    const events = req.body.events;
    for (const event of events) {
      switch (event.type) {
        case "postback":
          if (event.postback.data === "analyze") {
            const imageBinary = await myCache.get( "currentImage" );
            const msg = await gemini.multimodal(imageBinary, "Analyze the image and summarize its key elements in a bullet-point list.");
            await line.reply(event.replyToken, [{type: "text", text: msg}]);
          } else if (event.postback.data === "describe") {
            const imageBinary = await myCache.get( "currentImage" );
            const msg = await gemini.multimodal(imageBinary, "Please help describe this Image.");
            await line.reply(event.replyToken, [{type: "text", text: msg}]);
          } else if (event.postback.data === "extract") {
            const imageBinary = await myCache.get( "currentImage" );
            const msg = await gemini.multimodal(imageBinary, "Extract all text from the provided image and present it in a well-formatted JSON structure.");
            await line.reply(event.replyToken, [{type: "text", text: msg}]);
          } else if (event.postback.data === "x3") {
            const imageBinary = await myCache.get( "currentImage" );
            const msg1 = await gemini.multimodal(imageBinary, "Analyze the image and summarize its key elements in a bullet-point list.");
            const msg2 = await gemini.multimodal(imageBinary, "Please help describe this Image.");
            const msg3 = await gemini.multimodal(imageBinary, "Extract all text from the provided image and present it in a well-formatted JSON structure.");
            const msgAll = ["############\n Analyze Result :\n############\n" + msg1, " Describe Result :\n############\n" + msg2, " Extract Result :\n############\n" + msg3].join("\n############\n");
            await line.reply(event.replyToken, [{type: "text", text: msgAll}]);
          }
          break;
        case "message":
          if (event.message.type === "text") {
            try {
              const prevResult = await getFirestore().collection(event.source.userId).limit(1).get();
              // ถามครั้งแรก
              if (prevResult.empty) {
                await handleChatAndStoreHistory(event);
              } else {
                for (const doc of prevResult.docs) {
                  if (doc.updateTime - doc.createTime > 120) {
                    await doc.ref.delete();
                    await handleChatAndStoreHistory(event);
                  } else {
                    const msg = await gemini.chat(event.message.text, doc.data());
                    await line.reply(event.replyToken, [{type: "text", text: msg}]);
                    const pushHistory = doc.data();
                    pushHistory.history.push({role: "user", parts: event.message.text});
                    pushHistory.history.push({role: "model", parts: msg});
                    await doc.ref.update(pushHistory);
                  }
                }
              }
            } catch (error) {
              console.error("An error occurred:", error);
            }
            return res.end();
          }

          if (event.message.type === "image") {
            const imageBinary = await line.getImageBinary(event.message.id);
            await myCache.set( "currentImage", imageBinary, 10000 );
            await line.quickReply(event.replyToken);
            return res.end();
          }

          break;
      }
    }
  }

  return res.send(req.method);
});
