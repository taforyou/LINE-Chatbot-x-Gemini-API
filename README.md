# LINE Chatbot x Gemini API - taforyou improvement

## Introduction

This project enhances the functionality of a chat application by integrating Firestore for dynamic context awareness, adding quick replies for image requests, and preset prompts for specific actions. Additionally, it utilizes node-cache to temporarily store images awaiting user interaction.

## Features

### Dynamic Context with Firestore

- Firestore Integration: Leverages Firestore to maintain chat history, enabling the application to understand the context dynamically within a defined period (default set to 120 seconds). This feature allows for more meaningful interactions by keeping track of recent exchanges.

### Enhanced User Interactions

- Quick Replies for Images: Implements quick reply functionality when users request images, streamlining the interaction and improving user experience.
- Preset Prompts: Includes predefined prompts for actions such as "Analyze", "Describe", and "Extract", making it easier for users to engage with the application without having to formulate complex commands.

### Temporary Image Storage

- Node-Cache for Temporary Storage: Utilizes node-cache to store temporary images, awaiting postback actions from users. This approach reduces the need for immediate storage solutions and facilitates a smoother user interaction with multimedia content.

## Setup and Testing

- Local Testing: The application has been rigorously tested locally using the Firebase emulator, Cloudflare tunnel, and a personal domain to ensure stability and performance.

## Additional Resources

- For a demonstration of the local testing and deployment process, refer to this tweet by Wes Bos: https://twitter.com/wesbos/status/1634310926219333642

## Live Testing

- Add line OA : @561cepfe and try it by yourself (until free credit is gone)

## Contributing

- Feel free to explore the code, suggest improvements, or contribute to the project. Your feedback and contributions are highly appreciated.