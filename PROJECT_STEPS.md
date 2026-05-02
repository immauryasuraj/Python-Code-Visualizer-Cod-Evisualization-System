# PYTHON CODE VISUALIZER - STEP-BY-STEP GUIDE

## 🚀 PROJECT OVERVIEW

This is a **professional Python code visualization system** with real-time analysis, execution tracing, and interactive visualization.

---

## 📑 TABLE OF CONTENTS

1. [Architecture](#architecture)
2. [Phase 1: Setup](#phase-1-setup)
3. [Phase 2: Backend Core](#phase-2-backend-core)
4. [Phase 3: Advanced Features](#phase-3-advanced-features)
5. [Phase 4: Frontend](#phase-4-frontend)
6. [Phase 5: Integration](#phase-5-integration)

---

## 🏗️ ARCHITECTURE

```
code-visualizer/
│
├── backend/                    (Python backend)
│   ├── main.py                (Flask app - HTTP server)
│   ├── step1_analyzer.py       (AST analysis - STEP 1)
│   ├── step2_executor.py       (Code execution - STEP 2)
│   ├── step3_tracer.py         (Execution tracing - STEP 3)
│   ├── step4_visualizer.py     (Visualization - STEP 4)
│   ├── requirements.txt        (Dependencies)
│   └── docs/
│       ├── STEP1.md            (Analyzer docs)
│       ├── STEP2.md            (Executor docs)
│       ├── STEP3.md            (Tracer docs)
│       └── STEP4.md            (Visualizer docs)
│
├── frontend/                   (Web UI)
│   ├── index.html             (HTML layout - STEP 5)
│   ├── style.css              (Styling - STEP 6)
│   ├── script.js              (Interactivity - STEP 7)
│   └── assets/
│       └── sample.py          (Test file)
│
├── docs/                       (Project documentation)
│   ├── QUICK_START.md         (Quick start guide)
│   ├── ARCHITECTURE.md        (System design)
│   ├── API.md                 (API reference)
│   └── TROUBLESHOOTING.md     (Troubleshooting)
│
└── README.md                  (Main documentation)
```

---

## 🔧 PHASE 1: SETUP

### Step 1.1: Create Folder Structure
```bash
cd code-visualizer

# Create directories
mkdir backend frontend frontend/assets docs
```

### Step 1.2: Create requirements.txt
Python dependencies needed for the project.

### Step 1.3: Initialize Virtual Environment
```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

---

## 🧠 PHASE 2: BACKEND CORE (4 Key Modules)

### STEP 1: Code Analyzer (step1_analyzer.py)
**Purpose**: Parse and analyze Python code structure

**Capabilities**:
- Parse code using AST (Abstract Syntax Tree)
- Extract classes, functions, variables
- Calculate complexity metrics
- Perform linting and validation
- Generate documentation

**Key Functions**:
```python
def analyze(code)              # Full analysis
def get_structure(code)        # Extract structure
def lint_code(code)            # Find issues
def calculate_complexity(code) # Complexity metrics
```

### STEP 2: Code Executor (step2_executor.py)
**Purpose**: Safely execute Python code

**Capabilities**:
- Execute code in isolated environment
- Capture stdout/stderr
- Handle exceptions safely
- Timeout management
- Return execution results

**Key Functions**:
```python
def execute(code)              # Run code
def execute_in_subprocess()    # Isolated execution
def test_code(code)            # Run tests
```

### STEP 3: Execution Tracer (step3_tracer.py)
**Purpose**: Trace execution flow and variable states

**Capabilities**:
- Track line-by-line execution
- Monitor variable changes
- Record function calls
- Build call stack
- Track execution events

**Key Functions**:
```python
def execute_with_trace(code)    # Trace execution
def trace_variables(code)       # Track variables
def get_stack_trace(error)      # Parse errors
```

### STEP 4: Visualizer (step4_visualizer.py)
**Purpose**: Generate visual representations

**Capabilities**:
- Convert AST to tree format
- Generate flow diagrams
- Create dependency graphs
- Export Mermaid diagrams
- Visualize call hierarchies

**Key Functions**:
```python
def visualize_ast(code)         # AST visualization
def visualize_flow(code)        # Control flow
def visualize_dependencies()    # Dependency graph
```

---

## 🌐 PHASE 3: FRONTEND (3 Key Components)

### STEP 5: HTML Structure (index.html)
**Components**:
- Sidebar (file explorer, search, recent files)
- Main editor (code input with line numbers)
- Right panel (analysis tabs)
- Terminal/Output console
- Status bar

### STEP 6: Styling (style.css)
**Theme**: VS Code dark theme
- Professional dark colors
- Responsive layout
- Smooth animations
- Syntax highlighting integration

### STEP 7: JavaScript (script.js)
**Features**:
- Editor interactions
- API communication
- Real-time analysis
- Output display
- File management
- Keyboard shortcuts

---

## 🔄 PHASE 4: INTEGRATION

### Step 4.1: Flask Server (main.py)
**15+ API Endpoints**:
```
/api/analyze            - Full code analysis
/api/execute            - Run code
/api/visualize/ast      - AST visualization
/api/visualize/flow     - Flow diagram
/api/file/read          - Read file
/api/file/write         - Save file
... and more
```

### Step 4.2: CORS & Routing
Setup cross-origin requests and proper routing

---

## 📊 QUICK START

### Installation
```bash
cd code-visualizer
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Running
```bash
cd backend
python main.py
# Access at http://localhost:5000
```

### Testing
```bash
# Run sample code
# Write your own code
# View analysis results
# Execute and see output
```

---

## 🎯 KEY FEATURES

✅ **Real-time Analysis** - AST parsing and structure extraction
✅ **Execution Tracing** - Track variable states during execution
✅ **Flow Visualization** - See control flow as diagrams
✅ **Error Handling** - Detailed error messages and stack traces
✅ **Complexity Metrics** - Cyclomatic and cognitive complexity
✅ **Documentation** - Auto-generate from docstrings
✅ **Testing** - Unit test runner with results
✅ **Linting** - Real-time code quality checks
✅ **File Management** - Browse, open, create, edit files
✅ **Search** - Find files and content

---

## 📚 DETAILED STEPS

Each phase has detailed documentation:

### Phase 1: Setup
- Create folder structure
- Install dependencies
- Configure environment

### Phase 2: Backend
- Build analyzer module
- Build executor module
- Build tracer module
- Build visualizer module

### Phase 3: Frontend
- Create HTML layout
- Add CSS styling
- Implement JavaScript logic

### Phase 4: Integration
- Create Flask server
- Connect all modules
- Setup API endpoints

### Phase 5: Enhancement
- Add advanced features
- Optimize performance
- Add error handling

---

## 🚀 GETTING STARTED

Start with **STEP 1** (Analyzer) and work through sequentially. Each step builds on the previous one.

See individual STEP files for detailed implementation:
- [STEP 1: Analyzer](./backend/docs/STEP1.md)
- [STEP 2: Executor](./backend/docs/STEP2.md)
- [STEP 3: Tracer](./backend/docs/STEP3.md)
- [STEP 4: Visualizer](./backend/docs/STEP4.md)

---

**Status**: Ready to build! 🔨
**Last Updated**: March 26, 2026
