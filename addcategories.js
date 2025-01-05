const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("");
const model = genAI.getGenerativeModel({
  model: "models/gemini-1.5-flash-8b",
});

let count = 0;

async function determineCategoryWithGemini(title, summary) {
  const prompt = `You are an expert in classifying amendments from the French National Assembly. Based on the title and summary provided, classify the amendment into one of the following categories. Return only the category number (0-7) as your response. If the category is unclear, return -1.

**Categories:**
0 = impôts
1 = retraite
2 = santé
3 = social
4 = emploi
5 = logement
6 = environnement
7 = finance

**Title:**
${title}

**Summary:**
${summary}

**Category Number:**`;

  try {
    count++;
    // await new Promise((resolve) => setTimeout(resolve, 500));
    if (count % 14 === 0) {
      console.log("Waiting for Gemini rate limit...");
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
    console.log("Generating content with Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    const category = parseInt(text);
    console.log(`Gemini response: ${category}`);
    if (!isNaN(category) && category >= 0 && category <= 7) {
      return category;
    }
    return -1;
  } catch (error) {
    console.error("Error determining category with Gemini:", error);
    return -1;
  }
}

async function processVotesFile(votesFilePath) {
  const votesContent = fs.readFileSync(votesFilePath, "utf8");
  const votes = JSON.parse(votesContent);

  for (const scrutin of votes) {
    const { title, summary } = scrutin;
    scrutin.category = await determineCategoryWithGemini(title, summary);
  }

  const outputFilePath = path.join(
    path.dirname(votesFilePath),
    "cards_with_category.json"
  );
  fs.writeFileSync(outputFilePath, JSON.stringify(votes, null, 2));
  console.log(`Categories added and saved to ${outputFilePath}`);
}

async function main() {
  const votesFilePath = "./cards.json";
  if (!fs.existsSync(votesFilePath)) {
    console.error(`File not found: ${votesFilePath}`);
    return;
  }

  await processVotesFile(votesFilePath);
}

main();