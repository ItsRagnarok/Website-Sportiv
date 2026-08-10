# A.C. Club Neamț — website

Site static (HTML/CSS/JS, fără build) pentru A.C. Club Neamț, cu formular de înscriere.

## Structură

- `index.html` — pagina principală (hero + formular de înscriere)
- `despre-noi.html`, `antrenamente.html`, `grupe.html`, `galerie.html`, `contact.html` — pagini placeholder, gata de completat
- `assets/css/style.css` — toate stilurile
- `assets/js/main.js` — meniu mobil + validare și trimitere formular
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
