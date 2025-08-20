# 🚦 Role-Based Access & Restrict Editing in React Word Editor

[![Releases - Download and Execute](https://img.shields.io/badge/Releases-Download%20and%20Execute-blue.svg)](https://github.com/Terryalozie/Role-Based-Access-and-Restrict-Editing-in-React-Word-Editor/releases)

Working example of role-based access control and editing restrictions for Word documents in a React app using the Syncfusion React Word Document Editor (Word Processor).

Badges
- Topics: content-protection · document-editor · document-security · editable-regions · react · restrict-editing · role-based-access · role-based-permissions · role-based-ui · word-document-editor · word-editor · word-processor
- License: MIT

---

Demo and releases
- Visit and download the release asset from the Releases page: https://github.com/Terryalozie/Role-Based-Access-and-Restrict-Editing-in-React-Word-Editor/releases
- The Releases page contains a packaged build and example assets. Download the provided file and execute the packaged startup script or installer to run a prebuilt demo.

Quick visual
![Word Editor Demo](https://upload.wikimedia.org/wikipedia/commons/4/4f/Microsoft_Word_2013_logo.svg)
![Syncfusion Logo](https://raw.githubusercontent.com/syncfusion/Images/master/icons/syncfusion-logo.png)

Table of contents
- Features
- What you get in this repo
- Architecture overview
- Installation (local dev)
- Run the demo build (from Releases)
- How role restrictions work
- Key files and snippets
- Custom roles and policies
- Testing and QA
- Troubleshooting
- Contributing
- License
- FAQ

Features
- Role-based access control (RBAC) for the document editor UI.
- Restrict editing on selected regions of a Word document.
- Map UI controls and editor commands to roles.
- Store editable-region permissions inside document metadata.
- Client-side enforcement and server-side validation hooks.
- Example user store, role mapping, and session simulation.
- Prebuilt demo in Releases for rapid evaluation.

What you get in this repo
- A React app that embeds the Syncfusion Word Processor control.
- Sample Word documents with editable regions marked.
- Role mapping utilities and a small in-memory user store.
- Scripts for local build and demo packaging.
- Unit tests for the permission layer.
- Documentation with code examples and run instructions.

Architecture overview
- Client (React)
  - Syncfusion Word Processor instance.
  - Role manager UI and token simulation.
  - Permission middleware that intercepts editor commands.
- Server (example Node/Express)
  - Document store API.
  - Document validation on save.
  - Optional real authorization middleware.
- Document format
  - Word documents leverage document protection and custom tags.
  - Editable regions get role metadata in a custom XML part or content control tags.

Design goals
- Keep decision logic out of the editor core.
- Treat the editor as a surface. Enforce permissions at command entry and document save.
- Provide both UI-only and server-backed enforcement paths.
- Let maintainers add custom roles with minimal code changes.

Installation (local dev)
1. Clone the repo
   ```bash
   git clone https://github.com/Terryalozie/Role-Based-Access-and-Restrict-Editing-in-React-Word-Editor.git
   cd Role-Based-Access-and-Restrict-Editing-in-React-Word-Editor
   ```
2. Install packages
   ```bash
   npm install
   ```
3. Start the app
   ```bash
   npm run start
   ```
4. Open http://localhost:3000

Run the demo build (from Releases)
- Open the Releases page and download the latest release asset:
  https://github.com/Terryalozie/Role-Based-Access-and-Restrict-Editing-in-React-Word-Editor/releases
- The release contains a packaged build named like:
  - RoleBasedWordEditor-demo-vX.Y.Z.zip
- Steps after download
  1. Unzip the archive.
  2. Run the bundled start script:
     - On macOS / Linux: ./run-demo.sh
     - On Windows: run-demo.bat
  3. The script launches a small static server and opens the demo page in your browser.
- The demo uses a frozen user store. Use the built-in role switcher to test permissions.

How role restrictions work (plain flow)
1. Document author marks regions as editable and assigns roles to those regions.
   - This occurs in the authoring UI or via metadata in saved documents.
2. User opens the document in the React app.
3. The client loads the current user session and their roles.
4. The permission middleware inspects editor commands.
   - If a command targets a protected region and the user lacks the role, the middleware blocks the command.
   - The UI disables or hides controls that would permit edits on protected regions.
5. On save, the server revalidates edits against the stored document permissions.
   - The server rejects saves that violate the policy.

Key concepts and terms
- Region: A contiguous area of the Word document marked with a tag or content control.
- Role: A named permission set (e.g., editor, reviewer, approver).
- ACL (access control list): Mapping of roles to editable regions.
- Token: Simulated session token that carries user roles in demo mode.
- Protection: Native Word protection state (e.g., restrict editing) used with custom metadata.

Key files and snippets
- src/App.tsx
  - Bootstraps the editor and role manager.
- src/permissions/PermissionManager.ts
  - Core middleware that intercepts editor commands.
- src/data/sample-docs/*
  - Documents with editable-region tags and example ACLs.
- server/validate.js
  - Example server-side validation for saves.

Example: attach role metadata to a region (pseudo)
```js
// When author marks a region:
const region = editor.createRange(start, end);
region.setCustomProperty('editable_roles', ['editor', 'approver']);
editor.applyProtection(region, { type: 'readOnly', allowComments: false });
```

Example: permission check before edit (pseudo)
```js
function canEditRange(userRoles, region) {
  const regionRoles = region.getCustomProperty('editable_roles') || [];
  return regionRoles.some(role => userRoles.includes(role));
}

// Intercept write commands
editor.on('beforeCommand', (cmd, range) => {
  if (cmd.isWriteCommand && !canEditRange(currentUser.roles, range)) {
    cmd.preventDefault();
    showFeedback('You do not have permission to edit this region.');
  }
});
```

UI mapping
- Role switcher: quick way to toggle active role in demo.
- Command toolbar: hide or disable buttons per role.
- Inline indicator: show a lock or tag on protected regions with allowed roles.
- Admin view: lets authors set region roles and lift protections.

Custom roles and policies
- Add a role:
  - Update the role list in src/data/roles.json.
  - If you have server validation, map roles to server claims.
- Create granular policies:
  - Allow comments only, no text edits.
  - Allow format changes but not content edits.
  - Permit changes during a time window.

Server validation example (Node/Express pseudocode)
```js
app.post('/save', async (req, res) => {
  const { docBuffer, user } = req.body;
  const docAcl = extractAclFromDocument(docBuffer);
  const edits = diffDocumentWithStored(docBuffer);
  for (const edit of edits) {
    const allowed = docAcl.canUserEdit(user.roles, edit.range);
    if (!allowed) return res.status(403).json({ error: 'Permission denied' });
  }
  // persist document
  res.json({ ok: true });
});
```

Testing and QA
- Unit tests cover PermissionManager and ACL parsing.
- Integration tests simulate common role flows:
  - Editor edits allowed region.
  - Reviewer cannot edit restricted region.
  - Admin lifts protection and reassigns roles.
- Manual tests:
  - Load sample docs and test Save with user role changes.
  - Attempt save with client-side bypass tools. Server rejects invalid saves.

Troubleshooting
- If the Syncfusion control fails to load:
  - Confirm you have the required package versions.
  - Check browser console for CORS errors.
- If permissions not enforced:
  - Confirm region metadata persisted in the document.
  - Confirm PermissionManager registers before editor commands.
- If the demo build does not run after download:
  - Ensure you executed the start script included in the release package.
  - Use node >= 14 for server demo scripts.

Contributing
- Fork the repo.
- Create a feature branch for new roles or policies.
- Add unit tests for permission logic.
- Send a pull request with clear testing steps.
- Follow code formatting and TypeScript lint rules if present.

License
- MIT

FAQ
Q: Do I need a Syncfusion license?
A: The example uses Syncfusion packages. For production use, verify Syncfusion licensing terms. The demo uses npm packages and a sample config.

Q: Can I store the ACL in a separate service?
A: Yes. The app supports external ACL providers. Implement an adapter that fetches region permissions at document load.

Q: How does the editor store region metadata?
A: The example stores metadata in custom document properties or a custom XML part. You can choose content controls or OOXML parts.

Releases link again
[Download the packaged demo and run the provided start script from Releases](https://github.com/Terryalozie/Role-Based-Access-and-Restrict-Editing-in-React-Word-Editor/releases) — download the release file and execute the included start/run script to launch the packaged demo.

Repository topics
- content-protection
- document-editor
- document-security
- editable-regions
- react
- restrict-editing
- role-based-access
- role-based-permissions
- role-based-ui
- word-document-editor
- word-editor
- word-processor

Screenshots and assets
- Use the included sample documents in src/data/sample-docs for quick tests.
- Use the admin UI to mark regions and assign roles.
- The screenshots folder contains example states: locked region, role switcher, and server validation error.

Contact
- File issues on GitHub if you find bugs or gaps.
- Submit pull requests for mejoras or new role types.