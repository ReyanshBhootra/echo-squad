import { RULES } from "./sim.js";
const KEY = "echo-squad-scores-" + RULES;
export function loadScores() {
  try {
    const rows = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(rows)
      ? rows
          .filter(
            (r) =>
              Number.isFinite(r.score) &&
              r.score >= 0 &&
              typeof r.name === "string" &&
              typeof r.date === "string" &&
              r.rules === RULES,
          )
          .slice(0, 200)
      : [];
  } catch {
    return [];
  }
}
export function saveScore(row) {
  const rows = loadScores();
  rows.push({ ...row, rules: RULES });
  rows.sort((a, b) => b.score - a.score || a.date.localeCompare(b.date));
  localStorage.setItem(KEY, JSON.stringify(rows.slice(0, 200)));
  return rows;
}
export function download(name, text, type = "application/json") {
  const a = document.createElement("a");
  const url = URL.createObjectURL(new Blob([text], { type }));
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function localDate(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
