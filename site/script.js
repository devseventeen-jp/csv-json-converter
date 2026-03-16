const csvInput = document.getElementById("csvInput");
const jsonOutput = document.getElementById("jsonOutput");
const status = document.getElementById("status");
const useHeader = document.getElementById("useHeader");
const convertButton = document.getElementById("convert");
const copyButton = document.getElementById("copyJson");
const downloadButton = document.getElementById("downloadJson");
const loadSampleButton = document.getElementById("loadSample");
const clearInputButton = document.getElementById("clearInput");

const sampleCsv = `name,role,note\nAya,Engineer,"2行目の\nコメント"\nKen,Designer,"CRLFでも\r\nOK"`;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        const nextChar = text[i + 1];
        if (nextChar === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      row.push(field);
      field = "";
      continue;
    }

    if (char === '\n' || char === '\r') {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
      if (char === '\r' && text[i + 1] === '\n') {
        i += 1;
      }
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0 || text.endsWith(",")) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 1 && rows[0].length === 1 && rows[0][0] === "") {
    return [];
  }

  return rows;
}

function normalizeHeaders(headers) {
  return headers.map((header, index) => {
    const trimmed = header.trim();
    if (trimmed.length === 0) {
      return `column_${index + 1}`;
    }
    return trimmed;
  });
}

function convertCsvToJson(text, withHeader) {
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return { json: "", info: "CSVが空です。" };
  }

  if (withHeader) {
    const headers = normalizeHeaders(rows[0]);
    const dataRows = rows.slice(1);
    const data = dataRows.map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index] ?? "";
      });

      if (row.length > headers.length) {
        for (let i = headers.length; i < row.length; i += 1) {
          record[`extra_${i + 1}`] = row[i];
        }
      }

      return record;
    });
    return { json: JSON.stringify(data, null, 2), info: `変換完了: ${data.length} 行` };
  }

  return { json: JSON.stringify(rows, null, 2), info: `変換完了: ${rows.length} 行` };
}

function renderResult(result) {
  jsonOutput.textContent = result.json || "";
  status.textContent = result.info;
}

convertButton.addEventListener("click", () => {
  const result = convertCsvToJson(csvInput.value, useHeader.checked);
  renderResult(result);
});

copyButton.addEventListener("click", async () => {
  if (!jsonOutput.textContent) {
    renderResult({ json: "", info: "出力がありません。先に変換してください。" });
    return;
  }
  try {
    await navigator.clipboard.writeText(jsonOutput.textContent);
    renderResult({ json: jsonOutput.textContent, info: "コピーしました。" });
  } catch (error) {
    renderResult({ json: jsonOutput.textContent, info: "コピーに失敗しました。" });
  }
});

downloadButton.addEventListener("click", () => {
  if (!jsonOutput.textContent) {
    renderResult({ json: "", info: "出力がありません。先に変換してください。" });
    return;
  }
  const suggestedName = "data.json";
  const filename = window.prompt("保存するファイル名を入力してください", suggestedName);
  if (filename === null) {
    renderResult({ json: jsonOutput.textContent, info: "保存をキャンセルしました。" });
    return;
  }
  const trimmed = filename.trim();
  if (!trimmed) {
    renderResult({ json: jsonOutput.textContent, info: "ファイル名が空のため保存できません。" });
    return;
  }
  const blob = new Blob([jsonOutput.textContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = trimmed;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  renderResult({ json: jsonOutput.textContent, info: `JSONを保存しました: ${trimmed}` });
});

loadSampleButton.addEventListener("click", () => {
  csvInput.value = sampleCsv;
  renderResult({ json: "", info: "サンプルを読み込みました。" });
});

clearInputButton.addEventListener("click", () => {
  csvInput.value = "";
  jsonOutput.textContent = "";
  status.textContent = "入力をクリアしました。";
});
