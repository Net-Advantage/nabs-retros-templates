# NABS Retros starter templates

Shared **feedback templates** (retro formats) for the [NABS Retros](https://github.com/Net-Advantage/nabs-launchpad-vs-extension)
VS Code extension. Point the extension at this repository and every retro format here shows up in
the **New Retro** form, next to the built-in ones and your team's own.

| Template | Id | Good for |
| --- | --- | --- |
| ⛵ Sailboat (the default) | `sailboat` | Wind, anchors, rocks and the island: what helps, what holds us back, the risks ahead and the goal. Has its own retro layout. |
| ⭐ Starfish | `starfish` | Keep / more of / less of / stop / start: a finer-grained start, stop, continue. |
| ☕ Lean coffee | `lean-coffee` | An agenda-less discussion: propose topics, vote, timebox, capture takeaways. Has its own retro layout. |
| 💛 Glad / Sad / Mad + appreciations | `glad-sad-mad-plus` | The feelings retro, with thank-yous and a separate place for ideas. |

## Using it

Needs NABS Retros **0.5.0** or later. Add this to your repository's `.vscode/settings.json` (so the
whole team gets it), or to your user settings:

```jsonc
"nabsRetros.sharedTemplates": "Net-Advantage/nabs-retros-templates/templates@main"
```

That's `owner/repo/path@ref`: this repository, its `templates` folder, the `main` branch. Pin a
tag or commit instead of `main` (for example `@v1.0.0`) if you don't want new versions to reach
your team until you choose.

- The extension reads the files through the GitHub API (no clone). It's a public repository, so
  no sign-in is needed.
- It's cached, re-checked at most once an hour, and still works offline from the cache. Run
  **NABS Retros: Refresh Feedback Templates** to fetch the latest now.
- Precedence is set by `nabsRetros.templateSources` (default `["repo", "shared", "nabs"]`): a
  template in your repository's `team/retros/templates/` with the same id wins over the one here,
  and these win over the built-in ones.
- New retros default to `sailboat` (from [`templates/templates.json`](templates/templates.json)),
  unless your repository's `templates.json` or `nabsRetros.defaultFeedbackTemplate` says otherwise.

Want a variation for your team? Run **NABS Retros: New Feedback Template...** in your repository
and start from a copy of one of these.

## Template format

```text
templates/
├── templates.json          { "default": "sailboat" }: the default for new retros
└── sailboat/               the folder name is the template id
    ├── template.json       the format: feedback types, headings, questions, Copilot guidance
    └── retro.md            optional: the layout of retros created with this template
```

**`template.json`** is described by the JSON schema in
[`schemas/template.schema.json`](schemas/template.schema.json) (a copy of the extension's
[`schemas/template.schema.json`](https://github.com/Net-Advantage/nabs-launchpad-vs-extension/blob/main/schemas/template.schema.json)).
Each file starts with `"$schema": "../../schemas/template.schema.json"`, so VS Code gives you
IntelliSense and validation while you edit here, with or without the extension.

| Property | Required | Meaning |
| --- | --- | --- |
| `label` | yes | Shown in the New Retro form and the Retros view. |
| `types` | yes | The feedback types: `id`, `label`, and optionally `description`, `icon` (an emoji), `prompt` (text the feedback box starts with) and `section` (`wentWell`, `didNotGoWell`, `actionItems` or `none`: where Summarise Feedback puts it). |
| `id` | no | If present, must equal the folder name. |
| `description`, `icon` | no | Shown in the New Retro form. |
| `headings` | no | `wentWell`, `didNotGoWell`, `actionItems`: the headings of those three sections. |
| `ratingScale`, `trendScale` | no | A rating (e.g. 🟢 / 🟠 / 🔴) every entry must have, and an optional trend. |
| `questions` | no | Questions for the team, written into new retros. |
| `aiGuidance` | no | Extra instructions for Copilot when it summarises this template's feedback. |

**Don't rename an `id`** (folder or type) once teams use it: retros and feedback files store the
ids, so old entries would no longer match. Labels, descriptions and icons are safe to change.

**`retro.md`** is a Markdown layout with placeholders: `{{title}}`, `{{date}}`, `{{periodStart}}`,
`{{periodEnd}}`, `{{facilitator}}`, `{{status}}`, `{{repository}}`, `{{feedbackTemplate}}`,
`{{feedbackTemplateLabel}}`, `{{summary}}`, `{{questions}}`, `{{insights}}`,
`{{previousActions}}`, `{{wentWell}}`, `{{didNotGoWell}}`, `{{actionItems}}` and the
`{{wentWellHeading}}`, `{{didNotGoWellHeading}}`, `{{actionItemsHeading}}`. Keep
`feedbackTemplate: {{feedbackTemplate}}` in the front matter. Without a `retro.md`, the team's
`.template.md` or the extension's default layout is used.

Limits: up to 50 templates, 100 KB per file.

## Contributing

New templates and improvements are welcome, by pull request:

1. Fork the repository (or create a branch, if you're in the organisation).
2. Add `templates/<id>/template.json` (and optionally `retro.md`). Copy an existing template to
   start. The id: letters, digits, `-` or `_`, at most 40 characters.
3. Try it: set `nabsRetros.sharedTemplates` to a local clone (for example
   `"C:/Dev/nabs-retros-templates/templates"`), run **Refresh Feedback Templates** and create a
   retro with it.
4. Open a pull request saying what the format is for and where it comes from (credit the
   original author of a well-known format).

The **Validate templates** workflow checks every pull request: each `template.json` against the
schema, `templates.json`, and the folder rules (`node scripts/check-templates.mjs` runs the
latter locally; the schema check is the `npx ajv-cli` command in
[`.github/workflows/validate.yml`](.github/workflows/validate.yml)).

Good templates are generic (no team, client or product names), have clear type descriptions
written for the person adding feedback, map each type to a section, and include `aiGuidance`
where the format has a twist Copilot should know about.

When the extension's schema changes, copy the new `schemas/template.schema.json` here in the same
pull request as any templates that need it.

## Licence

[MIT](LICENSE) © Net Advantage Business Solutions.
