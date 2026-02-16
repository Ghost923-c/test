const categories = [
  { key: "strategy", label: "AI Strategy & Leadership", prompt: "Does leadership have a clear AI strategy and business goals?" },
  { key: "governance", label: "Governance, Ethics & POPIA Readiness", prompt: "Are data governance, ethics, and POPIA compliance controls in place for AI use?" },
  { key: "data", label: "Data Quality & Accessibility", prompt: "Is business data accurate, secure, and accessible for AI projects?" },
  { key: "technology", label: "Technology Stack", prompt: "Can current systems integrate with modern AI solutions and automation tools?" },
  { key: "skills", label: "People & Skills", prompt: "Do staff have the skills to adopt and govern AI responsibly?" },
  { key: "comms", label: "Communication & Change Management", prompt: "Is there a communication plan to support AI adoption and stakeholder trust?" },
];

const genAiUseCases = [
  "Algorithmic trading",
  "AML/CFT: behavioural or transaction monitoring",
  "AML/CFT: identification and verification (including remote onboarding)",
  "Capital management",
  "Carbon footprint estimation",
  "Claims management",
  "Credit pricing",
  "Credit underwriting",
  "Creditworthiness assessment / credit scoring",
  "Customer support, including chatbots",
  "Cybersecurity",
  "Forecasting and business modelling",
  "Fraud detection",
  "Hedging",
  "Insurance pricing",
  "Insurance underwriting",
  "Liquidity management",
  "Market conduct risk",
  "Optimisation",
];

const form = document.getElementById("audit-form");
const questionList = document.getElementById("question-list");
const useCaseList = document.getElementById("usecase-list");
const results = document.getElementById("results");
const scoreBreakdown = document.getElementById("score-breakdown");
const recommendations = document.getElementById("recommendations");
const aiSummary = document.getElementById("ai-summary");
const downloadJsonBtn = document.getElementById("downloadJsonBtn");
const downloadCsvBtn = document.getElementById("downloadCsvBtn");
const downloadTxtBtn = document.getElementById("downloadTxtBtn");
const resetBtn = document.getElementById("resetBtn");

buildQuestions();
buildUseCases();
setDefaultDate();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const payload = collectPayload();
  const result = evaluateAudit(payload.scores);

  renderResults(payload, result);
  drawScoreChart(payload.scores);
  drawMaturityChart(result.average);
  generateAiSummary(payload, result);
});

downloadJsonBtn.addEventListener("click", () => downloadJson(buildAuditData()));
downloadCsvBtn.addEventListener("click", () => downloadCsv(buildAuditData()));
downloadTxtBtn.addEventListener("click", () => downloadTxtReport(buildAuditData()));

resetBtn.addEventListener("click", () => {
  results.classList.add("hidden");
  scoreBreakdown.innerHTML = "";
  recommendations.innerHTML = "";
  aiSummary.textContent = "No AI summary generated yet.";
  clearCanvas("scoreChart");
  clearCanvas("maturityChart");
});

function buildQuestions() {
  const options = [1, 2, 3, 4, 5].map((value) => `<option value="${value}">${value}</option>`).join("");

  questionList.innerHTML = categories
    .map(
      (category) => `
      <label class="question">
        <p>${category.label}</p>
        <span>${category.prompt}</span>
        <select id="${category.key}" required>
          <option value="" disabled selected>Select score</option>
          ${options}
        </select>
      </label>
    `,
    )
    .join("");
}

function buildUseCases() {
  useCaseList.innerHTML = genAiUseCases
    .map(
      (item, index) => `
        <label class="checkbox-row">
          <input type="checkbox" id="usecase-${index}" value="${item}" />
          <span>${item}</span>
        </label>
      `,
    )
    .join("");
}

function setDefaultDate() {
  document.getElementById("auditDate").value = new Date().toISOString().split("T")[0];
}

function collectPayload() {
  const scores = categories.map((category) => ({
    key: category.key,
    label: category.label,
    score: Number(document.getElementById(category.key).value || 0),
  }));

  const selectedUseCases = genAiUseCases.filter((_, index) => document.getElementById(`usecase-${index}`).checked);

  return {
    businessName: document.getElementById("businessName").value.trim(),
    industry: document.getElementById("industry").value.trim(),
    contact: document.getElementById("contact").value.trim(),
    auditDate: document.getElementById("auditDate").value,
    scores,
    researchAnswers: {
      q19: document.getElementById("q19").value.trim(),
      q20: document.getElementById("q20").value.trim(),
      q21: document.getElementById("q21").value.trim(),
      q22: document.getElementById("q22").value.trim(),
      q23: document.getElementById("q23").value.trim(),
      q24: document.getElementById("q24").value.trim(),
    },
    selectedUseCases,
  };
}

function buildAuditData() {
  const payload = collectPayload();
  const result = evaluateAudit(payload.scores);
  return { ...payload, result };
}

function evaluateAudit(scores) {
  const total = scores.reduce((sum, item) => sum + item.score, 0);
  const average = total / scores.length;

  let level = "Emerging";
  let className = "score-emerging";
  let guidance = [
    "Define a leadership-endorsed AI roadmap with clear legal and business outcomes.",
    "Prioritize POPIA-aligned data policies before scaling pilots.",
    "Start with low-risk use cases such as internal knowledge search and document triage.",
  ];

  if (average >= 3 && average < 4.2) {
    level = "Developing";
    className = "score-developing";
    guidance = [
      "Formalize governance committees covering legal, IT, and communications.",
      "Expand team enablement with targeted AI literacy and prompt safety training.",
      "Standardize client-facing messaging on how AI is used responsibly.",
    ];
  } else if (average >= 4.2) {
    level = "Advanced";
    className = "score-advanced";
    guidance = [
      "Scale AI initiatives with robust model risk monitoring and audit trails.",
      "Integrate AI readiness metrics into ongoing client advisory engagements.",
      "Create a repeatable innovation playbook for cross-industry deployments.",
    ];
  }

  return { total, average: Number(average.toFixed(2)), level, className, guidance };
}

function renderResults(payload, result) {
  const list = payload.scores.map((item) => `<li><strong>${item.label}:</strong> ${item.score}/5</li>`).join("");

  scoreBreakdown.innerHTML = `
    <p><strong>${payload.businessName}</strong> (${payload.industry})</p>
    <p>
      Overall AI maturity:
      <strong>${result.level}</strong>
      <span class="score-pill ${result.className}">Avg ${result.average}/5</span>
    </p>
    <ul>${list}</ul>
  `;

  recommendations.innerHTML = `
    <h3>Recommendations</h3>
    <ol>${result.guidance.map((item) => `<li>${item}</li>`).join("")}</ol>
  `;

  results.classList.remove("hidden");
}

function drawScoreChart(scores) {
  const canvas = document.getElementById("scoreChart");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const padding = 50;
  const barGap = 20;
  const barWidth = (width - padding * 2 - barGap * (scores.length - 1)) / scores.length;

  ctx.strokeStyle = "#c8d4eb";
  ctx.lineWidth = 1;
  for (let y = 0; y <= 5; y += 1) {
    const yPos = height - padding - (y / 5) * (height - padding * 2);
    ctx.beginPath();
    ctx.moveTo(padding, yPos);
    ctx.lineTo(width - padding, yPos);
    ctx.stroke();

    ctx.fillStyle = "#6b7280";
    ctx.font = "12px Segoe UI";
    ctx.fillText(String(y), padding - 20, yPos + 4);
  }

  scores.forEach((item, index) => {
    const x = padding + index * (barWidth + barGap);
    const barHeight = (item.score / 5) * (height - padding * 2);
    const y = height - padding - barHeight;

    ctx.fillStyle = "#1f4f99";
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = "#111827";
    ctx.font = "11px Segoe UI";
    ctx.fillText(`${item.score}`, x + barWidth / 2 - 4, y - 6);

    const shortLabel = item.label.split(" ")[0];
    ctx.fillStyle = "#374151";
    ctx.fillText(shortLabel, x, height - padding + 18);
  });
}

function drawMaturityChart(average) {
  const canvas = document.getElementById("maturityChart");
  const ctx = canvas.getContext("2d");
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 90;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 18;
  ctx.stroke();

  const percentage = Math.min(average / 5, 1);
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * percentage);
  ctx.strokeStyle = percentage < 0.6 ? "#9f1239" : percentage < 0.84 ? "#854d0e" : "#166534";
  ctx.lineWidth = 18;
  ctx.stroke();

  ctx.fillStyle = "#111827";
  ctx.font = "bold 30px Segoe UI";
  ctx.fillText(`${average}/5`, centerX - 38, centerY + 10);
}

function clearCanvas(id) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function downloadJson(data) {
  downloadFile(JSON.stringify(data, null, 2), `ai-audit-${safeFileName(data.businessName || "report")}.json`, "application/json");
}

function downloadCsv(data) {
  const headerRows = [
    ["Business Name", escapeCsvCell(data.businessName)],
    ["Industry", escapeCsvCell(data.industry)],
    ["Contact", escapeCsvCell(data.contact)],
    ["Audit Date", escapeCsvCell(data.auditDate)],
    ["Overall Level", escapeCsvCell(data.result.level)],
    ["Average Score", data.result.average],
    ["Selected Use Cases", escapeCsvCell(data.selectedUseCases.join("; "))],
  ];

  const scoreRows = data.scores.map((item) => [escapeCsvCell(item.label), item.score]);
  const questionRows = Object.entries(data.researchAnswers).map(([key, value]) => [key.toUpperCase(), escapeCsvCell(value)]);

  const lines = [
    "Field,Value",
    ...headerRows.map((row) => `${row[0]},${row[1]}`),
    "",
    "Category,Score",
    ...scoreRows.map((row) => `${row[0]},${row[1]}`),
    "",
    "Question,Answer",
    ...questionRows.map((row) => `${row[0]},${row[1]}`),
  ];

  downloadFile(lines.join("\n"), `ai-audit-${safeFileName(data.businessName || "report")}.csv`, "text/csv");
}

function downloadTxtReport(data) {
  const lines = [
    "AI READINESS AUDIT REPORT",
    "========================",
    `Business Name: ${data.businessName}`,
    `Industry: ${data.industry}`,
    `Contact: ${data.contact}`,
    `Audit Date: ${data.auditDate}`,
    "",
    `Overall Maturity: ${data.result.level}`,
    `Average Score: ${data.result.average}/5`,
    "",
    "Category Scores:",
    ...data.scores.map((item) => `- ${item.label}: ${item.score}/5`),
    "",
    "Research Answers:",
    `- Q19: ${data.researchAnswers.q19}`,
    `- Q20: ${data.researchAnswers.q20}`,
    `- Q21: ${data.researchAnswers.q21}`,
    `- Q22: ${data.researchAnswers.q22}`,
    `- Q23: ${data.researchAnswers.q23}`,
    `- Q24: ${data.researchAnswers.q24}`,
    "",
    "Generative AI Use Cases:",
    ...(data.selectedUseCases.length ? data.selectedUseCases.map((item) => `- ${item}`) : ["- None selected"]),
    "",
    "Recommendations:",
    ...data.result.guidance.map((item, index) => `${index + 1}. ${item}`),
    "",
    "Reach out to us at FuturefitAI@legal.com",
  ];

  downloadFile(lines.join("\n"), `ai-audit-${safeFileName(data.businessName || "report")}.txt`, "text/plain");
}

function downloadFile(content, fileName, contentType) {
  const blob = new Blob([content], { type: `${contentType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function safeFileName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function generateAiSummary(payload, result) {
  aiSummary.textContent = `Summary draft for ${payload.businessName}: ${payload.businessName} is currently at a ${result.level.toLowerCase()} AI readiness stage (${result.average}/5). Focus first on ${result.guidance[0].toLowerCase()}`;
}
