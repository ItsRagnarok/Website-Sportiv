# A.C. Club Neamț — website

Site static (HTML/CSS/JS, fără build) pentru A.C. Club Neamț, cu formular de înscriere.

## Structură

- `index.html` — pagina principală (hero + formular de înscriere)
- `despre-noi.html`, `antrenamente.html`, `antrenori.html`, `grupe.html`, `galerie.html`, `contact.html` — paginile site-ului
- `admin.html` — panou de administrare, protejat cu parolă (vezi mai jos)
- `assets/css/style.css` — toate stilurile
- `assets/js/main.js` — meniu mobil, animații, validare și trimitere formular
- `assets/js/dynamic-content.js` — aplică pe site pozele/clipurile încărcate din panoul de admin
- `assets/js/admin.js` — logica panoului de administrare
- `api/` — funcții serverless Vercel folosite de panoul de admin (login, upload, ștergere, listare)
- `assets/img/logo-official.jpg` — sigla oficială a clubului
- `assets/img/hero.jpg` — poza reală a jucătorului, folosită în hero

## Conectarea formularului la Google Sheets (Drive)

Am creat un folder dedicat în Drive-ul contului `findnaza@gmail.com`, numit **„Înscrieri Proiect Sportiv”**:

https://drive.google.com/drive/folders/1B-Jqo3IVPSGjC3lcDAq9tH8bZTBLOGkr

În el se află Sheet-ul **„Înscrieri A.C. Club Neamț”**, cu antetul de coloane pregătit:

https://docs.google.com/spreadsheets/d/1W7fLkIvjM6BYJTbccce233voTl2pQ03UfvMg7dwzaoY/edit

(Există și o copie mai veche a Sheet-ului, în afara folderului — poți s-o ștergi, e goală și nu mai e folosită.)

Fiecare trimitere a formularului adaugă automat un rând nou în acest Sheet, **instant**, chiar în momentul completării — nu trebuie să aștepți o actualizare orară. Din motive de securitate Google, ultimul pas — publicarea scriptului care primește datele — trebuie făcut manual, o singură dată, direct din contul tău Google (nu poate fi automatizat din exterior). Durează 2 minute:

1. Deschide Sheet-ul de mai sus.
2. Meniu **Extensii → Apps Script**.
3. Șterge codul din editor și lipește exact acest cod:

   ```javascript
   function doPost(e) {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     const data = JSON.parse(e.postData.contents);
     sheet.appendRow([
       data.timestamp,
       data.parentName,
       data.phone,
       data.email,
       data.childAge,
       data.level,
       data.interest,
     ]);
     return ContentService.createTextOutput(
       JSON.stringify({ status: "ok" })
     ).setMimeType(ContentService.MimeType.JSON);
   }
   ```

4. Salvează (icon disc / Ctrl+S).
5. Sus dreapta, **Deploy → New deployment**.
6. La „Select type”, alege **Web app**.
7. Setează:
   - **Execute as**: Me (contul tău)
   - **Who has access**: Anyone
8. Apasă **Deploy**, autorizează accesul când ți se cere (e scriptul tău, e sigur).
9. Copiază **Web app URL**-ul generat (arată cam așa: `https://script.google.com/macros/s/AKfycb.../exec`).
10. În `assets/js/main.js`, completează linia:

    ```javascript
    const GOOGLE_SCRIPT_URL = "";
    ```

    cu URL-ul copiat, între ghilimele.

11. Salvează și republică site-ul (sau doar reîncarcă local dacă testezi pe calculator).

După acest pas, orice completare a formularului de pe site apare automat ca un rând nou în Google Sheet, cu data/ora, numele părintelui, telefon, email, vârsta copilului, nivel și interesul selectat.

## Panoul de administrare (`admin.html`)

Un link discret **„Admin”** apare în subsolul fiecărei pagini. Din panou se pot încărca sau șterge:

- sigla site-ului și poza hero de pe Acasă (fiecare are un singur loc — o poză nouă o înlocuiește pe cea veche)
- clipuri video suplimentare pentru Galerie
- poze suplimentare pentru fiecare din cele 5 grupe din Galerie

Fișierele urcate din admin apar automat pe site, în câteva secunde, fără să mai fie nevoie de o republicare. Pozele/clipurile puse acum direct în cod rămân neschimbate — cele din admin se adaugă suplimentar lângă ele.

Ca să funcționeze, panoul are nevoie de o configurare unică, din contul tău Vercel (nu se poate face automat din exterior, e nevoie de acces la panoul tău Vercel):

1. **Creează spațiul de stocare pentru poze/clipuri.** În Vercel, intră pe proiectul `website-sportiv` → tab **Storage** → **Create Database** → alege **Blob** → dă-i un nume (ex. `gallery`) → **Create**. Când ți se cere să-l conectezi la proiect, alege `website-sportiv` — Vercel adaugă automat variabila `BLOB_READ_WRITE_TOKEN`.
2. **Setează parola de admin.** Tot pe proiect, tab **Settings → Environment Variables** → adaugă:
   - Key: `ADMIN_PASSWORD`
   - Value: parola pe care vrei s-o folosești pentru a intra în `admin.html` (alege una greu de ghicit)
   - Environment: bifează minim **Production**
   → **Save**.
3. **Redeploy.** Din tab **Deployments**, la ultimul deploy din `claude/website-creation-kvxxfu`, meniul `...` → **Redeploy** (ca variabilele noi să fie active).

După acești pași, intri pe `<adresa-site-ului>/admin.html`, pui parola de la pasul 2, și poți încărca/șterge poze și clipuri direct din browser.

*(Dacă acești pași nu au fost încă făcuți, panoul de admin arată o eroare la login în loc să te lase înăuntru — restul site-ului funcționează normal, neafectat.)*
