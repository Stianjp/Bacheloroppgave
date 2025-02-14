// chatbotPrompts.js

/*
    Hva: 

    Hvorfor:

    Hvordan: 

*/
// chatbotPrompts.js

export const initialMessage =
  "Hei! Ønsker du å godta lagring av samtalen for bedre analyse?";

export const questions = [
  { key: "name", text: "Hva heter du?" },
  { key: "age", text: "Hvor gammel er du?" },
  {
    key: "jobStatus",
    text: "Er du i fast jobb, søker jobb, eller er du usikker på hva du vil?",
  },
  { key: "goal", text: "Hva er målet ditt med denne samtalen?" },
];

export const categoryResponses = {
  a: "Min analyse tyder på at du er i jobbsøking. Kan du fortelle meg om hvilke stillinger og erfaring du har fra før?",
  b: "Du vurderer å bytte karriere. Skal vi se på hvilke muligheter som kan passe for deg?",
  c: "Du ønsker å utvikle karrieren din. Vil du ha tips om videreutdanning eller nye ferdigheter?",
  d: "Du ønsker å finne din motivasjon. La oss utforske hva som inspirerer deg!",
  e: "Målet ditt med denne samtalen var litt vanskelig å tyde, gjerne send litt mer utdypende informasjon",
};

// 🔹 **Dynamiske prompts for ChatGPT basert på kategori**
// Disse kan tilpasses for å gi bedre veiledning til brukeren
export const chatgptPrompts = {
  a: "Du er en erfaren karriereveileder og har mottatt en henvendelse fra en person som enten er uten jobb eller ser etter nye muligheter. Din oppgave er å være kort, men oppmuntrende, og hjelpe personen med å finne sine personlige styrker for å utforske relevante jobbmuligheter. Still åpne spørsmål for å avdekke hva personen liker å gjøre, hvilke ferdigheter de har, og om de ønsker å fortsette i samme bransje eller vurdere nye karriereveier. Hjelp dem med å identifisere overførbare ferdigheter og hvordan de kan brukes i forskjellige yrker. Gi konkrete, enkle råd for å bygge karrieren videre.",
  b: "Brukeren vurderer å bytte karriere. Still spørsmål for å hjelpe dem finne ut hvilke nye yrker som kan passe deres interesser og ferdigheter.",
  c: "Brukeren vil utvikle sin karriere. Foreslå videreutdanning, sertifiseringer eller nye ferdigheter som kan være nyttige.",
  d: "Brukeren leter etter motivasjon. Hjelp dem med å utforske hva som inspirerer dem i arbeidslivet og livet generelt.",
  e: "Brukeren sender en utdypende setning med infromasjon ang hva brukeren vil oppnå med denne samtalen.",
};
