/* bashlab – svi projekti na jednom mjestu. Novi projekat = novi objekt ovdje. */
window.PROJECTS = [
{
  id: "armory", name: "Bash Armory", tags: ["web", "apk", "game"], status: "live", featured: true,
  icon: "shield",
  apk: "armory/BashArmory.apk", web: "armory/", code: "https://github.com/Basaofficial/basharmory",
  gh: { repo: "Basaofficial/basharmory", release: true },
  shots: ["armory-1", "armory-2", "armory-3"],
  platform: "Android 7+",
  t: {
    bs: { short: "Warmane armory za telefon s 3D likom i transmogom.",
          long: "Warmane armory (WotLK 3.3.5) za telefon. Lik u 3D kao u igri, s transmogom, gemovima i enchantima. Raid check pokaže šta je ko očistio, a aplikacija se sama ažurira.",
          feats: ["3D lik s transmogom", "GearScore, gemovi i enchanti", "Raid check: ICC 10/25 i HC, RS, ToC, Ulduar", "Talent stabla kao u igri", "Guild online po ulogama, DKP", "Sama se ažurira"] },
    de: { short: "Warmane-Armory fürs Handy mit 3D-Charakter und Transmog.",
          long: "Warmane-Armory (WotLK 3.3.5) fürs Handy. Charakter in 3D wie im Spiel, mit Transmog, Edelsteinen und Verzauberungen. Der Raid-Check zeigt, wer was gecleart hat, und die App aktualisiert sich selbst.",
          feats: ["3D-Charakter mit Transmog", "GearScore, Edelsteine, Verzauberungen", "Raid-Check: ICC 10/25 und HC, RS, PdK, Ulduar", "Talentbäume wie im Spiel", "Gilde online nach Rollen, DKP", "Automatische Updates"] },
    en: { short: "Warmane armory for your phone with a 3D character and transmog.",
          long: "A Warmane armory (WotLK 3.3.5) for your phone. Your character in 3D as in game, with transmog, gems and enchants. Raid check shows who cleared what, and the app updates itself.",
          feats: ["3D character with transmog", "GearScore, gems and enchants", "Raid check: ICC 10/25 and HC, RS, ToC, Ulduar", "In-game style talent trees", "Guild online by role, DKP", "Updates itself"] }
  }
},
{
  id: "igre", name: "Bash igre", tags: ["web", "game"], status: "live",
  icon: "dice",
  web: "igre/", alt: { href: "ne-ljuti-se/", label: { bs: "Ne ljuti se", de: "Mensch ärgere dich nicht", en: "Ludo" } },
  gh: { repo: "Basaofficial/basaofficial.github.io", path: "igre" },
  shots: ["igre-1"],
  platform: "Web · Android · iPhone",
  t: {
    bs: { short: "Online igre za društvo: Ne ljuti se, Sketch, Uno.",
          long: "Igre za društvo koje rade u pregledniku, na Androidu i iPhoneu. Uđeš u kanal, napraviš sobu i igraš s ekipom. Ne treba registracija ni server.",
          feats: ["Ne ljuti se čovječe 1v1 i 2v2", "Sketch: crtaj i pogađaj do 5 igrača", "Lobby, chat, nadimci i ruže", "Bez registracije"] },
    de: { short: "Online-Partyspiele: Mensch ärgere dich nicht, Sketch, Uno.",
          long: "Partyspiele im Browser, auf Android und iPhone. Kanal betreten, Raum erstellen und mit Freunden spielen. Ohne Anmeldung und ohne Server.",
          feats: ["Mensch ärgere dich nicht 1v1 und 2v2", "Sketch: zeichnen und raten bis 5 Spieler", "Lobby, Chat, Spitznamen, Rosen", "Ohne Anmeldung"] },
    en: { short: "Online party games: Ludo, Sketch, Uno.",
          long: "Party games that run in the browser, on Android and iPhone. Join the channel, open a room and play with friends. No sign-up and no server.",
          feats: ["Ludo 1v1 and 2v2", "Sketch: draw and guess, up to 5 players", "Lobby, chat, nicknames and roses", "No sign-up"] }
  }
},
{
  id: "fit", name: "Bash Fit", tags: ["web"], status: "live",
  icon: "apple",
  web: "fit/", alt: { href: "fit/#plan", label: { bs: "Plan ishrane", de: "Ernährungsplan", en: "Meal plan" } },
  gh: { repo: "Basaofficial/basaofficial.github.io", path: "fit" },
  shots: ["fit-1", "fit-2"],
  platform: "Web",
  t: {
    bs: { short: "Mršavljenje: BMI, kalorije i sedmični plan ishrane.",
          long: "Upišeš visinu, kilažu i cilj, a aplikacija izračuna kalorije i makroe i napravi sedmični plan ishrane s pravim namirnicama i gramažom.",
          feats: ["BMI i kalorijski kalkulator", "Sedmični plan ishrane", "Lista za kupovinu", "Dnevnik obroka, voda, graf kilaže"] },
    de: { short: "Abnehmen: BMI, Kalorien und Wochenplan.",
          long: "Größe, Gewicht und Ziel eingeben: Die App berechnet Kalorien und Makros und erstellt einen Wochen-Ernährungsplan mit echten Lebensmitteln und Grammangaben.",
          feats: ["BMI- und Kalorienrechner", "Wöchentlicher Ernährungsplan", "Einkaufsliste", "Mahlzeiten, Wasser, Gewichtsverlauf"] },
    en: { short: "Weight loss: BMI, calories and a weekly meal plan.",
          long: "Enter your height, weight and goal, and the app works out calories and macros and builds a weekly meal plan with real foods and gram amounts.",
          feats: ["BMI and calorie calculator", "Weekly meal plan", "Shopping list", "Meal log, water and weight chart"] }
  }
},
{
  id: "bashtalk", name: "Bash Talk", tags: ["web", "apk"], status: "live",
  icon: "radio",
  apk: "https://github.com/Basaofficial/bashtalk/releases/latest", web: "bashtalk/", code: "https://github.com/Basaofficial/bashtalk",
  gh: { repo: "Basaofficial/bashtalk", release: true },
  shots: ["bashtalk-1"],
  platform: "Android · Web",
  t: {
    bs: { short: "Walkie-talkie i chat koji radi bez mreže.",
          long: "Android aplikacija radi bez interneta preko Wi-Fi/Bluetootha i sama se spaja s uređajima u blizini, npr. u garaži na -1. Online verzija ima sobe i šifrovane poruke.",
          feats: ["Radi bez mreže", "Sama se spaja s uređajima u blizini", "Radi u pozadini", "Online sobe sa šifrovanim porukama"] },
    de: { short: "Walkie-Talkie und Chat, der ohne Netz funktioniert.",
          long: "Die Android-App funktioniert ohne Internet über WLAN/Bluetooth und verbindet sich automatisch mit Geräten in der Nähe, z. B. in der Tiefgarage. Die Online-Version hat Räume und verschlüsselte Nachrichten.",
          feats: ["Funktioniert ohne Netz", "Verbindet sich automatisch", "Läuft im Hintergrund", "Online-Räume, verschlüsselt"] },
    en: { short: "Walkie-talkie and chat that works with no network.",
          long: "The Android app works without internet over Wi-Fi/Bluetooth and connects to nearby devices by itself, e.g. in an underground garage. The online version has rooms and encrypted messages.",
          feats: ["Works with no network", "Connects to nearby devices by itself", "Runs in the background", "Online rooms, encrypted"] }
  }
},
{
  id: "electro", name: "bash-electro", tags: ["web", "apk"], status: "live",
  icon: "bolt",
  apk: "https://github.com/Basaofficial/bash-electro/releases/latest", web: "https://basaofficial.github.io/bash-electro/", code: "https://github.com/Basaofficial/bash-electro",
  gh: { repo: "Basaofficial/bash-electro", release: true },
  shots: ["electro-1", "electro-2"],
  platform: "Web · Android",
  t: {
    bs: { short: "Planer elektroinstalacija i ormara za njemačko tržište.",
          long: "Povezuje tlocrt, strujne krugove, razdjelnik (Verteiler) i dokumentaciju u jednom alatu, po DIN VDE 0100. Od prve skice do nacrta koji ide na gradilište.",
          feats: ["3D kuća i ormar", "Crtač 5D sa 47 elektro simbola", "Montaža i testiranje", "PDF nacrti A4 do A0"] },
    de: { short: "Planer für Elektroinstallation und Verteiler.",
          long: "Verbindet Grundriss, Stromkreise, Verteiler und Dokumentation in einem Tool, nach DIN VDE 0100. Von der ersten Skizze bis zum Plan für die Baustelle.",
          feats: ["3D-Haus und Verteiler", "Zeichner 5D mit 47 Elektrosymbolen", "Montage und Prüfung", "PDF-Pläne A4 bis A0"] },
    en: { short: "Electrical installation and panel planner for Germany.",
          long: "Connects floor plan, circuits, distribution board (Verteiler) and documentation in one tool, following DIN VDE 0100. From the first sketch to the plan that goes on site.",
          feats: ["3D house and panel", "Drawer 5D with 47 electrical symbols", "Mounting and testing", "PDF plans A4 to A0"] }
  }
},
{
  id: "bashmouse", name: "BashMouse", tags: ["apk"], status: "soon",
  icon: "hand",
  shots: [],
  platform: "Android",
  t: {
    bs: { short: "Upravljaj telefonom pokretima ruke, bez dodira.",
          long: "Prednja kamera prati ruku i pretvara pokrete u klik i skrol, preko bilo koje aplikacije. Npr. skrolaš Instagram reelse dok jedeš.",
          feats: ["Prati ruku preko prednje kamere", "Radi preko drugih aplikacija", "Skrol i klik pokretima"] },
    de: { short: "Steuere dein Handy mit Handgesten, ohne Berührung.",
          long: "Die Frontkamera verfolgt deine Hand und wandelt Gesten in Klick und Scrollen um, über jeder App. Z. B. Instagram-Reels scrollen beim Essen.",
          feats: ["Handtracking über Frontkamera", "Funktioniert über anderen Apps", "Scrollen und Klicken per Geste"] },
    en: { short: "Control your phone with hand gestures, no touch.",
          long: "The front camera tracks your hand and turns gestures into taps and scrolls, over any app. Scroll Instagram reels while you eat, for example.",
          feats: ["Hand tracking via front camera", "Works over other apps", "Scroll and tap by gesture"] }
  }
}
];
