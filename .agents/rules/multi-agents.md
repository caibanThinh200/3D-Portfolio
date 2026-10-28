---
name: multi-agent-architect
description: >-
  Activates a multi-agent architecture for every user prompt. Use this skill
  whenever the user asks to implement a feature, fix a bug, refactor code, or
  make any meaningful change to the codebase. The Coordinator (Claude Sonnet,
  full tools) orchestrates two subagents: an Explore agent (Gemini 2.0 Flash,
  read-only) that researches the codebase, and an Implement agent (Gemini 2.0
  Flash, write access) that applies changes based on the Explore agent's
  findings.
---

# Multi-Agent Architect

Every non-trivial user request MUST be handled using the three-tier agent
architecture described below. Do NOT attempt to explore and implement in a
single agent pass.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│              COORDINATOR (You)                  │
│  Model : Claude Sonnet (current session model)  │
│  Tools : Full access (all tools)                │
│  Role  : Orchestration, planning, synthesis     │
└──────────────┬──────────────────────────────────┘
               │ spawns
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌──────────────────┐
│   EXPLORE   │  │    IMPLEMENT     │
│  (Phase 1)  │  │    (Phase 2)     │
│─────────────│  │──────────────────│
│ gemini-2.0- │  │ gemini-2.0-flash │
│ flash       │  │                  │
│ READ-ONLY   │  │ WRITE ACCESS     │
│ No commands │  │ Full edit + run  │
│ No edits    │  │                  │
└─────────────┘  └──────────────────┘
```

---

## Step-by-Step Execution Protocol

### Step 1 — Coordinator: Decompose the Task

Before spawning any subagent, the Coordinator MUST:

1. **Understand** the user's intent fully.
2. **Draft an Exploration Brief** — a precise, scoped set of questions for the
   Explore agent:
   - Which files/directories are relevant?
   - What existing patterns, types, APIs, or constraints apply?
   - Are there any gotchas (SSR, hydration, dynamic imports, etc.)?
3. **Draft an Implementation Plan** (tentative) — a high-level list of changes
   expected, to be refined after exploration.

---

### Step 2 — Spawn the EXPLORE Subagent

Spawn the Explore subagent with the following configuration:

| Property          | Value                                            |
| :---------------- | :----------------------------------------------- |
| **Model**         | `gemini-2.0-flash`                               |
| **Permissions**   | Read-only (no run_command, no file writes)       |
| **Allowed tools** | view_file, list_dir, grep_search, read_url_content, search_web |
| **Goal**          | Answer the Exploration Brief; return structured findings |

**Explore Agent Task Template:**

```
You are the EXPLORE agent in a multi-agent system. Your ONLY job is to
research the codebase and return structured findings. You MUST NOT edit
any file or run any command.

## Exploration Brief
{COORDINATOR_EXPLORATION_BRIEF}

## Instructions
1. Read every relevant file listed in the brief.
2. Search for related patterns (grep for type names, component names, hooks).
3. Note file paths, line numbers, existing patterns, and any constraints.
4. Return a structured Findings Report with:
   - Relevant files (path + key lines)
   - Existing patterns to follow
   - Potential conflicts or risks
   - Recommended implementation approach

Return ONLY the Findings Report. Do not implement anything.
```

---

### Step 3 — Coordinator: Synthesize & Refine Plan

After the Explore agent returns:

1. **Review** the Findings Report carefully.
2. **Update** the Implementation Plan with concrete file paths, line numbers,
   and code patterns discovered.
3. **Produce a final Implementation Brief** for the Implement agent:
   - Exact files to create or edit
   - Exact changes to make (with line references where possible)
   - Order of operations (e.g., types → utils → component → page → tests)
   - Validation steps (e.g., `npm run build`, check for TS errors)

---

### Step 4 — Spawn the IMPLEMENT Subagent

Spawn the Implement subagent with the following configuration:

| Property          | Value                                            |
| :---------------- | :----------------------------------------------- |
| **Model**         | `gemini-2.0-flash`                               |
| **Permissions**   | Full write access                                |
| **Allowed tools** | All tools (edit, create, run_command, grep, view)|
| **Goal**          | Execute the Implementation Brief exactly         |

**Implement Agent Task Template:**

```
You are the IMPLEMENT agent in a multi-agent system. Your job is to apply
code changes precisely as described in the Implementation Brief below.

## Implementation Brief
{COORDINATOR_IMPLEMENTATION_BRIEF}

## Findings Report (from Explore agent)
{EXPLORE_FINDINGS_REPORT}

## Instructions
1. Follow the Implementation Brief step by step.
2. Use the Findings Report to inform exact file paths and code patterns.
3. After ALL changes are applied, run validation:
   - `npm run build` (or equivalent) to check for errors
   - Fix any TypeScript / lint errors before returning
4. Return a Completion Report:
   - List of files created/modified (with brief description of change)
   - Any deviations from the brief (with justification)
   - Validation output (build success / errors resolved)

Do NOT skip validation. Do NOT return until the code compiles cleanly.
```

---

### Step 5 — Coordinator: Final Review & User Report

After the Implement agent returns:

1. **Verify** the Completion Report — check that all planned changes were made.
2. **Spot-check** key files with `view_file` if anything looks suspicious.
3. **Summarize** the work done to the user in a clear, friendly message:
   - What was explored
   - What was changed (file list)
   - How to verify / test the result
4. If issues remain, spawn a **second Implement pass** with corrective
   instructions.

---

## Model Configuration

| Agent       | Model ID           | Notes                            |
| :---------- | :----------------- | :------------------------------- |
| Coordinator | Claude Sonnet      | Current session model            |
| Explore     | gemini-2.0-flash   | Read-only, fast, cheap           |
| Implement   | gemini-2.0-flash   | Full tools, focused on execution |

---

## Rules & Constraints

- The Coordinator NEVER directly edits files. It only orchestrates.
- The Explore agent NEVER edits files or runs terminal commands.
- The Implement agent NEVER explores — it receives a complete brief.
- If the task is trivial (e.g., answer a question, explain a concept), skip
  the multi-agent flow and respond directly.
- Always run validation (`npm run build` or `tsc --noEmit`) at the end of
  the Implement phase.
