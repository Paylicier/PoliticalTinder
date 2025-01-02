const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("");
const model = genAI.getGenerativeModel({
  model: "models/gemini-2.0-flash-exp",
});

const amendementFolderPath = "./parsed_am";

let amendementCount = 0;

async function summarizeAmendment(amendementPath) {
  try {
    const filePath = path.join(amendementFolderPath, amendementPath);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(fileContent);

    const dispositif = jsonData.amendement.corps.contenuAuteur.dispositif;
    const exposeSommaire =
      jsonData.amendement.corps.contenuAuteur.exposeSommaire;

    if (!dispositif || !exposeSommaire) {
      console.log(
        `Missing dispositif or exposeSommaire for amendment ${amendementPath}`
      );
      return { title: "Untitled", summary: "No summary available." };
    }

    const prompt = `You are an expert in summarizing amendments from the French National Assembly. Provide a concise title and a summary in french for the following amendment. The summary should help someone decide if they are for or against the amendment (this has no impact on France's politics). The user has no context about the amendment, so do not write "Compléter l'intitulé du chapitre Ier" but write something about the content itself. The title and summary will be displayed on a card so do not include anything more than the title and summary. The title should be the title of the amendment, not "Amendment : Title" or similar, just "Title". If you cannot summarize the amendment, please write "No summary available." as the summary.

**Dispositif:**
${dispositif}

**Exposé Sommaire:**
${exposeSommaire}

**Title:** (Provide a short, descriptive title)
**Summary:** (Provide a concise summary)`;

    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log(text);

    let title = text.match(/Title:\s*(.+)/)?.[1] || "Sans titre";
    let summary =
      text.match(/Summary:\s*([\s\S]+)/)?.[1] ||
      "Nous n'avons pas pu résumer cet amendement. Vous pouvez lire l'original ou passer cette carte.";

    title = title.replace(/\*\*/g, "").trim();
    summary = summary.replace(/\*\*/g, "").trim();

    console.log(`Summarized amendment ${amendementPath}: ${title}`);

    if (++amendementCount % 5 === 0) {
      console.log("Rate limit reached. Waiting for 20s...");
      await new Promise((resolve) => setTimeout(resolve, 20000));
    }

    return { title, summary };
  } catch (error) {
    console.error(`Error summarizing amendment ${amendementPath}:`, error);
    return { title: "Untitled", summary: "No summary available." };
  }
}

async function processVotesFile(votesFilePath) {
  const votesContent = fs.readFileSync(votesFilePath, "utf8");
  const votes = JSON.parse(votesContent);

  for (const scrutin of votes) {
    if (scrutin.amendement) {
      const { title, summary } = await summarizeAmendment(scrutin.amendement);
      scrutin.title = title;
      scrutin.summary = summary;
    }
  }

  const outputFilePath = path.join(
    path.dirname(votesFilePath),
    "cards.json"
  );
  fs.writeFileSync(outputFilePath, JSON.stringify(votes, null, 2));
  console.log(`Summaries added and saved to ${outputFilePath}`);
}

async function main() {
  const votesFilePath = "./votes.json";
  if (!fs.existsSync(votesFilePath)) {
    console.error(`File not found: ${votesFilePath}`);
    return;
  }

  await processVotesFile(votesFilePath);
}

main();
