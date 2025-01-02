const fs = require("fs");
const path = require("path");

const folderPath = "./votes";

const politicalGroups = [
  {
    uid: "PO800520",
    abrev: "RN",
    name: "Rassemblement National",
    color: "#35495E",
    politicalAlignment: 1,
  },
  {
    uid: "PO800484",
    abrev: "Dem",
    name: "Démocrate (MoDem et Indépendants)",
    color: "#CE5215",
    politicalAlignment: 0,
  },
  {
    uid: "PO845419",
    abrev: "SOC",
    name: "Socialistes et apparentés",
    color: "#F5B4CE",
    politicalAlignment: -0.5,
  },
  {
    uid: "PO845454",
    abrev: "Dem",
    name: "Les Démocrates",
    color: "#F07E26",
    politicalAlignment: 0,
  },
  {
    uid: "PO800508",
    abrev: "LR",
    name: "Les Républicains",
    color: "#4565AD",
    politicalAlignment: 0.5,
  },
  {
    uid: "PO845407",
    abrev: "EPR",
    name: "Ensemble pour la République",
    color: "#7B4591",
    politicalAlignment: 0,
  },
  {
    uid: "PO800490",
    abrev: "LFI - NUPES",
    name: "La France insoumise - Nouvelle Union Populaire écologique et sociale",
    color: "#E42313",
    politicalAlignment: -1,
  },
  {
    uid: "PO840056",
    abrev: "NI",
    name: "Non inscrit",
    color: "#8D949A",
    politicalAlignment: null,
  },
  {
    uid: "PO800502",
    abrev: "GDR - NUPES",
    name: "Gauche démocrate et républicaine - NUPES",
    color: "#991414",
    politicalAlignment: -0.5,
  },
  {
    uid: "PO800514",
    abrev: "HOR",
    name: "Horizons et apparentés",
    color: "#32B3CA",
    politicalAlignment: 0.5,
  },
  {
    uid: "PO845425",
    abrev: "DR",
    name: "Droite Républicaine",
    color: "#8CB0DC",
    politicalAlignment: 0.5,
  },
  {
    uid: "PO793087",
    abrev: "NI",
    name: "Non inscrit",
    color: "#8D949A",
    politicalAlignment: null,
  },
  {
    uid: "PO830170",
    abrev: "SOC",
    name: "Socialistes et apparentés",
    color: "#DF84B5",
    politicalAlignment: -0.5,
  },
  {
    uid: "PO847173",
    abrev: "UDR",
    name: "UDR",
    color: "#3367A7",
    politicalAlignment: 1,
  },
  {
    uid: "PO800496",
    abrev: "SOC",
    name: "Socialistes et apparentés (membre de l’intergroupe NUPES)",
    color: "#DF84B5",
    politicalAlignment: -0.5,
  },
  {
    uid: "PO845520",
    abrev: "AD",
    name: "À Droite",
    color: "#3367A7",
    politicalAlignment: 1,
  },
  {
    uid: "PO845514",
    abrev: "GDR",
    name: "Gauche Démocrate et Républicaine",
    color: "#830E21",
    politicalAlignment: -0.5,
  },
  {
    uid: "PO800526",
    abrev: "Ecolo - NUPES",
    name: "Écologiste - NUPES",
    color: "#77AA79",
    politicalAlignment: -0.5,
  },
  {
    uid: "PO845413",
    abrev: "LFI-NFP",
    name: "La France insoumise - Nouveau Front Populaire",
    color: "#C00D0D",
    politicalAlignment: -1,
  },
  {
    uid: "PO845401",
    abrev: "RN",
    name: "Rassemblement National",
    color: "#313567",
    politicalAlignment: 1,
  },
  {
    uid: "PO800532",
    abrev: "LIOT",
    name: "Libertés, Indépendants, Outre-mer et Territoires",
    color: "#F8D434",
    politicalAlignment: 0,
  },
  {
    uid: "PO845439",
    abrev: "EcoS",
    name: "Écologiste et Social",
    color: "#77AA79",
    politicalAlignment: -0.5,
  },
  {
    uid: "PO800538",
    abrev: "RE",
    name: "Renaissance",
    color: "#61468F",
    politicalAlignment: 0,
  },
  {
    uid: "PO845470",
    abrev: "HOR",
    name: "Horizons & Indépendants",
    color: "#B5E2F9",
    politicalAlignment: 0.5,
  },
  {
    uid: "PO845485",
    abrev: "LIOT",
    name: "Libertés, Indépendants, Outre-mer et Territoires",
    color: "#FFD96F",
    politicalAlignment: 0,
  },
];

function calculateMedian(values) {
  if (values.length === 0) return null;
  const sortedValues = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sortedValues.length / 2);
  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
  } else {
    return sortedValues[middle];
  }
}

function cleanAuthorName(name) {
  const cleanedName = name
    .replace("M.", "")
    .replace("Mme", "")
    .replace(/[^a-zA-Z\s]/g, "")
    .trim();

  const words = cleanedName.split(/\s+/);

  if (words.length > 1 && /^[A-Z]/.test(words[1])) {
    return (words[0] + words[1]).toLowerCase();
  }

  return words[0].toLowerCase();
}

function processJsonFiles(folderPath) {
  const scrutins = [];

  fs.readdirSync(folderPath).forEach((file) => {
    if (path.extname(file) === ".json") {
      const filePath = path.join(folderPath, file);

      const fileContent = fs.readFileSync(filePath, "utf8");
      const jsonData = JSON.parse(fileContent);

      if (
        jsonData.scrutin.typeVote.codeTypeVote !== "SPO" ||
        jsonData.scrutin.titre.toLowerCase().indexOf("l'amendement") === -1
      ) {
        return;
      }

      const totalVoters = parseInt(
        jsonData.scrutin.syntheseVote.nombreVotants,
        10
      );
      if (totalVoters < 280) {
        return;
      }

      const scrutin = {
        uid: jsonData.scrutin.uid,
        dateScrutin: jsonData.scrutin.dateScrutin,
        typeVote: jsonData.scrutin.typeVote.libelleTypeVote,
        name: jsonData.scrutin.titre,
        totalVoters: totalVoters,
        forPoliticalAlignment: null,
        againstPoliticalAlignment: null,
        amendement: null,
      };

      const forAlignments = [];
      const againstAlignments = [];

      jsonData.scrutin.ventilationVotes.organe.groupes.groupe.forEach(
        (groupe) => {
          const groupInfo = politicalGroups.find(
            (g) => g.uid === groupe.organeRef
          );
          if (groupInfo && groupInfo.politicalAlignment !== null) {
            const votePosition = groupe.vote.positionMajoritaire;
            if (votePosition === "pour") {
              forAlignments.push(groupInfo.politicalAlignment);
            } else if (votePosition === "contre") {
              againstAlignments.push(groupInfo.politicalAlignment);
            }
          }
        }
      );

      scrutin.forPoliticalAlignment = calculateMedian(forAlignments);
      scrutin.againstPoliticalAlignment = calculateMedian(againstAlignments);

      if (
        scrutin.forPoliticalAlignment === null ||
        scrutin.againstPoliticalAlignment === null
      ) {
        console.log(scrutin);
        return;
      }

      const amendementMatch = scrutin.name.match(
        /l'amendement n° (\d+) de (.+) (avant|après) l'article/
      );
      if (amendementMatch) {
        const amendementNumber = amendementMatch[1];
        const author = cleanAuthorName(amendementMatch[2]);
        const legislature = jsonData.scrutin.legislature;
        scrutin.amendement = `${legislature}/${amendementNumber}_${author}.json`;
      } else {
        return;
      }

      console.log(`Processed: ${scrutin.uid}`);
      scrutins.push(scrutin);
    }
  });

  return scrutins;
}

const result = processJsonFiles(folderPath);

fs.writeFileSync("votes.json", JSON.stringify(result, null, 2));
