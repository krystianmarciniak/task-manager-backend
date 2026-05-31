// zarządza słownikiem etykiet
// labels = definicje etykiet dostępnych w systemie
// np. Bug, Frontend, Backend, Pilne
const express = require("express");
const router = express.Router();
const pool = require("../db");

// 4 GET /labels
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM labels ORDER BY id ASC");
    // pobranie wszystkich etykiet z bazy
    // ORDER BY id ASC ustawia stałą kolejność wyników
    res.json(result.rows);// tablica wszystkich etykiet
  } catch (error) {
    console.error("Błąd pobierania etykiet:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// POST /labels
router.post("/", async (req, res) => {
  try {
    const { name, color, icon } = req.body;// // pobranie danych etykiety z BODY requestu
    if (!name || !String(name).trim()) {
      // walidacja: nazwa etykiety jest obowiązkowa | trim() blokuje zapis samych spacji
      return res.status(400).json({ error: "Nazwa etykiety jest wymagana" });
    }
    const result = await pool.query(
      "INSERT INTO labels (name, color, icon) VALUES ($1, $2, $3) RETURNING *",
      [String(name).trim(), 
         // oczyszczona nazwa etykiety
        color || "blue", 
        // jeśli kolor nie został podany, | ustaw domyślną wartość "blue"
        icon || "tag"]
        // jeśli ikona nie została podana, | ustaw domyślną ikonę "tag"
    );
    res.status(201).json(result.rows[0]);// HTTP 201 Created || result.rows[0] = nowo utworzona etykieta
  } catch (error) {
    console.error("Błąd dodawania etykiety:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// PUT /labels/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;// ID etykiety pobrane z adresu URL | np. /labels/4 → id = 4
    const { name, color, icon } = req.body;// nowe dane etykiety pobrane z BODY requestu
    if (!name || !String(name).trim()) {
      // walidacja: etykieta musi mieć nazwę
      return res.status(400).json({ error: "Nazwa etykiety jest wymagana" });
    }
    const result = await pool.query(
      "UPDATE labels SET name = $1, color = $2, icon = $3 WHERE id = $4 RETURNING *",
      [
        String(name).trim(),
        // oczyszczona nazwa etykiety 
        color || "blue", 
        // domyślny kolor, jeśli nie został przesłany
        icon || "tag", 
        // domyślna ikona, jeśli nie została przesłana
        id // ID etykiety używane w WHERE id = $4
      ]
    );
    if (result.rows.length === 0) {// jeśli UPDATE nie zwrócił żadnego rekordu, | etykieta o podanym ID nie istnieje
      return res.status(404).json({ error: "Nie znaleziono etykiety" });
    }
    res.json(result.rows[0]); // zwrócenie zaktualizowanej etykiety
  } catch (error) {
    console.error("Błąd edycji etykiety:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// DELETE /labels/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // ID etykiety pobrane z adresu URL
    const result = await pool.query(
      "DELETE FROM labels WHERE id = $1 RETURNING *",// usunięcie etykiety o konkretnym ID | RETURNING * zwraca usunięty rekord
      [id]
    );
    if (result.rows.length === 0) { 
      return res.status(404).json({ error: "Nie znaleziono etykiety" }); // jeśli DELETE nie znalazł rekordu, | etykieta o podanym ID nie istnieje
    }
    res.json({
      message: "Etykieta została usunięta",// zwrócenie komunikatu sukcesu
      deleted: result.rows[0],// deleted zawiera usuniętą etykietę
    });
  } catch (error) {
    console.error("Błąd usuwania etykiety:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

  module.exports = router;
  // labels.routes.js zarządza definicjami etykiet,
// ale samo przypisywanie etykiet do zadań odbywa się w taskLabels.routes.js