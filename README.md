# jbis-screenshot

Service Node interne : HTML → PDF (Puppeteer).

## Setup local

```powershell
cd D:\DEV_TJ\Projet\Host\JBIS\jbis-screenshot
copy .env.example .env
npm install
npm run dev
```

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
| `PUPPETEER_NO_SANDBOX` | `true` sur hébergement partagé Linux |

## jbis-api

Dans `.env` de l'API :

```env
PROCESS_FLOW_PDF_DRIVER=screenshot
SCREENSHOT_SERVICE_URL=http://127.0.0.1:3100
SCREENSHOT_SERVICE_TOKEN=change-me-local-dev-token
```

Le token doit être **identique** à `INTERNAL_TOKEN` de ce service.
