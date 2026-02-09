# Visual UX Compliance

Design-to-Build Mobile Automation Framework that validates Android/iOS apps against Figma designs and produces evidence-backed reports for stakeholders.

## Overview

- **Design (Figma) is the source of truth** – fetches design data via Figma API
- **Rule-based, not pixel-perfect** – configurable tolerances, explainable results
- **Platform-agnostic** – supports Android and iOS
- **CI/CD friendly** – headless CLI, deterministic output, exit codes

## Architecture

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│  Design Ingestion   │     │  App Inspection      │     │  Screen & Component │
│  (Figma API)        │     │  (Appium)            │     │  Mapping            │
└─────────┬───────────┘     └──────────┬───────────┘     └──────────┬──────────┘
          │                            │                            │
          ▼                            ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Rule-driven Comparison Engine                            │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────┐     ┌──────────────────────┐
│  Evidence           │     │  Report Generation   │
│  Generation         │     │  (HTML)              │
└─────────────────────┘     └──────────────────────┘
```

| Layer | Responsibility |
|-------|----------------|
| **Design Ingestion** | Fetches Figma files, parses frames/components/text/styles, normalizes to canonical models |
| **App Inspection** | Appium-based UI extraction, accessibility tree parsing, screenshots |
| **Mapping** | Maps design screens/components to app screens/elements (accessibility ID, text, type, position) |
| **Comparison** | Rule executor applies validation rules with configurable tolerances |
| **Evidence** | Optional attachment of screenshots, Figma refs, metadata |
| **Report** | HTML report with executive summary, screen breakdown, issue evidence |

## Quick Start

### Prerequisites

- Node.js 18+
- Figma API access token
- Appium server (for app validation)
- Android emulator / iOS simulator (or physical device)

### Installation

```bash
npm install
npm run build
```

### Configuration

1. Copy the example config and rules:

   ```bash
   cp config/compliance.example.yaml compliance.config.yaml
   cp config/rules.example.yaml config/rules.yaml
   ```

2. Edit `compliance.config.yaml`:
   - Set `figma.fileKey` and `figma.accessToken` (or use `FIGMA_ACCESS_TOKEN` env var)
   - Set `appium.capabilities` for your app and device

3. Ensure Appium is running (e.g. `appium` or via CI).

### Run

```bash
# Headless execution
node dist/cli/index.js -c compliance.config.yaml -o ./output -v

# Or via npm script
npm run compliance -- -c compliance.config.yaml
```

Exit code: `0` on pass, `1` on fail or error.

## CLI Reference

```
Usage: compliance [options]

Options:
  -c, --config <path>   Config file (default: compliance.config.yaml)
  -o, --output <dir>    Override output directory
  -v, --verbose         Verbose output
  -h, --help            Show help

Environment:
  COMPLIANCE_CONFIG     Config file path
  COMPLIANCE_OUTPUT     Output directory
  FIGMA_ACCESS_TOKEN    Figma API token (use in config via ${FIGMA_ACCESS_TOKEN})
```

## Configuration

### Runner config (YAML/JSON)

| Section | Fields |
|---------|--------|
| `figma` | `fileKey`, `accessToken`, `nodeIds?`, `depth?` |
| `appium` | `serverUrl`, `capabilities` |
| `rules` | `configPath?` (path to rule config file) |
| `output` | `dir`, `reportFilename?`, `saveResultJson?` |
| `attachEvidence` | `true` / `false` |

### Rule config

Tolerances and options per rule (position, size, font-size, font-family, color, text-content).

See `config/rules.example.yaml`.

## Output Structure

```
{output.dir}/
  {runId}/
    report.html          # HTML report
    result.json          # Optional: raw result model
    screenshots/
      fullscreen-*.png
```

## CI/CD Integration

```yaml
# GitHub Actions example
- run: npm ci && npm run build
- run: node dist/cli/index.js -c compliance.config.yaml -o ./reports -v
  env:
    FIGMA_ACCESS_TOKEN: ${{ secrets.FIGMA_ACCESS_TOKEN }}
```

## Project Structure

```
src/
├── design/          # Design ingestion, Figma parsing, normalization
├── app/             # App inspection, Appium driver, extractors
├── mapping/         # Screen & component mapping
├── comparison/      # Rule engine, config, executor
├── evidence/        # Evidence builders
├── report/          # HTML report generator
└── cli/             # CLI runner, config loader
```

## Development

```bash
npm run build        # Compile TypeScript
npm run compliance   # Run CLI
```

## License

Private – see project metadata.
