// chatbotPrompts.js

export const initialMessage = "Hei! Ønsker du å godta lagring av samtalen for bedre analyse?";

export const questions = [
  { key: "name", text: "Hva heter du?" },
  { key: "age", text: "Hvor gammel er du?" },
  { key: "jobStatus", text: "Er du i fast jobb, søker jobb, eller er du usikker på hva du vil?" },
  { key: "goal", text: "Hva er målet ditt med denne samtalen?" }
];

export const categoryResponses = {
  a: "Min analyse tyder til at du er i jobbsøking. Kan du fortelle meg om hvilke stillinger og erfaring du har fra før?",
  b: "Du vurderer å bytte karriere. Skal vi se på hvilke muligheter som kan passe for deg?",
  c: "Du ønsker å utvikle karrieren din. Vil du ha tips om videreutdanning eller nye ferdigheter?",
  d: "Du ønsker å finne din motivasjon. La oss utforske hva som inspirerer deg!"
};