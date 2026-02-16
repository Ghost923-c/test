const categories = [
  {
    key: "strategy",
    label: "AI Strategy & Leadership",
    prompt: "Does leadership have a clear AI strategy and business goals?",
  },
  {
    key: "governance",
    label: "Governance, Ethics & POPIA Readiness",
    prompt: "Are data governance, ethics, and POPIA compliance controls in place for AI use?",
  },
  {
    key: "data",
    label: "Data Quality & Accessibility",
    prompt: "Is business data accurate, secure, and accessible for AI projects?",
  },
  {
    key: "technology",
    label: "Technology Stack",
    prompt: "Can current systems integrate with modern AI solutions and automation tools?",
  },
  {
    key: "skills",
    label: "People & Skills",
    prompt: "Do staff have the skills to adopt and govern AI responsibly?",
  },
  {
    key: "comms",
    label: "Communication & Change Management",
    prompt: "Is there a communication plan to support AI adoption and stakeholder trust?",
  },
];

const form = document.getElementById("audit-form");
const questionList = document.getElementById("question-list");
const results = document.getElementById("results");
const scoreBreakdown = document.getElementById("score-breakdown");
const recommendations = document.getElementById("recommendations");
const aiSummary = document.getElementById("ai-summary");
const exportBtn = document.getElementById("exportBtn");
const resetBtn = document.getElementById("resetBtn");

buildQuestions();
setDefaultDate();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const payload = collectPayload();
  const result = evaluateAudit(payload.scores);

  renderResults(payload, result);
  generateAiSummary(payload, result);
});

exportBtn.addEventListener("click", () => {
  const payload = collectPayload();
  const result = evaluateAudit(payload.scores);
  downloadJson({ ...payload, result });
});

resetBtn.addEventListener("click", () => {
  results.classList.add("hidden");
  scoreBreakdown.innerHTML = "";
  recommendations.innerHTML = "";
  aiSummary.textContent = "No AI summary generated yet.";
});

function buildQuestions() {
  const options = [1, 2, 3, 4, 5]
    .map((value) => `<option value="${value}">${value}</option>`)
    .join("");

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

function setDefaultDate() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("auditDate").value = today;
}

function collectPayload() {
  const scores = categories.map((category) => ({
    key: category.key,
    label: category.label,
    score: Number(document.getElementById(category.key).value || 0),
  }));

  return {
    businessName: document.getElementById("businessName").value.trim(),
    industry: document.getElementById("industry").value.trim(),
    contact: document.getElementById("contact").value.trim(),
    auditDate: document.getElementById("auditDate").value,
    scores,
  };
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

  return {
    total,
    average: Number(average.toFixed(2)),
    level,
    className,
    guidance,
  };
}

function renderResults(payload, result) {
  const list = payload.scores
    .map((item) => `<li><strong>${item.label}:</strong> ${item.score}/5</li>`)
    .join("");

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

function downloadJson(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ai-audit-${safeFileName(data.businessName || "report")}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function safeFileName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function generateAiSummary(payload, result) {
  // Placeholder for your later OpenAI API integration.
  // You can replace this block with a fetch() call to your backend once keys are configured.
  aiSummary.textContent = `Summary draft for ${payload.businessName}: ${payload.businessName} is currently at a ${result.level.toLowerCase()} AI readiness stage (${result.average}/5). Focus first on ${result.guidance[0].toLowerCase()}`;
}
