
import express from "express";
import dotenv from "dotenv";
import { geminiModel } from "./config/genaimodel.js";
import { BASE_PROMPT, getSystemPrompt } from "./prompts.js";
import { basePrompt as nodeBasePrompt } from "./src/defaults/node.js";
import { basePrompt as reactBasePrompt } from "./src/defaults/react.js";
import authRoutes from "./Routes/Auth.js"
import projectRoutes from "./Routes/Project.js"
import { exec } from "child_process";

import cors from "cors";
dotenv.config();
import connectToDb from "./config/db_config.js";
import cookieParser from "cookie-parser";
const app = express();
const port = 5001;

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            // Allow non-browser requests like Postman or server-to-server requests
            return callback(null, true);
        }
        return callback(null, origin); // Allow any origin dynamically
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true, // Allow cookies
};


app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

////////////

////////////

app.post("/api/v1/template", async (req, res) => {
    const prompt = req.body.prompt;
    console.log(prompt);

    const prompts = [
        prompt,
        "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
    ];

    const combinedPrompt = prompts.join("\n");
    console.log("Joined prompt string: ", combinedPrompt);



    try {
        // const result = await geminiModel.generateContent(combinedPrompt);
        // const answer = result.response.text().trim(); // Ensure trimmed output for comparison
        const answer = "react"; // Ensure trimmed output for comparison

        if (answer === "react") {
            console.log("Detected framework: ", answer);

            res.json({
                prompts: [
                    BASE_PROMPT,
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
                ],
                uiPrompts: [reactBasePrompt],
            });
            return;
        }

        if (answer === "node") {
            res.json({
                prompts: [
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
                ],
                uiPrompts: [nodeBasePrompt],
            });
            return;
        }

        res.status(403).json({ message: "You can't access this" });
    } catch (error) {
        console.error("Error generating response:", error.message);
        res.status(500).json({ error: "Failed to generate response" });
    }



})

import fs from 'fs';
import path from 'path';

// import { promisify } from "util";

// const execAsync = promisify(exec); // Convert exec() to a promise-based function

// // ✅ Async function to trigger Python and get response
// const runPythonAndGetResponse = async (cellIndex, res) => {
//     try {
//         // ✅ Execute Python script and wait for it to complete
//         console.log(`🚀 Executing Python: PythonTrigger.py ${cellIndex}...`);
//         const { stdout, stderr } = await execAsync(`python PythonTrigger.py ${cellIndex}`);

//         if (stderr) {
//             console.error("⚠️ Python Error:", stderr);
//             // return res.status(500).json({ error: "Python execution failed", details: stderr });
//         }

//         console.log(`✅ Python Output:\n${stdout}`);

//         // ✅ Dynamically import the output from output-text.js
//         const outputModule = await import("./output-text.js");

//         console.log("Generated response:", outputModule.outputData.text);

//         // ✅ Send response back
//         res.json({ response: outputModule.outputData.text });

//     } catch (error) {
//         console.error("❌ Error executing Python script:", error);
//         // res.status(500).json({ error: "Failed to execute Python script" });
//     }
// };


app.post("/api/v1/chat/", async (req, res) => {
    const messages = req.body.messages;
    console.log("Incoming messages for /chat endpoint:", messages);

    // Extract the content from each message and combine them
    const combinedPrompt = messages.map(msg => msg.content).join("\n") + "\n\n" +
        "You should respond in the below format only, and do NOT add any extra text, " +
        "explanations, or code blocks like ``javascript. Just return the content exactly as requested:\n\n " +
        `Here is an artifact that contains all files of the project visible to you.
  Consider the contents of ALL files in the project.
  
  <genwebArtifact id="project-import" title="Project Files">
  
  <genwebAction type="file" filePath="public/index.html">
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>React App</title>
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>
  </genwebAction>
  </genwebArtifact>`;

    try {
        const result = await geminiModel.generateContent(combinedPrompt);
        const responseText = await result.response.text();

        console.log("Successfully generated response:", responseText);
        res.json({ response: responseText });
    } catch (error) {
        console.error("Error generating content:", error.message);
        res.status(500).json({ error: "Failed to generate content" });
    }

    // console.log("Final Combined Prompt is:", combinedPrompt);

    //   try {
    // Write the combinedPrompt to input-text.js
    // console.log("directory name is : ", "/");
    // const inputFilePath = path.join("./", 'input-text.js');
    // const inputTextContent = `export const inputData = \`${combinedPrompt}\`;`;

    // fs.writeFileSync(inputFilePath, inputTextContent);
    // console.log("Input written to input-text.js");



    // Set the cell index to run (modify as needed)
    // const cellIndex = 8;

    // await runPythonAndGetResponse(cellIndex, res);

    // // Execute Python script with the cell index as an argument
    // exec(`python PythonTrigger.py ${cellIndex}`, (error, stdout, stderr) => {
    //   if (error) {
    //     console.error(`Error executing Python: ${error.message}`);
    //     return;
    //   }
    //   if (stderr) {
    //     console.error(`Python Error: ${stderr}`);
    //     return;
    //   }
    //   console.log(`Python Output:\n${stdout}`);
    // });
    // // Since the output is already written in the file, directly import output-text.js
    // import('./output-text.js').then((outputModule) => {
    //   console.log("Generated response:", outputModule.outputText);
    //   res.json({ response: outputModule.outputText });
    // }).catch((error) => {
    //   console.error("Error importing output-text.js:", error);
    //   res.status(500).json({ error: "Failed to import output-text.js" });
    // });

    //   } catch (error) {
    //     console.error("Error processing request:", error.message);
    //     res.status(500).json({ error: "Failed to generate content" });
    //   }
});







//   app.post("/api/v1/chat/", async (req, res) => {
//     const messages = req.body.messages;
//     console.log("Messages received:", messages);

//     // Extract the content from each message and combine them
//     const combinedPrompt = messages.map(msg => msg.content).join("\n") + "\n\n" +
//         "You should respond in the below format only, and do NOT add any extra text, " +
//         "explanations, or code blocks like ```javascript. Just return the content exactly as requested:\n\n" +
//         `Here is an artifact that contains all files of the project visible to you.
// Consider the contents of ALL files in the project.

// <genwebArtifact id="project-import" title="Project Files">

// <genwebAction type="file" filePath="public/index.html">
// <!DOCTYPE html>
// <html lang="en">
//   <head>
//     <title>React App</title>
//   </head>
//   <body>
//     <div id="root"></div>
//   </body>
// </html>
// </genwebAction>
// </genwebArtifact>`;

//     console.log("Final Combined Prompt is:", combinedPrompt);

//     try {
//         const result = await geminiModel.generateContent(combinedPrompt);
//         const responseText = await result.response.text();

//         console.log("Generated response:", responseText);
//         res.json({ response: responseText });
//     } catch (error) {
//         console.error("Error generating content:", error.message);
//         res.status(500).json({ error: "Failed to generate content" });
//     }

// });





app.use('/api/v1/users', authRoutes);

app.use('/api/v1/project', projectRoutes);

const start = async () => {
    try {
        await connectToDb(process.env.MONGO_URI);
        console.log("DB connection established successfully.");

        app.listen(port, async () => {
            console.log(`Backend is up and running on port ${port}...`);
        });
    } catch (error) {
        console.log(error);
    }
};

start();
