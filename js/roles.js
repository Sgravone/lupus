// js/roles.js
// Definizione ruoli e aura base

const ROLES = {
  lupo: {
    id: "lupo",
    name: "Lupo Mannaro",
    faction: "Lupi",
    aura: "Nera",
    ability: "Mordo",
    description:
      "Di notte sceglie (con gli altri lupi) un giocatore da uccidere.",
  },
  indemoniato: {
    id: "indemoniato",
    name: "Indemoniato",
    faction: "Villaggio",
    aura: "Bianca",
    ability: "Convertibile",
    description:
      "Se morso dai lupi non muore: si unisce a loro e diventa di aura nera.",
  },
  contadino: {
    id: "contadino",
    name: "Contadino",
    faction: "Villaggio",
    aura: "Bianca",
    ability: "Nessuna",
    description: "Giocatore innocente senza capacità attive.",
  },
  peccatore: {
    id: "peccatore",
    name: "Peccatore",
    faction: "Villaggio",
    aura: "Nera",
    ability: "Nessuna",
    description: "Giocatore del villaggio ma con aura nera.",
  },
  strega: {
    id: "strega",
    name: "Strega",
    faction: "Villaggio",
    aura: "Bianca & Blu",
    ability: "Proteggi",
    description:
      "Protegge un giocatore a notte. Non può proteggere la stessa persona due notti di fila.",
  },
  veggente: {
    id: "veggente",
    name: "Veggente",
    faction: "Villaggio",
    aura: "Bianca & Blu",
    ability: "Legge aura",
    description:
      "Sceglie un giocatore e scopre se è di aura bianca o nera.",
  },
  dracula: {
    id: "dracula",
    name: "Dracula",
    faction: "Vampiri",
    aura: "Nera",
    ability: "Mordo e trasformo",
    description:
      "Trasforma un giocatore in vampiro. Se morde un lupo, Dracula muore.",
  },
  ghoul: {
    id: "ghoul",
    name: "Ghoul",
    faction: "Vampiri",
    aura: "Bianca",
    ability: "Conosce Dracula",
    description: "Sa chi è Dracula dalla prima notte.",
  },
  massone: {
    id: "massone",
    name: "Massone",
    faction: "Villaggio",
    aura: "Bianca",
    ability: "Conosce corrotto",
    description: "Conosce l'identità del massone corrotto.",
  },
};

function getPlayerAuraBasic(roleId) {
  const r = ROLES[roleId];
  if (!r) return "Bianca";
  if ((r.aura || "").toLowerCase().includes("nera")) return "Nera";
  return "Bianca";
}