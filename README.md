# CoreCanvas

Editor visuale per la creazione e stampa di etichette ZPL, pensato per stampanti Zebra.

## Funzionalità

- Editor drag-and-drop con supporto a testo, immagini, barcode, QR code, forme, variabili, contatori e data/ora
- Gestione template: salva, carica e riutilizza layout
- Stampa diretta su stampante Zebra via rete (TCP)
- Storage immagini su MinIO
- Log delle stampe con tracciatura variabili e copie

## Stack

- **Frontend:** Next.js + Tailwind CSS
- **Backend:** NestJS + Prisma + MySQL
- **Storage:** MinIO
- **Infrastruttura:** Docker Compose

## Avvio rapido

```bash
cp .env.example .env
# Configura le variabili nel .env
docker compose up -d
```

---

*readme scritto da emme*
