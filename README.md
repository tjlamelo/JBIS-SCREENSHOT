# jbis-screenshot

Service Node interne : HTML → PDF (`puppeteer-core` + `@sparticuz/chromium`).

Sur Linux (o2switch), Chromium est fourni par `@sparticuz/chromium` — pas d’installation système.

## Setup local

```powershell
cd D:\DEV_TJ\Projet\Host\JBIS\jbis-screenshot
copy .env.example .env
npm install
npm run dev
```

Sous **Windows**, définissez `CHROME_EXECUTABLE_PATH` dans `.env` (Chrome ou Edge), sinon le binaire Sparticuz (ciblé Linux) ne convient pas en local.

Health : `GET http://127.0.0.1:3100/health`

PDF test :

```powershell
curl -X POST http://127.0.0.1:3100/v1/pdf/from-html `
  -H "Authorization: Bearer change-me-local-dev-token" `
  -H "Content-Type: application/json" `
  -d "{\"html\":\"<h1>Test JBIS</h1>\"}" `
  --output test.pdf
```

## Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Port HTTP (défaut 3100) |
| `INTERNAL_TOKEN` | Secret partagé avec `jbis-api` (`SCREENSHOT_SERVICE_TOKEN`) |
| `CHROME_EXECUTABLE_PATH` | Optionnel : Chrome local (dev Windows) |

## Déploiement o2switch

Après FTP, sur le serveur :

```bash
cd ~/jbis/screenshot.jbis.cm
npm ci --omit=dev
```

Puis redémarrer l’app Node dans cPanel. Ne pas définir `CHROME_EXECUTABLE_PATH` en prod.

## jbis-api

Dans `.env` de l'API :

```env
PROCESS_FLOW_PDF_DRIVER=screenshot
SCREENSHOT_SERVICE_URL=http://127.0.0.1:3100
SCREENSHOT_SERVICE_TOKEN=change-me-local-dev-token
```

Le token doit être **identique** à `INTERNAL_TOKEN` de ce service.
