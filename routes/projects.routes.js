const express = require("express");
const router = express.Router();
const pool = require("../db");

// 3 GET /projects
router.get("/", async (req, res) => {// endpoint pobiera wszystkie projekty / listy zadań
  try {
    const result = await pool.query("SELECT * FROM projects ORDER BY id ASC");
    // wykonanie zapytania SELECT do PostgreSQL ORDER BY id ASC porządkuje wyniki rosnąco po ID
    res.json(result.rows); // result.rows zawiera tablicę rekordów zwróconych z bazy, backend odsyła tę tablicę do frontendu jako JSON 
  } catch (error) {
    console.error("Błąd podczas pobierania projektów:", error.message); // obsługa błędu po stronie serwera / bazy danych
    res.status(500).json({ error: "Błąd serwera" });
  }
});
// POST /projects
router.post("/", async (req, res) => { // dodanie nowego projektu
  try {
    const { name, description } = req.body; // oznacza pobranie danych z BODY requestu
    // { "name": "System Kanban", "description": "Projekt aplikacji" } = req.body 
    if (!name || !String(name).trim()) {  // walidacja pola name, nazwa projektu/listy jest wymaganatrim() zabezpiecza przed wpisaniem samych spacji
      return res.status(400).json({ error: "Nazwa listy jest wymagana." });
    }
    if (String(name).trim().length > 80) { // walidacja maksymalnej długości nazwy, ogranicza zbyt długie dane wejściowe
      return res.status(400).json({ error: "Nazwa listy może mieć maksymalnie 80 znaków." }); // 400 Błąd walidacji
    }
    if (description && String(description).trim().length > 300) { // walidacja opcjonalnego opisu
      // jeśli opis istnieje, nie może przekroczyć 300 znaków
      return res.status(400).json({
        error: "Opis listy może mieć maksymalnie 300 znaków."});
    }
    // zarządzanie wieloma połączeniami do bazy
    const result = await pool.query( // wykonanie zapytania, połączenie z PostgreSQL, connection pool
      // parametryzowane zapytanie INSERT do PostgreSQL
      //IMPORTANT=> $1 i $2 chronią przed SQL Injection
      // RETURNING * zwraca nowo utworzony rekord
      `INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING *`,
      [String(name).trim(), 
        description ? 
        // jeśli opis został podany → oczyść tekst
        String(description).trim()
        // jeśli nie został podany → ustaw domyślny opis
        : "Lista zadań utworzona z poziomu aplikacji"]
    );
    // result.rows[0] to pierwszy i jedyny rekord zwrócony przez INSERT
    res.status(201).json(result.rows[0]); // HTTP Status Code = 201 => zasób został poprawnie utworzony
    // Jeśli użytkownik został dodany: to backend odpowiada: res.status(201) czyli mówi frontendowi: obiekt został utworzony poprawnie
    // 201 stosuje się głównie przy: POST / create
  } catch (error) {
    console.error("Błąd podczas dodawania projektu:", error.message);
    res.status(500).json({ error: "Nie udało się utworzyć listy." });
  }
});

// PUT /projects/:id
router.put("/:id", async (req, res) => {// endpoint aktualizuje istniejący projekt / listę zadań
  try {
    const { id } = req.params; // pobranie ID projektu z adresu URL, np. /projects/5 → id = 5
    const { name, description } = req.body; // pobranie danych przesłanych w BODY requestu

    if (!name || !String(name).trim()) { // walidacja pola name, nazwa projektu/listy jest wymagana, trim() usuwa spacje z początku i końca tekstu
      return res.status(400).json({error: "Nazwa listy jest wymagana."});
    }
    if (String(name).trim().length > 80) { // walidacja maksymalnej długości nazwy projektu
      return res.status(400).json({ error: "Nazwa listy może mieć maksymalnie 80 znaków."});
    }
    if (description && String(description).trim().length > 300) { // walidacja opcjonalnego opisu projektu, jeśli opis istnieje → nie może przekroczyć 300 znaków
      return res.status(400).json({ error: "Opis listy może mieć maksymalnie 300 znaków."});
    }
    const result = await pool.query(
      // parametryzowane zapytanie UPDATE, $1, $2, $3 zabezpieczają przed SQL Injection, RETURNING * zwraca zaktualizowany rekord
      `UPDATE projects SET name = $1, description = $2 WHERE id = $3 RETURNING *`,
      // oczyszczona nazwa projektu/listy
      [String(name).trim(),
        description
        // jeśli description istnieje → oczyść tekst 
          ? String(description).trim(): null,
            // jeśli nie istnieje → ustaw NULL
          id
         // ID projektu używane w WHERE id = $3, określa który rekord ma zostać zaktualizowany
        ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono projektu."}); } 
      // zwrócenie zaktualizowanego projektu, result.rows[0] = pierwszy rekord zwrócony przez PostgreSQL
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Błąd podczas edycji projektu:", error.message);
    res.status(500).json({ error: "Nie udało się zaktualizować projektu." });}
});

// GET /projects/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params; // parametry z adresu URL czyli /users/5 destrukturyzacja obiektu w JavaScript.
    // URL → req → SQL → PostgreSQL → result → response
    const result = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
    // wykonanie zapytania, połączenie z PostgreSQL, connection pool
    if (result.rows.length === 0) { // PostgreSQL zwraca: rows = [] czyli pustą tablicę. Wtedy: rows.length wynosi: 0
      return res.status(404).json({ error: "Nie znaleziono projektu" }); // 404 Nie znaleziono
    }
    res.json(result.rows[0]); // // zwrócenie jednego projektu | pierwszy rekord znaleziony po ID  res.json(result.rows) wysyła wynik do frontendu
  } catch (error) {
    console.error("Błąd podczas pobierania projektu:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// DELETE /projects/:id
router.delete("/:id", async (req, res) => {  // endpoint usuwa projekt / listę zadań, razem z zadaniami przypisanymi do tej listy
  const client = await pool.connect(); // pobranie pojedynczego połączenia z puli PostgreSQL, istotne dla wykonania => kilka zapytań  w jednej transakcji
  try {
    const { id } = req.params; // pobranie ID projektu z adresu URL | np. /projects/5 → id = 5

    if (Number(id) <= 3) { //ochrona list startowych systemu | zakłożenie , że ID 1-3 to bazowe kolumny Kanban  zabezpieczenie przed usunięciem bazowych list systemowych | np. To Do, In Progress, Done
      return res.status(403).json({ error: "Nie można usunąć bazowej listy projektu." });
    }
    await client.query("BEGIN"); // rozpoczęcie transakcji | od tego momentu kilka operacji SQL ujęte zostaje jako jedną całość
     // sprawdzenie, czy projekt/lista o podanym ID istnieje
    const projectResult = await client.query( "SELECT * FROM projects WHERE id = $1",
      [id]
    );
    if (projectResult.rows.length === 0) {
       // jeśli projekt nie istnieje → transakcja zostaje cofnięta || cofnięcie transakcji, jeśli którykolwiek etap usuwania się nie powiedzie
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Nie znaleziono listy." });
    }

    await client.query("DELETE FROM tasks WHERE project_id = $1", [id]);

    const deleteResult = await client.query(
      "DELETE FROM projects WHERE id = $1 RETURNING *",
      [id]
      // usunięcie wszystkich zadań przypisanych do usuwanej listy | prioryte usuwnięcie zadania, żeby nie zostawić rekordów powiązanych z nieistniejącym projektem | zabezpiecza przed pozostawieniem osieroconych rekordów
    );
    await client.query("COMMIT");
    // zatwierdzenie transakcji |  wszystkie operacje DELETE zostały wykonane poprawnie
    res.json({
      message: "Lista i powiązane zadania zostały usunięte.",
      deleted: deleteResult.rows[0]
    });
  } catch (error) {
    await client.query("ROLLBACK");// jeśli wystąpił błąd w dowolnym miejscu transakcji | uruchomienie cofięcia wszystkich wykonanych operacji
    console.error("Błąd podczas usuwania projektu:", error.message);
    res.status(500).json({ error: "Nie udało się usunąć listy." });
  } finally {
    client.release(); // zwolnienie połączenia z bazą danych | bardzo ważne, aby nie blokować puli połączeń 
    // wykonuje się zawsze, niezależnie od sukcesu lub błędu
  }
});

// GET /projects/:id/tasks
router.get("/:id/tasks", async (req, res) => { // endpoint pobiera wszystkie zadania | przypisane do konkretnego projektu / listy
 //  pobierz dla konkretnego projektu wszystkie zadania 'pobierz wszystkie taski projektu o id = 3'
  try {
    const { id } = req.params;// // pobranie ID projektu z adresu URL | np. /projects/3/tasks → id = 3
    // parametry z adresu URL czyli /users/5 destrukturyzacja obiektu w JavaScript.
    // przepływ danych: | URL → Express req.params → SQL → PostgreSQL → result.rows → JSON response
    const projectCheck = await pool.query(  // wykonanie zapytania, połączenie z PostgreSQL, connection pool
      // sprawdzenie czy projekt/lista istnieje w bazie danych
      "SELECT * FROM projects WHERE id = $1", [id]);
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono projektu" });
    }
    // projekt: id = 5 | backend szuka wszystkich zadań, gdzie tasks.project_id = 5
    // Jeśli w zapytaniu są też projekty LEFT JOIN projects ... to backend dodatkowo: dołącza informacje o projekcie
    const result = await pool.query(
      // pobranie wszystkich zadań przypisanych do projektu | dodatkowo backend dołącza:
      // - dane użytkownika |  - dane projektu | - etykiety przypisane do zadania
      `
      SELECT
        tasks.id,
        tasks.title,
        tasks.description,
        tasks.status,
        tasks.due_date,
        tasks.created_at,
        tasks.assigned_user_id,
        tasks.project_id,
        tasks.estimated_hours,
        tasks.logged_hours,
        users.name AS assigned_user_name,
        projects.name AS project_name,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('id', l.id, 'name', l.name, 'color', l.color, 'icon', l.icon)
          ) FILTER (WHERE l.id IS NOT NULL),
          '[]'
        ) AS labels
      FROM tasks
      LEFT JOIN users ON tasks.assigned_user_id = users.id
      LEFT JOIN projects ON tasks.project_id = projects.id
      LEFT JOIN task_labels tl ON tasks.id = tl.task_id
      LEFT JOIN labels l ON tl.label_id = l.id
      WHERE tasks.project_id = $1
      GROUP BY tasks.id, users.name, projects.name
      ORDER BY tasks.id ASC`,
      // users.name AS assigned_user_name, | alias: nazwa użytkownika przypisanego do zadania
      // projects.name AS project_name | alias: nazwa projektu/listy
      // COALESCE | jeśli zadanie nie posiada etykiet, zwróć pustą tablicę []
      // JSON_AGG | agregacja wielu etykiet do jednego pola JSON
      // JSON_BUILD_OBJECT | budowanie pojedynczego obiektu etykiety JSON
      // FILTER (WHERE l.id IS NOT NULL) | pomijanie pustych rekordów labels
      //  LEFT JOIN users | ON tasks.assigned_user_id = users.id | dołączenie użytkownika przypisanego do zadania
      // LEFT JOIN projects ON tasks.project_id = projects.id |dołączenie projektu/listy zadania
      // LEFT JOIN task_labels tl ON tasks.id = tl.task_id | tabela pośrednia relacji many-to-many:
      // task ↔ labels
      // LEFT JOIN labels l ON tl.label_id = l.id | pobranie danych etykiet
      // WHERE tasks.project_id = $1 | filtruje zadania po ID projektu
      // GROUP BY tasks.id, users.name, projects.name | wymagane przy JSON_AGG grupuje rekordy tak, aby jedno zadanie posiadało jedną tablicę labels


      [id] // parametry przekazywane do SQL, posiada placeholder $1
      // pool.query("SELECT ... WHERE id = $1", [id]) PostgreSQL widzi: WHERE id = $1 ale jeszcze: nie zna wartości $1 Dopiero: [id] przekazuje: jaką wartość ma dostać $1
      // Czyli: pool.query("SELECT * FROM users WHERE id = $1", [id]); oznacza: „podstaw zmienną id w miejsce $1”
      // parametryzacja chroni przed SQL Injection
    );
    res.json(result.rows); // To zwraca: rezultat całego zapytania SQL czyli wszystkie rekordy znalezione przez: SELECT ...,  res.json(result.rows) wysyła wynik do frontendu result.rows zawiera tablicę rekordów zwróconych przez PostgreSQL backend wysyła dane do frontendu jako JSON
  } catch (error) {
    console.error("Błąd podczas pobierania zadań projektu:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

module.exports = router;