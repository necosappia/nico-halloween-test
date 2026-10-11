import questions from "../review/questions.snapshot.json";
// Frozen against 0fbd45a; v2 wording and images verified against d7cd153.
// No calculation of score/level here: real records keep their stored result.
export const historicalVersions: Record<string, { label: string; count: number }> = {
  "halloween-2026-v2-rigid-14": { label: "v2 · 14 preguntas", count: 14 },
  "halloween-2026-v4-braking-16": { label: "v4 · 16 preguntas", count: 16 },
};
export function historicalAnswers(version: string, answers: unknown) {
  const info = Object.hasOwn(historicalVersions, version) ? historicalVersions[version] : null;
  if (!info || !Array.isArray(answers)) return null;
  return questions.map((q, index) => {
    const raw = answers[index];
    const included = index < info.count;
    const valid = included && Number.isInteger(raw) && raw >= 0 && raw < q.options.length;
    return { ...q, index, included, selected: valid ? raw as number : null,
      answer: !included ? "No incluida en esta versión" : valid ? q.options[raw] : raw == null ? "Sin respuesta registrada" : "No se puede reconstruir: índice fuera de rango" };
  });
}
export const levelLabels: Record<string, string> = { preparacion: "Preparación", "primeros-pasos": "Primeros pasos", urbana: "Salida urbana" };
export const resultTitles: Record<string, string> = {
  preparacion: "Primero, construyamos tu base",
  "primeros-pasos": "Tu próximo paso: salida primeros pasos",
  urbana: "Tu próximo desafío: salida urbana",
};
export const skillIndexes = [0, 1, 2, 3, 4, 5, 8, 9, 10];
export const skillLabels = ["Freno", "Dirección", "Superficies", "Pendientes", "Resistencia", "Grupo", "Recorrido 10 km", "Imprevistos", "Una pierna"];
