# Science Helpdesk – Projektaufbau & Einstieg

Diese Seite erklärt, wie das Projekt aufgebaut ist und wie du die Anwendung auf deinem Rechner startest.

## Überblick

| Teil        | Technik                         | Läuft auf                  |
|-------------|---------------------------------|----------------------------|
| Frontend    | Angular 22 (TypeScript, SCSS)   | http://localhost:4200      |
| Backend     | Spring Boot 3.5 (Java 21, Maven)| http://localhost:8080      |
| Datenbank   | PostgreSQL 16                   | localhost:5432             |

Das Frontend ruft das Backend immer über Pfade unter `/api/...` auf. Diese Aufrufe werden automatisch an das Backend weitergeleitet: im Docker-Betrieb von nginx, bei der lokalen Entwicklung vom Angular-Dev-Server (`frontend/proxy.conf.json`). **Backend-Endpunkte müssen deshalb unter `/api/` liegen.**

## Ordnerstruktur

```
Science-Helpdesk/
├── frontend/                  # Angular-App
│   ├── src/app/               # Komponenten, Routen
│   ├── proxy.conf.json        # leitet /api im Dev-Server ans Backend weiter
│   ├── nginx.conf             # Webserver-Konfiguration im Docker-Image
│   └── Dockerfile
├── backend/                   # Spring-Boot-App
│   ├── src/main/java/de/sciencehelpdesk/
│   │   ├── survey/            # Umfragen
│   │   ├── user/              # Benutzer
│   │   ├── credit/            # Stunden / ECTS
│   │   └── config/            # Konfiguration (Security, CORS, …)
│   ├── src/main/resources/
│   │   ├── application.yml    # Einstellungen (DB-Verbindung über Umgebungsvariablen)
│   │   └── db/migration/      # Flyway-Migrationen: V1__init.sql, V2__…
│   ├── pom.xml
│   └── Dockerfile
├── database/
│   └── docker-compose.yml     # nur die PostgreSQL-Datenbank
├── docs/                      # diese Doku
├── .github/workflows/ci.yml   # CI: frontend, backend, docker
├── docker-compose.yml         # ganze App: DB + Backend + Frontend
└── .env.example               # Vorlage für Zugangsdaten
```

**Backend-Pakete sind nach Feature aufgeteilt, nicht nach Schicht.** Alles, was zu einem Feature gehört (Controller, Service, Repository, Entity), liegt im selben Paket, z. B. `survey/SurveyController.java`, `survey/SurveyService.java` usw.

## Voraussetzungen

Für **alle**:
- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (unter Windows mit WSL 2)

Zusätzlich, wenn du **am Code entwickelst** (Variante B unten):
- Node.js **24 LTS** (mind. 22.22.3, ältere Versionen lehnt die Angular CLI ab)
- Java **21** (z. B. Eclipse Temurin)
- Maven **3.9+**

Prüfen:
```bash
git --version
docker --version
node -v        # nur Variante B
java -version  # nur Variante B
mvn -v         # nur Variante B
```

## Erstes Setup

```bash
git clone https://github.com/pauldore04/Science-Helpdesk.git
cd Science-Helpdesk
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
```

Die `.env` enthält die Datenbank-Zugangsdaten für deinen Rechner und wird nicht eingecheckt. Für die lokale Entwicklung passen die Standardwerte, du musst nichts ändern.

## Variante A: Alles mit Docker starten

Am einfachsten, wenn du die App nur ansehen oder testen willst. Docker Desktop muss laufen.

```bash
docker compose up --build
```

Danach:
- Frontend: http://localhost:4200
- Backend: http://localhost:8080

Stoppen mit `Strg+C` bzw.:
```bash
docker compose down        # Container stoppen, Daten bleiben erhalten
docker compose down -v     # zusätzlich die Datenbank löschen
```

Nach Code-Änderungen erneut mit `--build` starten, damit die Images neu gebaut werden.

## Variante B: Lokal entwickeln

Beim Entwickeln laufen Frontend und Backend direkt auf deinem Rechner, damit Änderungen sofort sichtbar sind. Nur die Datenbank läuft in Docker. Du brauchst drei Terminals:

**1. Datenbank**
```bash
docker compose -f database/docker-compose.yml up -d
```

**2. Backend**
```bash
cd backend
mvn spring-boot:run
```
Beim Start spielt Flyway automatisch alle neuen Migrationen ein. Das Backend ist bereit, wenn `Started ScienceHelpdeskApplication` im Log steht.

**3. Frontend**
```bash
cd frontend
npm install      # nur beim ersten Mal oder wenn sich package.json ändert
npm start
```
Die App öffnet sich unter http://localhost:4200 und lädt bei jeder Änderung automatisch neu.

> Läuft noch die komplette Docker-Variante (A), stoppe sie vorher mit `docker compose down`, sonst sind die Ports 4200 und 8080 belegt.

## Tests

```bash
# Frontend (Vitest)
cd frontend
npm test

# Backend (JUnit) – braucht die laufende Datenbank aus Schritt 1
cd backend
mvn verify
```

## Arbeiten im Projekt

- **Datenbank ändern:** Immer eine neue Migration in `backend/src/main/resources/db/migration/` anlegen, z. B. `V2__create_survey.sql`. **Bestehende Migrationen nie nachträglich ändern**, sonst startet das Backend bei allen anderen nicht mehr. Hibernate legt keine Tabellen selbst an (`ddl-auto: validate`).
- **Neues Feature im Backend:** neues Paket unter `de/sciencehelpdesk/`, Endpunkte unter `/api/...`.
- **CI:** Bei jedem Push und Pull Request baut und testet GitHub Actions Frontend, Backend und die Docker-Images. Ein Pull Request sollte erst gemergt werden, wenn alles grün ist.
- **Formatierung:** Die `.editorconfig` legt Einrückung und Zeilenenden fest. VS Code und IntelliJ übernehmen das automatisch (für VS Code ggf. die Erweiterung „EditorConfig“ installieren). Im Frontend ist zusätzlich Prettier eingerichtet.

## Häufige Probleme

| Problem | Lösung |
|---------|--------|
| `port is already allocated` / Port 5432 belegt | Läuft schon eine andere PostgreSQL? Diese stoppen oder `docker compose down` ausführen. |
| Backend: `Connection refused` zur Datenbank | Datenbank-Container läuft nicht → Schritt 1 ausführen und `docker ps` prüfen. |
| Backend: `Validate failed: Migrations have failed validation` | Eine bereits eingespielte Migration wurde geändert. Änderung rückgängig machen und neue Migration anlegen. Notfalls lokal `docker compose -f database/docker-compose.yml down -v` (löscht deine lokalen Daten). |
| Angular CLI: `requires a minimum Node.js version` | Node.js auf 24 LTS aktualisieren, Terminal/VS Code neu starten. |
| Docker: `WSL 2 installation is incomplete` (Windows) | In einer Admin-PowerShell `wsl --install --no-distribution` ausführen und neu starten. |
| Frontend zeigt Fehler bei `/api`-Aufrufen | Läuft das Backend auf Port 8080? |
