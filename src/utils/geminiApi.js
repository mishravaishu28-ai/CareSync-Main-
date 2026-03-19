import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "./firebaseConfig";
import { addDoc, collection } from "firebase/firestore";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeMessage = async (message, studentData) => {

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
  Detect if the following message shows depression, self-harm, or mental crisis.

  Message: "${message}"

  Reply only YES or NO.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response.text();

  if (response.toLowerCase().includes("yes")) {

    // Send Mental Health Alert
    await addDoc(collection(db, "alerts"), {
      name: studentData.name,
      age: studentData.age,
      bloodGroup: studentData.bloodGroup,
      emergencyPhone: studentData.phone,

      type: "mental",
      priority: "high",
      status: "active",
      createdAt: new Date()
    });

  }
};