const slotPlaceholders = [
  'Grafen besuchen',
  'Dungeon aufräumen',
  'Fluch brechen',
  'Gerüchte prüfen',
  'Drachenproblem klären',

  'Kult untersuchen',
  'Archiv durchforsten',
  'Ritual stoppen',
  'Akte sichern',
  'Sanity testen',

  'Vorfall vertuschen',
  'Beweise entfernen',
  'Anomalie prüfen',
  'Kontakt befragen',
  'Bericht fälschen',

  'Score durchziehen',
  'Schulden regeln',
  'Tresor leeren',
  'Geister besänftigen',
  'Crew retten',

  'Signal verfolgen',
  'Deck 13 checken',
  'Reaktor reparieren',
  'Rumpf abdichten',
  'Nicht panisch werden',

  'Drift fahren',
  'Glitch jagen',
  'Crew sammeln',
  'Dimension wechseln',
  'Stress abbauen',

  'Honig stehlen',
  'Käfer verjagen',
  'Vorräte sichern',
  'Patrouille laufen',
  'Mut beweisen',

  'Schrein besuchen',
  'Kami besänftigen',
  'Gerüchte klären',
  'Geist beruhigen',
  'Laternen entzünden',

  'Leviathan jagen',
  'Segel flicken',
  'Kiel reparieren',
  'Vorräte tauschen',
  'Wipfel durchqueren',

  'Titan erlegen',
  'Lager aufschlagen',
  'Feuer entfachen',
  'Gewürze sammeln',
  'Beute zubereiten',
];

export function getRandomPlaceholder() {
  const randomItem = slotPlaceholders[Math.floor(Math.random() * slotPlaceholders.length)];
  return randomItem;
}
