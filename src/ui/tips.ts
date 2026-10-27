import type { Process } from '../domain/helm'

export interface Tip {
  what: string
  tolerance: string
}

export const HELM_KEYS = ['shade', 'sensitivity', 'delay', 'mode'] as const

/**
 * Erklärtexte je Wert. Basis sind die Texte aus dem Prototyp (Variante B), ergänzt um die Bereiche aus den
 * Handbüchern von MWPE 209 und AH-800. "verfahren.schlüssel" überschreibt den allgemeinen Schlüssel.
 */
const TIPS: Record<string, Tip> = {
  'mig.current': {
    what: 'Die Stromstärke steuert die Wärmeeinbringung und damit Einbrandtiefe und Größe des Schmelzbads. Bei MIG/MAG stellt sie sich über den Drahtvorschub ein.',
    tolerance: 'Spielraum etwa ±10 %. Kehlnaht: +10–15 % für sicheren Einbrand in der Wurzel. Überkopf und Steignaht: −10–15 %, damit das Bad nicht abtropft. Dünnblech mit Spalt: unteren Wert wählen. Gerätebereich 30–200 A.',
  },
  'mma.current': {
    what: 'Die Stromstärke steuert die Wärmeeinbringung und damit Einbrandtiefe und Größe des Schmelzbads. Sie muss zur Elektrode passen.',
    tolerance: 'Immer innerhalb der Angabe auf der Elektrodenpackung bleiben. Zwangslagen: kleineren Durchmesser und etwa −10 % Strom. Gerätebereich 10–160 A.',
  },
  'wig.current': {
    what: 'Mit dem Hauptstrom wird die Naht geschweißt. Er bestimmt Einbrand und Badgröße. Faustregel: etwa 30–40 A pro mm Blechdicke, Aluminium mehr.',
    tolerance: '±10 %. Kehlnaht: +10–15 %. Überkopf und Steignaht: −10–15 %. Mit Fußpedal (Zubehör) kann der Strom während des Schweißens nachgeregelt werden. Gerätebereich 10–200 A.',
  },
  'plasma.current': {
    what: 'Der Schneidstrom bestimmt, wie dick das Gerät schneiden kann. Zu hoch macht den Schnitt unsauber und überhitzt den Brenner, zu niedrig lässt den Schnitt abbrechen.',
    tolerance: 'Dünne Bleche mit niedrigem Strom, dicke mit hohem. Zu schnelles Vorschieben macht den Schnitt unsauber. Gerätebereich 20–40 A, ab 8 mm reicht das Gerät nur noch knapp.',
  },
  voltage: {
    what: 'Die Spannung bestimmt die Lichtbogenlänge: höher ergibt einen längeren, breiteren Lichtbogen und eine flachere Naht, niedriger eine schmale, überhöhte Raupe.',
    tolerance: 'In 0,5-V-Schritten bis ±1,5 V anpassen. Viele Spritzer und harter Lichtbogen: leicht erhöhen. Einbrandkerben oder Poren am Nahtrand: senken. Im Synergiebetrieb stellt das Gerät die Spannung selbst ein, dann über die Lichtbogenkorrektur nachjustieren. Bereich 16,5–24 V.',
  },
  wireSpeed: {
    what: 'Bestimmt, wie schnell der Draht in den Lichtbogen nachgeführt wird. Bei MIG/MAG ist der Vorschub direkt an den Strom gekoppelt: mehr Draht bedeutet mehr Strom, mehr Einbrand und mehr Abschmelzleistung.',
    tolerance: '±10 % feinjustieren. Gleichmäßiges Knistern zeigt den richtigen Wert. Draht stößt ins Bad: Vorschub senken. Draht brennt zurück oder tropft: erhöhen. Überkopf und Steignaht: 10–15 % weniger.',
  },
  wireDiameter: {
    what: 'Der Drahtdurchmesser legt fest, in welchem Strombereich der Lichtbogen stabil brennt. Dünner Draht zündet weicher und eignet sich für Dünnblech.',
    tolerance: 'Richtwert: 0,8 mm bis etwa 140 A, 1,0 mm ab etwa 100 A. Vorschubrolle und Stromdüse immer passend zum Draht wählen. Am Gerät ist eine 0,8/1,0-mm-Rolle eingebaut, für 0,6 mm braucht es eine separat erhältliche Rolle. Synergie gibt es für 0,8, 1,0 und 1,2 mm, 0,6 mm läuft manuell.',
  },
  wireMode: {
    what: 'Im Synergieprogramm stimmt das Gerät Spannung und Drahtvorschub selbst ab. Im manuellen Modus stellst du beides selbst ein.',
    tolerance: 'Synergie gibt es nur für 0,8, 1,0 und 1,2 mm. Mit 0,6 mm musst du manuell arbeiten und am Probestück prüfen.',
  },
  polarity: {
    what: 'Die Polung entscheidet, an welchem Pol die meiste Wärme entsteht. Massivdraht unter Gas: Brenner am Pluspol. Selbstschützender Fülldraht: Brenner am Minuspol.',
    tolerance: 'Keine Toleranz. Falsche Polung führt zu unruhigem Lichtbogen, Spritzern und Poren. Am Gerät: Umpolkabel vorn in den Minuspol (Buchse 16) für Fülldraht.',
  },
  gasFlow: {
    what: 'Die Gasmenge bildet die Schutzglocke über dem Schmelzbad und verhindert Oxidation und Poren.',
    tolerance: '±2 l/min. Bei Zugluft +2–4 l/min oder Windschutz aufstellen. Zu viel Gas erzeugt Verwirbelungen und zieht Luft an. Handbuch MIG/MAG: 0,6 mm Draht = 6 l/min, 0,8 mm = 8 l/min.',
  },
  currentType: {
    what: 'Gleichstrom (DC, Elektrode am Minuspol) für Stahl und Edelstahl. Wechselstrom (AC) für Aluminium, damit die Oxidschicht aufgebrochen wird.',
    tolerance: 'Nicht verstellen: ergibt sich aus der Werkstoffwahl.',
  },
  preFlow: {
    what: 'Das Gas strömt, bevor der Lichtbogen zündet, und verdrängt die Luft am Startpunkt. So oxidiert der Nahtanfang nicht.',
    tolerance: 'Handbuch: über 0,5 s, einstellbar 0–20 s. Langes Schlauchpaket oder Aluminium: eher länger.',
  },
  startCurrent: {
    what: 'Mit dem Startstrom zündet die Hochfrequenz den Lichtbogen berührungslos und mit wenig Energie. Das schont die Elektrodenspitze und verhindert Durchbrennen am Nahtanfang.',
    tolerance: '20–50 % des Hauptstroms. Dünnblech: niedrig. Kaltes Aluminium: etwas höher, damit sich das Bad schneller bildet. Einstellbar 10–200 A.',
  },
  upSlope: {
    what: 'In der Anstiegszeit steigt der Strom vom Start- auf den Hauptstrom. Das Bad bildet sich kontrolliert, ohne Spritzer und Einbrandfehler am Anfang.',
    tolerance: '0–2 s. Heftstellen und Dünnblech: kurz halten. Dicke Teile: länger, damit der Werkstoff durchwärmt. Einstellbar 0–20 s.',
  },
  downSlope: {
    what: 'Die Absenkzeit fährt den Strom am Nahtende langsam zurück. Das Bad schrumpft gleichmäßig, ohne Endkrater oder Kraterrisse.',
    tolerance: '0,5–3 s, etwa proportional zur Blechdicke. Endkrater sichtbar: Zeit verlängern. Einstellbar 0–20 s.',
  },
  endCurrent: {
    what: 'Der Endstrom hält ein kleines Bad, bis der Krater gefüllt ist; danach erlischt der Lichtbogen.',
    tolerance: '10–30 % des Hauptstroms. Etwas Zusatzwerkstoff zugeben, bis der Krater eben ist. Einstellbar 10–200 A.',
  },
  postFlow: {
    what: 'Das Gas strömt nach dem Erlöschen weiter. Es kühlt die glühende Wolframelektrode und schützt die erstarrende Naht vor Oxidation.',
    tolerance: 'Am Gerät einstellbar: 10–20 s. Faustregel etwa 1 s pro 10 A, bei hohem Strom eher mehr. Elektrode nach dem Schweißen blau oder grau angelaufen: Zeit verlängern. Brenner bis zum Ende über der Naht halten.',
  },
  acBalance: {
    what: 'Die Balance teilt die AC-Periode in Reinigungsanteil (Elektrode am Pluspol, bricht die Oxidschicht auf) und Einbrandanteil (Elektrode am Minuspol).',
    tolerance: 'Am Gerät −5 bis +5, 0 ist die Mitte. Weniger: mehr Hitze im Material, schmalere Naht, tieferer Einbrand, weniger Last für die Elektrode. Mehr: breitere Naht, flacherer Einbrand, mehr Last für die Elektrode. Dunkler, ungereinigter Rand neben der Naht: Wert erhöhen. Elektrode wird zu heiß oder bildet eine große Kugel: senken.',
  },
  tungstenDiameter: {
    what: 'Die Wolframelektrode trägt den Lichtbogen, ohne abzuschmelzen. Ihr Durchmesser muss zum Strom passen.',
    tolerance: 'Handbuch: 1,0 mm = 15–80 A, 1,6 mm = 70–150 A, 2,4 mm = 150–250 A. DC: spitz anschleifen, Schleifriefen längs. AC: leicht abgestumpft, die Spitze rundet sich im Betrieb an. Zu dünn: Spitze schmilzt ab. Zu dick: unruhiger Lichtbogen.',
  },
  tungstenType: {
    what: 'Die Elektrodensorte (Farbe) entscheidet, für welchen Werkstoff und welche Stromart sie taugt.',
    tolerance: 'Handbuch: Stahl Lymox Pink, Edelstahl rot oder Lymox Pink, Aluminium gold oder grün. WL-15 (gold) deckt Stahl und Alu ab.',
  },
  electrodeDiameter: {
    what: 'Der Elektrodendurchmesser richtet sich nach der Blechdicke und bestimmt die Stromstärke.',
    tolerance: 'Handbuch: Ø 2,0 mm = 60–100 A, 2,5 mm = 80–120 A, 3,25 mm = 108–148 A, 4,0 mm = 140–180 A (am Gerät bis 160 A). Wurzellage: eine Nummer kleiner. Maßgeblich ist die Elektrodenpackung.',
  },
  electrodeType: {
    what: 'Die Umhüllung der Elektrode erzeugt Schutzgas und Schlacke und prägt das Schweißverhalten.',
    tolerance: 'Rutil: einfach zu führen, glatte Naht. Basisch: zäher, rissunempfindlich, trocken lagern. Polung laut Elektrodenpackung.',
  },
  airPressure: {
    what: 'Die Druckluft schnürt den Plasmastrahl ein und bläst die Schmelze aus der Schnittfuge. Sie muss trocken und ölfrei sein.',
    tolerance: 'Handbuch: etwa 1,5 bar bei 1–2 mm bis 4–5 bar bei 8–12 mm, gemessen bei strömender Luft. Zu wenig: Schlackebart an der Unterseite. Zu viel: Lichtbogen reißt ab. Kompressor mit mindestens 120 l/min.',
  },
  fillerRod: {
    what: 'Der Zusatzstab wird von Hand ins Bad geführt und füllt die Naht auf.',
    tolerance: 'Etwa halb so dick bis gleich dick wie das Blech. Das Stabende immer im Gasschutz halten. Stahl, Edelstahl und Alu brauchen jeweils den passenden Stab (Stahl WSG II, Edelstahl 308L/318, Alu AlMg5 oder AlSi5).',
  },
  nozzleDistance: {
    what: 'Der Abstand zwischen Düse und Werkstück beeinflusst Schnittbreite, Schnittqualität und Düsenverschleiß.',
    tolerance: 'Richtwert 1,5–3 mm, Abstandshalter verwenden. Beim Einstechen schräg ansetzen und dann aufrichten, damit die Düse nicht verschmutzt.',
  },
  shade: {
    what: 'Die Schutzstufe gibt an, wie stark der Filter im dunklen Zustand abdunkelt. Sie schützt vor UV- und IR-Strahlung und vor Blendung. Die Werte stammen aus der Dunkelstufen-Tabelle im Handbuch des AH-800.',
    tolerance: 'Nie heller wählen als angezeigt. Bad und Nahtkante müssen klar erkennbar, aber nicht grell sein. Sieht das Auge nach dem Schweißen Nachbilder: eine Stufe dunkler. Der AH-800 hat die Bereiche 4–8 und 9–13, am Drehknopf außen umschalten.',
  },
  sensitivity: {
    what: 'Die Empfindlichkeit regelt, wie stark die optischen Sensoren auf Licht reagieren und den Filter abdunkeln.',
    tolerance: 'Skala 0–9. Stufe 8 passt für die meisten Anwendungen, 9 bei Niedrigstrom und schwachen WIG-Lichtbögen. Schaltet der Helm durch Nachbarplätze oder Sonnenlicht ungewollt: eine Stufe zurück. Dunkelt der Helm nicht ab oder flackert er: erhöhen.',
  },
  delay: {
    what: 'Die Verzögerung ist die Zeit, die der Filter nach dem Erlöschen des Lichtbogens dunkel bleibt. So blendet die noch glühende Naht nicht.',
    tolerance: 'Handbuch: Stufe 9 (2,0 s) für die meisten Anwendungen, auch hohe Ströme und lange Nähte. Stufe 1–2 für Punktschweißen, Stufe 0 zum Heften. Grelles Nachglühen nach dem Aufhellen: Verzögerung erhöhen.',
  },
  mode: {
    what: 'WELD ist der Schweißmodus, CUT der Schneidmodus. Im Modus GRIND dunkelt der Helm nicht ab und dient als Funkenschutz beim Schleifen.',
    tolerance: 'An der Taste außen an der Helmschale: kurz drücken wechselt WELD und CUT, lang drücken schaltet GRIND. GRIND vor dem Schweißen wieder ausschalten.',
  },
}

export function tipFor(process: Process, key: string): Tip | undefined {
  return TIPS[`${process}.${key}`] ?? TIPS[key]
}
