# This Journal gets updated automatically by the Journal Logger Agent

### **New Interaction**
- **Hook Version**: 1.02



- **Date**: 15-05-2026 12:25

- **Prompt**: activate the journal and prompt history agent

### **New Interaction**
- **Agent Version**: 2.3

- **Date**: 15-05-2026 12:31
- **User**: victor.oganwo@epita.fr
- **Prompt**: activate the journal and prompt history agent
- **CoPilot Mode**: Edit
- **CoPilot Model**: GPT-5.4 mini
- **Socratic Mode**: ON
- **Changes Made**: Added .github/agents/prompt-history.agent.md so prompt history is exposed as a first-class Copilot agent; left the existing logging hook untouched.
- **Context and Reasons for Changes**: The prompt-history automation already existed in .github/hooks, but there was no dedicated agent file for Copilot discovery.

- **Date**: 15-05-2026 12:25
- **User**: stanislaw.wojciechowski@epita.fr
- **Prompt**: activate the journal and prompt history agent
- **CoPilot Mode**: Agent
- **CoPilot Model**: GPT-5.2
- **Socratic Mode**: ON
- **Changes Made**: Added a selectable prompt-history agent definition.
- **Context and Reasons for Changes**: The repo already logs prompt history via a hook; adding an agent makes prompt-history logging available in the same agent list as journal logging.


### **New Interaction**
- **Agent Version**: 2.3
- **Date**: 15-05-2026 13:29
- **User**: thuong-gia-han.pham@epita.fr
- **Prompt**: activate journal-logger.agent.md
- **CoPilot Mode**: Agent
- **CoPilot Model**: Claude Haiku 4.5
- **Socratic Mode**: OFF
- **Changes Made**: Activated journal-logger.agent.md agent; appended this journal entry.
- **Context and Reasons for Changes**: User requested activation of journal-logger agent. The agent is now logging interactions to JOURNAL.md per its configuration.

### **New Interaction**

- **Hook Version**: 1.02
- **Date**: 18-05-2026 13:56
- **Prompt**: hello copilot

- **Agent Version**: Kiro
- **Date**: 17-05-2026 22:45
- **User**: thuong-gia-han.pham@epita.fr
- **Prompt**: fix the red lines in App.tsx
- **CoPilot Mode**: Agent
- **CoPilot Model**: Auto
- **Socratic Mode**: OFF
- **Changes Made**: Fixed TYPE_BADGE from Tailwind classes to inline styles; added message state so chat appends messages on send; synced activeNav ↔ activeTab bidirectionally.
- **Context and Reasons for Changes**: TYPE_BADGE used Tailwind class names but Tailwind was not installed, so badges rendered without color. Chat input cleared on Enter but did not append messages to UI, confusing users. Nav and tab states were independent causing visual desync.

---

### **New Interaction**
- **Agent Version**: Kiro
- **Date**: 17-05-2026 22:45
- **User**: thuong-gia-han.pham@epita.fr
- **Prompt**: npm run dev — Missing script: "dev" error
- **CoPilot Mode**: Chat
- **CoPilot Model**: Auto
- **Socratic Mode**: OFF
- **Changes Made**: No code changes. Diagnosed that npm was run from the wrong directory.
- **Context and Reasons for Changes**: The error occurred because `npm run dev` was executed outside the `corpus-forge/frontend/` folder. Running `cd corpus-forge/frontend && npm install && npm run dev` resolved the issue.
