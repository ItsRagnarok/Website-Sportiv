# A.C. Club Neamț — website

Site static (HTML/CSS/JS, fără build) pentru A.C. Club Neamț, cu formular de înscriere.

## Structură

- `index.html` — pagina principală (hero + formular de înscriere)
- `despre-noi.html`, `antrenamente.html`, `grupe.html`, `galerie.html`, `contact.html` — pagini placeholder, gata de completat
- `assets/css/style.css` — toate stilurile
- `assets/js/main.js` — meniu mobil + validare și trimitere formular
- `assets/img/logo.svg` — siglă generată (înlocuiește cu sigla reală când o ai)
- `assets/img/hero-placeholder.svg` — imagine placeholder pentru hero (înlocuiește cu poza reală, vezi mai jos)

## Înlocuirea imaginilor cu cele reale

Fișierele din `assets/img/` sunt momentan ilustrații generate, deoarece pozele trimise în conversație nu au ajuns ca fișiere pe disc. Pentru a pune poza reală a jucătorului:

1. Salvează poza ca `assets/img/hero.jpg`
2. În `index.html`, în secțiunea `.hero-media`, schimbă `src="assets/img/hero-placeholder.svg"` în `src="assets/img/hero.jpg"`

La fel și pentru siglă, dacă ai fișierul oficial: salvează-l ca `assets/img/logo.png` (sau `.svg`) și înlocuiește referințele `assets/img/logo.svg` din toate paginile.

## Conectarea formularului la Google Sheets (Drive)

Am creat deja un Google Sheet în Drive-ul contului `findnaza@gmail.com`, numit **„Înscrieri A.C. Club Neamț”**, cu antetul de coloane pregătit:

https://docs.google.com/spreadsheets/d/1l7JxLVmJ7LxFgYIzDixXm5qNm7CbUhcJ3_04v_lbqA4/edit

Fiecare trimitere a formularului va adăuga automat un rând nou în acest Sheet, **instant** (mai rapid decât actualizare din oră în oră). Din motive de securitate Google, ultimul pas — publicarea scriptului care primește datele — trebuie făcut manual, o singură dată, direct din contul tău Google (nu poate fi automatizat din exterior). Durează 2 minute:

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

**Notă:** dacă preferi actualizare din oră în oră în loc de instant (de ex. pentru a agrega mai multe cereri într-un raport orar), pot adăuga în plus un trigger orar în Apps Script care trimite un rezumat pe email — spune-mi dacă vrei și asta.
