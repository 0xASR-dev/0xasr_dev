import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'public');
const outPath = path.join(outputDir, 'resume.pdf');

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Avneesh Singh | Resume</title>
    <style>
      :root {
        --paper: #f5f3ee;
        --ink: #121212;
        --muted: #5b5b5b;
        --rule: #d8d1c7;
        --accent: #5245d6;
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 32px 36px;
        background: var(--paper);
        color: var(--ink);
        font-family: "Segoe UI", Arial, sans-serif;
        line-height: 1.5;
      }

      .page {
        max-width: 760px;
        margin: 0 auto;
      }

      h1 {
        margin: 0;
        font-size: 28px;
        letter-spacing: -0.04em;
      }

      .sub {
        color: var(--muted);
        margin-top: 6px;
        font-size: 14px;
      }

      .section {
        margin-top: 28px;
      }

      .section h2 {
        margin: 0 0 12px 0;
        font-size: 12px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--muted);
        border-bottom: 1px solid var(--rule);
        padding-bottom: 8px;
      }

      .row {
        display: grid;
        grid-template-columns: 170px 1fr;
        gap: 14px 20px;
        padding: 10px 0;
        border-bottom: 1px solid var(--rule);
      }

      .meta {
        color: var(--muted);
        font-size: 12px;
      }

      .title {
        font-weight: 600;
      }

      .summary {
        color: var(--muted);
        margin-top: 4px;
      }

      .edu-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid var(--rule);
      }

      .school {
        font-weight: 600;
      }

      .years {
        color: var(--muted);
        font-size: 12px;
      }

      .contact {
        color: var(--ink);
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <h1>Avneesh Singh</h1>
      <div class="sub">Software engineer working across IoT, data and the web</div>

      <div class="section">
        <h2>Experience</h2>

        <div class="row">
          <div class="meta">Jul 2026 – present</div>
          <div>
            <div class="title">Freelance full-stack developer</div>
            <div class="summary">Building full-stack web applications and contributing to open-source projects.</div>
          </div>
        </div>

        <div class="row">
          <div class="meta">Mar – Jun 2026</div>
          <div>
            <div class="title">Data analytics and management intern</div>
            <div class="summary">Codec Technologies</div>
          </div>
        </div>

        <div class="row">
          <div class="meta">Sep 2025 – Sep 2026</div>
          <div>
            <div class="title">Technical Head</div>
            <div class="summary">Led a 500+ member technical community at Sundarbans House, IIT Madras BS programme.</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Education</h2>
        <div class="edu-row">
          <div>
            <div class="school">MITS Gwalior</div>
            <div>B.Tech in IoT</div>
          </div>
          <div class="years">2022–2026</div>
        </div>
        <div class="edu-row">
          <div>
            <div class="school">IIT Madras</div>
            <div>BS in Data Science and Applications</div>
          </div>
          <div class="years">2023–2026</div>
        </div>
      </div>

      <div class="section">
        <h2>Contact</h2>
        <div><a class="contact" href="mailto:avneeshsingh.job@gmail.com">avneeshsingh.job@gmail.com</a></div>
      </div>
    </div>
  </body>
</html>`;

fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
await page.setContent(html, { waitUntil: 'load' });
await page.pdf({
  path: outPath,
  format: 'A4',
  printBackground: true,
  margin: {
    top: '0.5in',
    right: '0.4in',
    bottom: '0.5in',
    left: '0.4in'
  }
});
await browser.close();

console.log(`Generated resume PDF at ${outPath}`);
