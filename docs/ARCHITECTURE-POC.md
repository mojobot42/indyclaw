# CincyClaw Architecture — Proof of Concept Design Document

**Version:** 1.0 — March 17, 2026
**Author:** Mojo (AI Architect) + Bryan Wilson
**Status:** Draft — Evolving with NVIDIA NemoClaw early preview

---

## Executive Summary

CincyClaw deploys autonomous AI agents for businesses. This document defines our target architecture by synthesizing five emerging technology layers into a single, deployable proof of concept — using Mojo (our own production AI agent) as the reference implementation.

**Core thesis:** OpenClaw provides the agent runtime. NVIDIA NemoClaw adds enterprise-grade security and local inference. Cisco AI Defense adds network-level trust verification. An RTX 5090 provides dedicated local compute for private inference via Nemotron. Together, they form a complete stack that we can package and sell.

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT SURFACES                       │
│     Telegram · iMessage · Discord · Web · Voice          │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  OPENCLAW GATEWAY                        │
│  Agent orchestration · Session management · Auth         │
│  Tool routing · Heartbeats · Cron scheduling             │
└──────────┬───────────────────────────────┬──────────────┘
           │                               │
┌──────────▼──────────┐     ┌──────────────▼──────────────┐
│   OPENSHELL SANDBOX  │     │      CISCO AI DEFENSE       │
│                      │     │                              │
│  • Kernel isolation  │     │  • MCP tool call inspection  │
│  • Landlock FS       │     │  • Supply chain verification │
│  • Seccomp process   │     │  • Behavioral anomaly detect │
│  • Network policies  │     │  • Continuous audit trail     │
│  • Per-agent sandbox │     │  • PII exfiltration block    │
└──────────┬──────────┘     └──────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────┐
│                    PRIVACY ROUTER                        │
│                                                          │
│  Evaluates each inference request against policy:        │
│                                                          │
│  ┌─────────────┐    ┌──────────────────────────┐        │
│  │ PRIVATE /    │    │  CLOUD / FRONTIER         │        │
│  │ SENSITIVE    │───▶│                            │        │
│  │              │    │  Anthropic Claude          │        │
│  │ Route to ────│    │  Google Gemini             │        │
│  │ LOCAL model  │    │  OpenAI                    │        │
│  │              │    │                            │        │
│  │ Nemotron on  │    │  PII stripped via Gretel   │        │
│  │ RTX 5090     │    │  differential privacy      │        │
│  └─────────────┘    └──────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────┐
│                  LOCAL COMPUTE (RTX 5090)                 │
│                                                          │
│  NVIDIA Nemotron Models (via NIM microservices)          │
│  • Nemotron Super — complex reasoning, multi-agent       │
│  • Nemotron Nano — fast targeted tasks, routing          │
│  • Nemotron Safety — content filtering, guardrails       │
│  • Nemotron RAG — document retrieval, embeddings         │
│  • Nemotron Speech — ASR/TTS for voice agents            │
│                                                          │
│  24GB VRAM · Always-on · Zero cloud cost for local tasks │
└─────────────────────────────────────────────────────────┘
```

---

## Layer Details

### 1. OpenClaw (Agent Runtime)

**What it is:** The operating system for personal AI agents. Open source, created by Peter Steinberger.

**What we run today (Mojo):**
- Mac Mini M4 Pro with OpenClaw gateway
- Multi-channel: Telegram, iMessage, Discord
- Browser automation (Chrome 147 via CDP/Playwright)
- Tool ecosystem: Gmail, Calendar, Sheets, voice calls, web search
- Sub-agent spawning (Codex, Claude Code)
- Persistent memory (MEMORY.md, daily notes, active tasks)
- Cron scheduling (market briefs, email monitoring)
- Skills framework (weather, voice-call, iMessage, etc.)

**Jensen's framing:** "OpenClaw is the operating system for personal AI. Every company needs an OpenClaw strategy."

**Reference:** https://github.com/openclaw/openclaw

---

### 2. NVIDIA NemoClaw (Security + Local Inference Stack)

**What it is:** One-command install that wraps OpenClaw with OpenShell (sandbox runtime) + Nemotron (local models). Announced at GTC March 16, 2026.

**Install:**
```bash
curl -fsSL https://nvidia.com/nemoclaw.sh | bash
nemoclaw onboard
```

**What it adds to our stack:**
- OpenShell sandbox runtime (see Layer 3)
- Nemotron local models (see Layer 5)
- Privacy router (see Layer 4)
- NVIDIA Agent Toolkit integration
- Single-command setup for enterprise-ready agents

**Reference:** https://www.nvidia.com/en-us/ai/nemoclaw/

---

### 3. NVIDIA OpenShell (Sandboxed Runtime)

**What it is:** Open-source runtime for executing AI agents in sandboxed environments with kernel-level isolation. Runs inside Docker containers.

**Architecture (four components):**

| Component | Role |
|-----------|------|
| **Gateway** | Control-plane API — coordinates sandbox lifecycle, auth boundary, brokers requests |
| **Sandbox** | Isolated runtime — container supervision + policy-enforced egress routing |
| **Policy Engine** | Filesystem, network, and process constraint enforcement — defense in depth from app layer to kernel |
| **Privacy Router** | Privacy-aware LLM routing — keeps sensitive context on local compute, routes by cost + privacy policy |

**Protection Layers:**

| Layer | What It Protects | Enforcement |
|-------|-----------------|-------------|
| Filesystem | Prevents reads/writes outside allowed paths | Landlock — locked at sandbox creation |
| Network | Blocks unauthorized outbound connections | Hot-reloadable at runtime |
| Process | Blocks privilege escalation, dangerous syscalls | Seccomp — locked at sandbox creation |
| Inference | Reroutes model API calls to controlled backends | Hot-reloadable at runtime |

**Request flow:**
1. Agent opens outbound connection (API call, package install, git clone, etc.)
2. Sandbox proxy intercepts → identifies calling binary
3. If target is `inference.local` → managed inference path (strips sandbox creds, injects backend creds, forwards to model)
4. All other destinations → policy engine evaluates (destination, port, binary)
5. Allow (matches policy) or Deny (blocked + logged)

**Deployment modes:**
- **Local:** Gateway in Docker on workstation (`openshell gateway start`)
- **Remote:** Gateway on remote host via SSH (`openshell gateway start --remote user@host`)
- **Cloud:** Gateway behind reverse proxy (`openshell gateway add https://gateway.example.com`)

**What this solves for CincyClaw clients:**

| Threat | Without OpenShell | With OpenShell |
|--------|------------------|----------------|
| Data exfiltration | Agent uploads source code to unauthorized endpoints | Network policies allow only approved destinations |
| Credential theft | Agent reads SSH keys, cloud credentials | Landlock confines access to declared paths only |
| Unauthorized API usage | Agent sends data to unapproved providers | Privacy routing + network policies control inference traffic |
| Privilege escalation | Agent attempts sudo, setuid | Unprivileged process identity + seccomp restrictions |

**Reference:** https://docs.nvidia.com/openshell/latest/about/overview.html

---

### 4. Privacy Router (Hybrid Inference)

**What it is:** The decision layer that determines WHERE each inference request runs — locally on dedicated hardware or in the cloud via frontier models.

**How it works:**
- Each inference request is evaluated against a declarative privacy policy (YAML)
- **Private/sensitive data** → routed to local Nemotron on RTX 5090 (zero cloud exposure)
- **Non-sensitive or complex reasoning** → routed to frontier models (Claude, Gemini, GPT)
- When routing to cloud: **Gretel differential privacy** strips PII from prompts before they leave the machine
- Policies are hot-reloadable — no restart needed to change routing rules

**Why this matters for enterprise clients:**
- Customer PII never leaves their network for routine tasks
- Compliance teams can audit the policy YAML as version-controlled security controls
- Cost optimization — local inference for high-volume simple tasks, cloud only when needed
- Meets data residency requirements (healthcare, legal, finance)

**CincyClaw POC implementation:**

```yaml
# Example privacy policy for a dental office agent
inference:
  default: local  # Nemotron on RTX 5090
  routes:
    - pattern: "patient_*"
      target: local
      reason: "HIPAA — patient data never leaves premises"
    - pattern: "scheduling_*"
      target: local
      reason: "Appointment data stays local"
    - pattern: "research_*"
      target: cloud
      provider: anthropic
      pii_strip: true
      reason: "General research, no patient data"
    - pattern: "complex_reasoning"
      target: cloud
      provider: anthropic
      model: claude-opus
      pii_strip: true
      reason: "Multi-step analysis needs frontier capability"
```

---

### 5. Local Compute — NVIDIA RTX 5090 + Nemotron

**What it is:** Dedicated GPU running open-weight Nemotron models locally for private, zero-cost inference.

**Hardware: NVIDIA RTX 5090**
- 32GB GDDR7 VRAM
- Sufficient for running multiple Nemotron model sizes simultaneously
- Always-on, dedicated to agent workloads
- No per-token cloud costs for local inference

**Nemotron Model Family:**

| Model | Use Case | Deployment |
|-------|----------|------------|
| **Nemotron Super** | Complex reasoning, multi-agent orchestration | Primary local model for agent tasks |
| **Nemotron Nano** | Fast targeted tasks, intent routing, classification | Lightweight — runs alongside Super |
| **Nemotron Safety** | Content filtering, jailbreak detection, guardrails | Always-on safety layer |
| **Nemotron RAG** | Document retrieval, embeddings, multimodal search | Client knowledge base queries |
| **Nemotron Speech** | ASR + TTS for voice agents | Voice-enabled agent interfaces |
| **Nemotron Parse** | Document data extraction (invoices, forms, etc.) | Business document processing |

**Deployment:** All models available as optimized NVIDIA NIM microservices with TensorRT-LLM acceleration.

**Reference:** https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/

---

### 6. Cisco AI Defense (Network Trust Layer)

**What it is:** Enterprise security overlay that verifies and audits everything the agent does at the network level. Announced at GTC in partnership with NVIDIA.

**Key insight from Cisco:** "OpenShell constrains what agents CAN do. Cisco AI Defense enforces what they DO and verifies what they DID."

**Three capabilities:**

**A. Supply Chain Verification**
- Every tool, MCP server, and skill the agent can reach is scanned and verified BEFORE it receives a call
- Continuous posture assessment — not a one-time allowlist
- Compromised or poisoned skills are blocked from the catalog
- Think: "App Store review process" but for agent tools

**B. MCP Tool Call Inspection**
- Real-time inspection of every outbound MCP/tool call
- Detects prompt injection, exfiltration attempts, behavioral anomalies
- Blocks malicious payloads at the gateway BEFORE they're processed
- Logs everything for audit trail

**C. Continuous Behavioral Audit**
- Records what the agent did, when, and whether it matched policy
- Makes agent trust "provable, not probable"
- Compliance-ready audit trail for regulated industries

**Cisco's real-world scenario (from their blog):**
- Zero-day advisory drops Friday 6:45 PM
- Context agent already has live knowledge graph of all network devices
- Security ops agent reads the bulletin, maps affected devices, evaluates blast radius
- Entire workflow runs inside OpenShell sandbox
- Cisco AI Defense verifies every tool call, blocks an attempted MCP exfiltration
- Remediation tickets filed automatically — audit trail complete

**Reference:** https://blogs.cisco.com/ai/securing-enterprise-agents-with-nvidia-and-cisco-ai-defense

---

## CincyClaw POC — Mojo as Reference Implementation

### Current State (What We Run Today)

```
Mac Mini M4 Pro
├── OpenClaw Gateway
│   ├── Mojo (main agent)
│   │   ├── Telegram ↔ Bryan
│   │   ├── iMessage ↔ Jennifer
│   │   ├── Discord ↔ Friends
│   │   ├── Browser (Chrome 147)
│   │   ├── Gmail / Calendar / Sheets
│   │   ├── Voice calls (Twilio + ElevenLabs)
│   │   └── Cron jobs (market brief, email monitor)
│   ├── Sub-agents (Codex, Claude Code)
│   └── Skills (weather, voice-call, imsg, etc.)
├── Inference: Cloud-only
│   ├── Anthropic Claude (Opus, Sonnet, Haiku)
│   ├── Google Gemini (Flash, Pro)
│   └── OpenAI (Whisper)
└── No local models
    No sandbox isolation
    No privacy routing
    No tool verification
```

### Target State (CincyClaw Enterprise Architecture)

```
Dedicated Workstation (RTX 5090)
├── NemoClaw Stack (one-command install)
│   ├── OpenClaw Gateway
│   │   ├── Client Agent (custom per business)
│   │   ├── Multi-channel (email, voice, web chat, SMS)
│   │   ├── Browser automation
│   │   ├── Business tool integrations (CRM, ERP, etc.)
│   │   └── Cron scheduling
│   │
│   ├── OpenShell Sandbox Runtime
│   │   ├── Per-agent kernel isolation
│   │   ├── Landlock filesystem restrictions
│   │   ├── Seccomp process controls
│   │   ├── Network egress policies
│   │   └── Declarative YAML policy (version controlled)
│   │
│   ├── Privacy Router
│   │   ├── Policy-based inference routing
│   │   ├── Local → Nemotron on RTX 5090
│   │   ├── Cloud → Frontier models (PII stripped)
│   │   └── Gretel differential privacy
│   │
│   └── Nemotron Models (local on RTX 5090)
│       ├── Super (reasoning)
│       ├── Nano (routing, classification)
│       ├── Safety (guardrails)
│       ├── RAG (document search)
│       └── Speech (voice)
│
├── Cisco AI Defense (network layer)
│   ├── MCP tool call inspection
│   ├── Supply chain verification
│   └── Continuous behavioral audit
│
└── Client Data (never leaves premises)
    ├── Customer records
    ├── Business documents
    └── Operational data
```

### Migration Path (Current → Target)

| Phase | What Changes | Timeline |
|-------|-------------|----------|
| **Phase 0 (Now)** | Mojo on Mac Mini, cloud inference only | ✅ Complete |
| **Phase 1** | Install NemoClaw, add OpenShell sandbox to existing setup | When NemoClaw GA drops |
| **Phase 2** | Add RTX 5090, deploy Nemotron models locally | Hardware procurement |
| **Phase 3** | Enable privacy router — route sensitive tasks local, research to cloud | After Phase 2 |
| **Phase 4** | Integrate Cisco AI Defense for tool verification + audit | When Cisco integration available |
| **Phase 5** | Package as repeatable deployment for CincyClaw clients | After Phase 4 validated |

---

## CincyClaw Service Offering

### What We Sell

1. **Discovery Call** — Understand the client's business, identify 3-5 agent use cases
2. **Agent Design** — Define the agent's personality, tools, channels, and privacy policy
3. **Deployment** — Install NemoClaw stack on client hardware (or hosted)
4. **Integration** — Connect to client's existing tools (CRM, calendar, email, phone)
5. **Privacy Configuration** — Set up OpenShell policies and inference routing per client requirements
6. **Ongoing Management** — Monitor, tune, and evolve the agent over time

### Target Verticals (Cincinnati / Indianapolis)

| Vertical | Agent Use Cases | Privacy Requirements |
|----------|----------------|---------------------|
| **Dental/Medical** | Scheduling, patient intake, insurance verification, follow-ups | HIPAA — all patient data local |
| **Legal** | Document review, client intake, case research, scheduling | Attorney-client privilege — local inference |
| **Real Estate** | Lead response, showing scheduling, market research, listing descriptions | Client PII local, market research cloud |
| **Restaurants** | Reservation management, review responses, inventory, supplier comms | Moderate — mostly local |
| **Professional Services** | Client onboarding, project management, invoicing, reporting | Client data local, general tasks cloud |

### Pricing Model (TBD)
- Hardware + setup fee (one-time)
- Monthly management + model hosting fee
- Per-integration pricing for tool connections

---

## Key Differentiators

1. **Local-first architecture** — Client data stays on their hardware. Not in someone else's cloud.
2. **NVIDIA-backed stack** — NemoClaw, OpenShell, Nemotron. Enterprise credibility from a $5T company.
3. **Cisco security integration** — Network-level trust verification. Compliance-ready audit trail.
4. **We eat our own cooking** — Mojo IS the proof of concept. Every feature we sell, we run ourselves.
5. **Local market expertise** — We're in Cincinnati/Indianapolis. We know the businesses. We speak the language.

---

## References

- NVIDIA NemoClaw: https://www.nvidia.com/en-us/ai/nemoclaw/
- NVIDIA OpenShell Overview: https://docs.nvidia.com/openshell/latest/about/overview.html
- NVIDIA OpenShell Architecture: https://docs.nvidia.com/openshell/latest/about/architecture.html
- NVIDIA Nemotron: https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/
- Cisco AI Defense + OpenShell: https://blogs.cisco.com/ai/securing-enterprise-agents-with-nvidia-and-cisco-ai-defense
- Cisco Secure AI Factory: https://blogs.cisco.com/datacenter/cisco-gives-its-secure-ai-factory-with-nvidia-a-secure-multi-agent-edge-up
- OpenClaw: https://github.com/openclaw/openclaw
- GTC 2026 Keynote Slides: saved in `src/assets/`
