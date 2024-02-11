/* eslint-disable max-len */
const {GoogleGenerativeAI, HarmBlockThreshold, HarmCategory} = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const textOnly = async (prompt) => {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({model: "gemini-pro"});
  const result = await model.generateContent(prompt);
  return result.response.text();
};

const multimodal = async (imageBinary, prompt) => {
  // For text-and-image input (multimodal), use the gemini-pro-vision model
  const model = genAI.getGenerativeModel({model: "gemini-pro-vision"});
  // const prompt = "Extract all text from the provided image and present it in a well-formatted JSON structure.";
  const mimeType = "image/png";

  // Convert image binary to a GoogleGenerativeAI.Part object.
  const imageParts = [
    {
      inlineData: {
        data: Buffer.from(imageBinary, "binary").toString("base64"),
        mimeType,
      },
    },
  ];

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ];

  const result = await model.generateContent([prompt, ...imageParts], safetySettings);
  const text = result.response.text();
  return text;
};

const chat = async (prompt, chatHistory) => {
  let previousKnownledge = JSON.stringify(chatHistory);
  if (previousKnownledge === "{}") {
    previousKnownledge = {
      history: [
        {
          "role": "user",
          "parts": "Hi",
        },
        {
          "role": "model",
          "parts": "I'm Chom, how may i help you today ?",
        },
      ],
    };
  }
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({model: "gemini-pro"});
  const chat = model.startChat(previousKnownledge);

  const result = await chat.sendMessage(prompt);
  return result.response.text();
};

module.exports = {textOnly, multimodal, chat};
