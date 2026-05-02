const SAMPLE_CODE = `import math


def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)


def summarize(values):
    total = sum(values)
    average = total / len(values)
    print("Values:", values)
    print("Total:", total)
    print("Average:", round(average, 2))


numbers = [fibonacci(i) for i in range(6)]
summarize(numbers)
print("Square root of last value:", round(math.sqrt(numbers[-1]), 2))
`;

const state = {
    lastTrace: null
};

const elements = {
    codeEditor: document.getElementById("codeEditor"),
    clearBtn: document.getElementById("clearBtn"),
    loadSampleBtn: document.getElementById("loadSampleBtn"),
    analyzeBtn: document.getElementById("analyzeBtn"),
    executeBtn: document.getElementById("executeBtn"),
    traceBtn: document.getElementById("traceBtn"),
    fullAnalysisBtn: document.getElementById("fullAnalysisBtn"),
    analysisResults: document.getElementById("analysisResults"),
    executionResults: document.getElementById("executionResults"),
    traceResults: document.getElementById("traceResults"),
    visualizationResults: document.getElementById("visualizationResults"),
    statusText: document.getElementById("statusText"),
    statusIndicator: document.getElementById("statusIndicator"),
    tabButtons: Array.from(document.querySelectorAll(".tab-button")),
    tabContents: Array.from(document.querySelectorAll(".tab-content"))
};

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatValue(value) {
    if (value === null || value === undefined || value === "") {
        return "None";
    }

    if (typeof value === "string") {
        return escapeHtml(value);
    }

    return escapeHtml(JSON.stringify(value, null, 2));
}

function withDefault(value, fallbackValue) {
    return value === null || value === undefined ? fallbackValue : value;
}

function setStatus(message, tone = "ready") {
    elements.statusText.textContent = message;
    elements.statusIndicator.classList.remove("loading", "error");

    if (tone === "loading") {
        elements.statusIndicator.classList.add("loading");
    } else if (tone === "error") {
        elements.statusIndicator.classList.add("error");
    }
}

function setButtonState(disabled) {
    [
        elements.clearBtn,
        elements.loadSampleBtn,
        elements.analyzeBtn,
        elements.executeBtn,
        elements.traceBtn,
        elements.fullAnalysisBtn
    ].forEach((button) => {
        button.disabled = disabled;
    });
}

function activateTab(tabId) {
    elements.tabButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.tab === tabId);
    });

    elements.tabContents.forEach((content) => {
        content.classList.toggle("active", content.id === tabId);
    });
}

function getCodeOrThrow() {
    const code = elements.codeEditor.value;

    if (!code.trim()) {
        throw new Error("Enter some Python code first.");
    }

    return code;
}

async function postJson(url, payload) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || `Request failed: ${response.status}`);
    }

    return data;
}

function renderPlaceholder(target, message) {
    target.innerHTML = `<p class="placeholder">${escapeHtml(message)}</p>`;
}

function renderError(target, message) {
    target.innerHTML = `
        <div class="issue-item error">
            <div class="issue-line">Error</div>
            <div class="issue-message">${escapeHtml(message)}</div>
        </div>
    `;
}

function renderInfoCard(title, lines) {
    const body = lines
        .map((line) => `<div class="analysis-item">${line}</div>`)
        .join("");

    return `
        <div class="analysis-card">
            <div class="analysis-card-title">${escapeHtml(title)}</div>
            ${body}
        </div>
    `;
}

function renderList(title, items, emptyMessage, formatter) {
    if (!items || items.length === 0) {
        return renderInfoCard(title, [`<span class="analysis-item-label">${escapeHtml(emptyMessage)}</span>`]);
    }

    const content = items.map(formatter).join("");
    return `
        <div class="analysis-card">
            <div class="analysis-card-title">${escapeHtml(title)}</div>
            ${content}
        </div>
    `;
}

function countAstNodes(node) {
    if (!node) {
        return 0;
    }

    return 1 + (node.children || []).reduce((total, child) => total + countAstNodes(child), 0);
}

function renderAnalysis(analysis) {
    if (!analysis) {
        renderPlaceholder(elements.analysisResults, "Run analysis to see results");
        return;
    }

    if (analysis.error) {
        renderError(elements.analysisResults, analysis.error);
        return;
    }

    const structure = analysis.structure || {};
    const complexity = analysis.complexity || {};
    const issues = analysis.issues || [];
    const imports = analysis.imports || [];
    const definitions = analysis.definitions || [];

    elements.analysisResults.innerHTML = [
        renderInfoCard("Overview", [
            `<span class="analysis-item-label">Status:</span> <span class="analysis-item-value">${escapeHtml(analysis.status || "unknown")}</span>`,
            `<span class="analysis-item-label">Syntax valid:</span> <span class="analysis-item-value">${analysis.syntax_valid ? "Yes" : "No"}</span>`,
            `<span class="analysis-item-label">Definitions found:</span> <span class="analysis-item-value">${definitions.length}</span>`,
            `<span class="analysis-item-label">Imports found:</span> <span class="analysis-item-value">${imports.length}</span>`
        ]),
        renderInfoCard("Complexity", [
            `<span class="analysis-item-label">Cyclomatic:</span> <span class="analysis-item-value">${withDefault(complexity.cyclomatic, 0)}</span>`,
            `<span class="analysis-item-label">Cognitive:</span> <span class="analysis-item-value">${withDefault(complexity.cognitive, 0)}</span>`
        ]),
        renderList(
            "Functions",
            structure.functions || [],
            "No functions detected",
            (item) => `
                <div class="structure-item">
                    <span class="structure-item-type">Function</span>
                    <span class="structure-item-name">${escapeHtml(item.name || "anonymous")}</span>
                    <span class="structure-item-line">Line ${item.lineno || "-"}</span>
                </div>
            `
        ),
        renderList(
            "Classes",
            structure.classes || [],
            "No classes detected",
            (item) => `
                <div class="structure-item">
                    <span class="structure-item-type">Class</span>
                    <span class="structure-item-name">${escapeHtml(item.name || "anonymous")}</span>
                    <span class="structure-item-line">Line ${item.lineno || "-"}</span>
                </div>
            `
        ),
        renderList(
            "Variables",
            structure.variables || [],
            "No module-level variables detected",
            (item) => `
                <div class="structure-item">
                    <span class="structure-item-type">Variable</span>
                    <span class="structure-item-name">${escapeHtml(item.name || "unnamed")}</span>
                    <span class="structure-item-line">Line ${item.lineno || "-"}</span>
                </div>
            `
        ),
        renderList(
            "Imports",
            imports,
            "No imports detected",
            (item) => `
                <div class="structure-item">
                    <span class="structure-item-type">${escapeHtml(item.type || "import")}</span>
                    <span class="structure-item-name">${escapeHtml(item.module || (item.names || []).join(", "))}</span>
                </div>
            `
        ),
        renderList(
            "Definitions",
            definitions,
            "No definitions detected",
            (item) => `
                <div class="structure-item">
                    <span class="structure-item-type">${escapeHtml(item.type || "item")}</span>
                    <span class="structure-item-name">${escapeHtml(item.name || "unnamed")}</span>
                    <span class="structure-item-line">Line ${item.line || "-"}</span>
                </div>
            `
        ),
        renderList(
            "Issues",
            issues,
            "No lint issues detected",
            (item) => `
                <div class="issue-item ${escapeHtml(item.severity || "info")}">
                    <div class="issue-line">Line ${item.line || "-"} - ${escapeHtml(item.severity || "info")}</div>
                    <div class="issue-message">${escapeHtml(item.message || "Unknown issue")}</div>
                </div>
            `
        ),
        renderList(
            "Per-Function Complexity",
            complexity.functions || [],
            "No function complexity data available",
            (item) => `
                <div class="structure-item">
                    <span class="structure-item-type">Function</span>
                    <span class="structure-item-name">${escapeHtml(item.name || "anonymous")}</span>
                    <span class="structure-item-line">Complexity ${withDefault(item.complexity, 0)}</span>
                </div>
            `
        )
    ].join("");
}

function renderExecution(execution) {
    if (!execution) {
        renderPlaceholder(elements.executionResults, "Run code to see output");
        return;
    }

    if (execution.error && !execution.stdout && !execution.stderr) {
        renderError(elements.executionResults, execution.error);
        return;
    }

    const stdout = execution.stdout || "";
    const stderr = execution.stderr || "";
    const tone = execution.success ? "info-value" : "info-value error";

    elements.executionResults.innerHTML = `
        <div class="output-section">
            <div class="output-title">Execution Summary</div>
            <div class="output-info">
                <div class="info-item">Success: <span class="${tone}">${execution.success ? "Yes" : "No"}</span></div>
                <div class="info-item">Exit Code: <span class="${tone}">${withDefault(execution.exit_code, "-")}</span></div>
                <div class="info-item">Time: <span class="info-value">${withDefault(execution.execution_time, 0)}s</span></div>
            </div>
        </div>
        <div class="output-section">
            <div class="output-title">Standard Output</div>
            <div class="output-text">${stdout ? formatValue(stdout) : "<span class=\"placeholder\">No stdout captured</span>"}</div>
        </div>
        <div class="output-section">
            <div class="output-title">Standard Error</div>
            <div class="output-text">${stderr ? formatValue(stderr) : "<span class=\"placeholder\">No stderr captured</span>"}</div>
        </div>
        ${
            execution.error
                ? `
                    <div class="output-section">
                        <div class="output-title">Error</div>
                        <div class="output-text">${escapeHtml(execution.error)}</div>
                    </div>
                `
                : ""
        }
    `;
}

function renderTrace(trace) {
    if (!trace) {
        renderPlaceholder(elements.traceResults, "Run trace to see execution flow");
        return;
    }

    if (trace.error && (!trace.events || trace.events.length === 0)) {
        renderError(elements.traceResults, trace.error);
        return;
    }

    const events = trace.events || [];
    const variables = trace.variables || {};
    const variableNames = Object.keys(variables);

    const summary = renderInfoCard("Trace Summary", [
        `<span class="analysis-item-label">Success:</span> <span class="analysis-item-value">${trace.success ? "Yes" : "No"}</span>`,
        `<span class="analysis-item-label">Events captured:</span> <span class="analysis-item-value">${events.length}</span>`,
        `<span class="analysis-item-label">Lines executed:</span> <span class="analysis-item-value">${withDefault(trace.line_count, 0)}</span>`,
        `<span class="analysis-item-label">Tracked variables:</span> <span class="analysis-item-value">${variableNames.length}</span>`
    ]);

    const eventMarkup = events.length === 0
        ? `<p class="placeholder">No trace events recorded</p>`
        : events.slice(0, 100).map((event) => {
            const locals = event.locals
                ? Object.entries(event.locals).map(([name, info]) => `
                    <div class="trace-var-item">
                        <span class="trace-var-name">${escapeHtml(name)}</span> =
                        ${escapeHtml(info.value)} <span class="analysis-item-label">(${escapeHtml(info.type)})</span>
                    </div>
                `).join("")
                : "";

            return `
                <div class="trace-event">
                    <span class="trace-event-type">${escapeHtml(event.type || "event")}</span>
                    ${event.function ? `<span class="trace-event-function">${escapeHtml(event.function)}</span>` : ""}
                    ${event.lineno ? `<span class="trace-line-no">Line ${event.lineno}</span>` : ""}
                    ${locals ? `<div class="trace-variables">${locals}</div>` : ""}
                </div>
            `;
        }).join("");

    const variableMarkup = renderList(
        "Variable History",
        variableNames,
        "No tracked variables yet",
        (name) => {
            const history = variables[name] || [];
            const lastItem = history[history.length - 1];
            return `
                <div class="structure-item">
                    <span class="structure-item-type">Variable</span>
                    <span class="structure-item-name">${escapeHtml(name)}</span>
                    <span class="structure-item-line">${escapeHtml(lastItem ? lastItem.value : "No value")}</span>
                </div>
            `;
        }
    );

    elements.traceResults.innerHTML = `
        ${summary}
        <div class="analysis-card">
            <div class="analysis-card-title">Execution Events</div>
            ${eventMarkup}
        </div>
        ${variableMarkup}
        ${
            trace.error
                ? `
                    <div class="issue-item warning">
                        <div class="issue-line">Trace completed with error</div>
                        <div class="issue-message">${escapeHtml(trace.error)}</div>
                    </div>
                `
                : ""
        }
    `;
}

function renderVisualization(visualizations, callGraph = null) {
    if (!visualizations) {
        renderPlaceholder(elements.visualizationResults, "Run analysis to generate visualizations");
        return;
    }

    const astData = visualizations.ast || null;
    const flowData = visualizations.flow || {};
    const dependencyData = visualizations.dependencies || {};
    const astRoot = astData ? astData.root : null;
    const astNodeCount = countAstNodes(astRoot);
    const flowNodes = flowData.nodes || [];
    const flowEdges = flowData.edges || [];
    const dependencyFunctions = dependencyData.functions || [];
    const dependencyClasses = dependencyData.classes || [];
    const dependencyImports = dependencyData.imports || [];
    const callGraphNodes = callGraph ? Object.values(callGraph.nodes || {}) : [];
    const callGraphEdges = callGraph ? callGraph.edges || [] : [];
    const astStatus = astData && astData.status ? astData.status : "not loaded";
    const astRootType = astRoot && astRoot.type ? astRoot.type : "Unavailable";
    const astChildCount = astRoot && astRoot.children ? astRoot.children.length : 0;

    elements.visualizationResults.innerHTML = [
        renderInfoCard("Visualization Overview", [
            `<span class="analysis-item-label">AST status:</span> <span class="analysis-item-value">${escapeHtml(astStatus)}</span>`,
            `<span class="analysis-item-label">AST nodes:</span> <span class="analysis-item-value">${astNodeCount}</span>`,
            `<span class="analysis-item-label">Flow nodes:</span> <span class="analysis-item-value">${flowNodes.length}</span>`,
            `<span class="analysis-item-label">Flow edges:</span> <span class="analysis-item-value">${flowEdges.length}</span>`
        ]),
        renderInfoCard("AST Root", [
            `<span class="analysis-item-label">Node type:</span> <span class="analysis-item-value">${escapeHtml(astRootType)}</span>`,
            `<span class="analysis-item-label">Child count:</span> <span class="analysis-item-value">${astChildCount}</span>`
        ]),
        renderList(
            "Flow Nodes",
            flowNodes,
            "No flow nodes generated",
            (node) => `
                <div class="structure-item">
                    <span class="structure-item-type">${escapeHtml(node.type || "node")}</span>
                    <span class="structure-item-name">${escapeHtml(node.label || node.id || "Unnamed")}</span>
                </div>
            `
        ),
        renderList(
            "Dependencies",
            dependencyImports.concat(dependencyFunctions).concat(dependencyClasses),
            "No dependency data generated",
            (item) => {
                const label = item.module || item.name || (item.names || []).join(", ") || "item";
                const type = item.type || (item.methods ? "class" : "function");
                return `
                    <div class="structure-item">
                        <span class="structure-item-type">${escapeHtml(type)}</span>
                        <span class="structure-item-name">${escapeHtml(label)}</span>
                    </div>
                `;
            }
        ),
        renderList(
            "Call Graph",
            callGraphNodes,
            "Run trace or full analysis to generate a call graph",
            (node) => `
                <div class="structure-item">
                    <span class="structure-item-type">Function</span>
                    <span class="structure-item-name">${escapeHtml(node.name || "unknown")}</span>
                    <span class="structure-item-line">Calls ${withDefault(node.call_count, withDefault(node.calls, 0))}</span>
                </div>
            `
        ),
        renderInfoCard("Call Graph Connections", [
            `<span class="analysis-item-label">Functions:</span> <span class="analysis-item-value">${callGraphNodes.length}</span>`,
            `<span class="analysis-item-label">Edges:</span> <span class="analysis-item-value">${callGraphEdges.length}</span>`,
            `<span class="analysis-item-label">Dependency functions:</span> <span class="analysis-item-value">${dependencyFunctions.length}</span>`,
            `<span class="analysis-item-label">Dependency classes:</span> <span class="analysis-item-value">${dependencyClasses.length}</span>`
        ])
    ].join("");
}

async function loadCallGraph(traceData) {
    if (!traceData || !traceData.events) {
        return null;
    }

    try {
        return await postJson("/api/visualize/callgraph", { trace_data: traceData });
    } catch (error) {
        return null;
    }
}

async function withBusyState(task, loadingMessage, successMessage) {
    setButtonState(true);
    setStatus(loadingMessage, "loading");

    try {
        await task();
        setStatus(successMessage);
    } catch (error) {
        setStatus(error.message || "Something went wrong.", "error");
        throw error;
    } finally {
        setButtonState(false);
    }
}

async function runAnalyze() {
    try {
        const code = getCodeOrThrow();

        await withBusyState(async () => {
            const [analysis, astData, flowData, dependencyData] = await Promise.all([
                postJson("/api/analyze", { code }),
                postJson("/api/visualize/ast", { code }),
                postJson("/api/visualize/flow", { code }),
                postJson("/api/visualize/dependencies", { code })
            ]);

            renderAnalysis(analysis);
            renderVisualization({
                ast: astData,
                flow: flowData,
                dependencies: dependencyData
            }, null);
            activateTab("analysis");
        }, "Analyzing code...", "Analysis complete.");
    } catch (error) {
        renderError(elements.analysisResults, error.message);
    }
}

async function runExecute() {
    try {
        const code = getCodeOrThrow();

        await withBusyState(async () => {
            const execution = await postJson("/api/execute", { code });
            renderExecution(execution);
            activateTab("execution");
        }, "Executing code...", "Execution finished.");
    } catch (error) {
        renderError(elements.executionResults, error.message);
    }
}

async function runTrace() {
    try {
        const code = getCodeOrThrow();

        await withBusyState(async () => {
            const [trace, astData, flowData, dependencyData] = await Promise.all([
                postJson("/api/trace", { code }),
                postJson("/api/visualize/ast", { code }),
                postJson("/api/visualize/flow", { code }),
                postJson("/api/visualize/dependencies", { code })
            ]);
            const callGraph = await loadCallGraph(trace);

            state.lastTrace = trace;
            renderTrace(trace);
            renderVisualization(
                {
                    ast: astData,
                    flow: flowData,
                    dependencies: dependencyData
                },
                callGraph
            );

            activateTab("trace");
        }, "Tracing execution...", "Trace complete.");
    } catch (error) {
        renderError(elements.traceResults, error.message);
    }
}

async function runFullAnalysis() {
    try {
        const code = getCodeOrThrow();

        await withBusyState(async () => {
            const fullResult = await postJson("/api/full-analysis", { code });
            const callGraph = await loadCallGraph(fullResult.trace);

            state.lastTrace = fullResult.trace || null;

            renderAnalysis(fullResult.analysis);
            renderExecution(fullResult.execution);
            renderTrace(fullResult.trace);
            renderVisualization(fullResult.visualizations, callGraph);
            activateTab("analysis");
        }, "Running full analysis...", "Full analysis complete.");
    } catch (error) {
        renderError(elements.analysisResults, error.message);
    }
}

function clearWorkspace() {
    elements.codeEditor.value = "";
    state.lastTrace = null;
    renderPlaceholder(elements.analysisResults, "Run analysis to see results");
    renderPlaceholder(elements.executionResults, "Run code to see output");
    renderPlaceholder(elements.traceResults, "Run trace to see execution flow");
    renderPlaceholder(elements.visualizationResults, "Run analysis to generate visualizations");
    setStatus("Editor cleared.");
    activateTab("analysis");
}

function loadSample() {
    elements.codeEditor.value = SAMPLE_CODE;
    setStatus("Sample code loaded.");
}

function registerEvents() {
    elements.tabButtons.forEach((button) => {
        button.addEventListener("click", () => activateTab(button.dataset.tab));
    });

    elements.clearBtn.addEventListener("click", clearWorkspace);
    elements.loadSampleBtn.addEventListener("click", loadSample);
    elements.analyzeBtn.addEventListener("click", runAnalyze);
    elements.executeBtn.addEventListener("click", runExecute);
    elements.traceBtn.addEventListener("click", runTrace);
    elements.fullAnalysisBtn.addEventListener("click", runFullAnalysis);

    elements.codeEditor.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            runFullAnalysis();
        }
    });
}

function initialize() {
    registerEvents();
    loadSample();
    renderPlaceholder(elements.analysisResults, "Run analysis to see results");
    renderPlaceholder(elements.executionResults, "Run code to see output");
    renderPlaceholder(elements.traceResults, "Run trace to see execution flow");
    renderPlaceholder(elements.visualizationResults, "Run analysis to generate visualizations");
    setStatus("Ready. Press Ctrl+Enter to run full analysis.");
}

initialize();
