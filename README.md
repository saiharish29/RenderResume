# ATS Resume Optimizer

AI-powered resume tailoring engine. Analyzes job descriptions, identifies missing keywords, and rewrites your resume to maximize ATS compatibility.

Built with React 19, TypeScript, Tailwind CSS, and Google Gemini AI.

---

## Quick Start

**Prerequisites:** [Node.js 18+](https://nodejs.org/) and a [Google Gemini API key](https://aistudio.google.com/apikey).

```bash
git clone https://github.com/YOUR_USERNAME/ats-resume-optimizer.git
cd ats-resume-optimizer
npm install
npm run setup      # validates API key + auto-detects best Gemini model
npm run dev        # starts dev server at http://localhost:3000
```

That's it. The `setup` script handles everything: prompts for your API key, queries Google's API for available models, picks the best one, smoke-tests it, and writes your `.env`.

---

## Features

- **Gap Analysis** - Compares your resume against a job description, identifies missing critical skills
- **One-Page Guarantee** - Engineered to compress experience into a professional A4 single-page format
- **AI Humanizer** - Rewrites content with natural sentence structures to bypass AI detectors
- **Multi-Format Export** - Download as PDF (A4 layout) or editable DOCX
- **Live Theming** - Switch between Classic, Modern, and Minimalist templates instantly
- **Cover Letter Generation** - Auto-generates a tailored cover letter linked to the JD

---

## Configuration

The `npm run setup` command creates a `.env` file with two variables:

| Variable | Description | Example |
|---|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key | `AIzaSy...` |
| `GEMINI_MODEL` | Gemini model to use (auto-detected) | `gemini-2.5-flash` |

### Switching models

```bash
# Re-run setup to auto-detect the latest model
npm run setup

# Or force a specific model
node setup.mjs --model gemini-2.5-pro

# Or just edit .env manually and restart dev server
```

### Available models

| Model | Best For |
|---|---|
| `gemini-2.5-flash` | Default - best speed/quality balance |
| `gemini-2.5-pro` | Maximum quality (slower, higher cost) |
| `gemini-2.0-flash` | Faster, lower cost alternative |

---

## How to Use

1. **Upload** your resume (PDF, DOCX, or TXT) or paste the text
2. **Paste** the full job description
3. **Review** the gap analysis - select only skills you actually have
4. **Configure** mode (One Page / Detailed), theme, AI Humanizer, Cover Letter
5. **Export** as PDF or DOCX

### Tips for best results

- **One Page mode** + **Minimal theme** for the tightest fit
- Add context like "I have 5 years of Python but didn't list it" in the context box
- Enable **AI Humanizer** if applying to companies that screen for AI-generated content

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Blank screen | Open DevTools (F12 > Console) and check for red errors |
| "GEMINI_API_KEY is not configured" | Run `npm run setup` |
| "Failed to analyze resume" | API key invalid, model deprecated, or quota exceeded. Run `npm run setup` again |
| Port 3000 busy | Check terminal for actual URL, or edit port in `vite.config.ts` |
| Resume overflows one page | Use "Minimal" theme, reduce confirmed skills, add "Keep bullets short" in context |

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4
- **AI Engine:** Google Gemini API (`@google/genai`) - model configurable via `.env`
- **Export:** html2pdf.js (PDF), docx + file-saver (DOCX), mammoth (DOCX parsing)
- **Charts:** Recharts

---

## Project Structure

```
ats-resume-optimizer/
  App.tsx                  # Main app component with step-based flow
  index.html               # HTML entry point
  index.tsx                # React entry point
  styles.css               # Tailwind CSS import
  types.ts                 # TypeScript interfaces and enums
  vite.config.ts           # Vite + Tailwind config with env injection
  setup.mjs                # One-command setup script
  .env.example             # Environment variable template
  components/
    InputSection.tsx        # Resume upload + JD input
    VerificationSection.tsx # Gap analysis review + skill confirmation
    ResumePreview.tsx       # A4 resume preview + PDF/DOCX export
    ScoreChart.tsx          # Radial ATS score chart
    SettingsControls.tsx    # Theme, mode, humanizer toggles
    ErrorBoundary.tsx       # React error boundary
  services/
    geminiService.ts        # Gemini API integration (model from env)
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run setup` | Validate API key, detect model, write `.env` |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |

---

## License

MIT

---

**Built for Job Seekers everywhere.**
