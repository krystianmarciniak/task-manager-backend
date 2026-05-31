![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express.js-Backend-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![API](https://img.shields.io/badge/API-REST-orange)
![Status](https://img.shields.io/badge/Status-Completed-brightgreen)

# Task Manager Backend – dokument do obrony projektu

**Autor:** Krystian Marciniak  
**Projekt:** Aplikacja do zarządzania zadaniami, projektami, użytkownikami, etykietami i czasem pracy  
**Technologia:** JavaScript / Node.js / Express.js / PostgreSQL  
**Cel dokumentu:** Projekt spełnia wymagania, działa jako aplikacja MVC 

---

## 1. Cel projektu

Projekt **Task Manager Backend** jest aplikacją wspierającą zarządzanie pracą w projektach.

Aplikacja umożliwia obsługę:

- projektów,
- użytkowników,
- zadań,
- etykiet,
- przypisywania etykiet do zadań,
- rejestrowania czasu pracy przy zadaniach,
- dokumentacji API w Swagger UI.

Projekt został przygotowany jako aplikacja backendowa REST API, która komunikuje się z bazą danych PostgreSQL i może być obsługiwana przez frontend, Swagger UI lub Postman.

---

## 2. Spełnienie wymagań projektu

| Wymaganie | Realizacja w projekcie |
| :--- | :--- |
| JavaScript lub Node.js | Backend wykonany w Node.js oraz Express.js |
| Architektura MVC | Projekt posiada podział na warstwę danych, kontrolery/route'y oraz widok/frontend/API UI |
| Modele | Dane i relacje przechowywane w PostgreSQL; tabele: `tasks`, `users`, `projects`, `labels`, `task_labels`, `time_logs` |
| Widoki | Frontend JavaScript/Vite (**Vite → narzędzie do budowania i uruchamiania aplikacji frontendowych (build tool, dev server)**) oraz Swagger UI jako interaktywny widok API |
| Kontrolery | Endpointy Express obsługujące żądania HTTP i komunikację z bazą |
| Kompletna aplikacja | Aplikacja uruchamia serwer, łączy się z bazą i obsługuje pełne operacje CRUD |
| Routing | Routing Express, np. `/tasks`, `/users`, `/projects`, `/labels`, `/time-logs` |
| Obsługa formularzy | Dane z formularzy/interfejsu są przesyłane jako JSON do endpointów API |
| Komunikacja z bazą danych | PostgreSQL przez moduł `pg` i plik `db.js` |
| Walidacja danych | Walidacja wymaganych pól, statusu, e-maila, daty oraz relacji |
| Obsługa błędów | Kody HTTP: `400`, `404`, `500` oraz komunikaty JSON |
| Czytelny kod | Kod podzielony na pliki, route'y, migracje, konfigurację i dokumentację |
| Framework | Express.js oraz Swagger UI |
| Prezentacja projektu | Można pokazać Swagger, frontend, bazę danych i kod |
| Instrukcja uruchomienia | Zawarta w README / tym dokumencie |

---

## 3. Stos technologiczny

### Backend

- Node.js
- Express.js
- PostgreSQL
- pg
- dotenv
- Swagger UI

### Frontend / widok

- JavaScript
- Vite
- Przeglądarka internetowa
- Formularze wysyłające dane do API

### Baza danych

- PostgreSQL
- Relacyjne tabele
- Klucze obce
- Migracje SQL

### Dokumentacja API

- Swagger UI
- OpenAPI
- Testowanie endpointów w przeglądarce

---

## 4. Architektura MVC w projekcie

Aplikacja jest zgodna z uproszczoną architekturą MVC, dostosowaną do aplikacji backendowej REST API.

| Element MVC | Realizacja w projekcie |
| :--- | :--- |
| Model | PostgreSQL, tabele, relacje, zapytania SQL |
| View | Frontend JavaScript/Vite oraz Swagger UI |
| Controller | Funkcje route'ów Express obsługujące żądania HTTP |

---

## 5. Wyjaśnienie MVC podczas prezentacji

### Model

Modelem są dane przechowywane w bazie PostgreSQL oraz operacje wykonywane na tych danych.

Przykładowe tabele:

- `tasks`
- `users`
- `projects`
- `labels`
- `task_labels`
- `time_logs`

**Instrukcja:**

> W danym projekcie model reprezentuje warstwa bazy danych PostgreSQL. Dane są zapisane w tabelach, a logika operacji na danych jest realizowana przez zapytania SQL wykonywane z poziomu backendu.

---

### View

Widokiem jest warstwa, przez którą użytkownik lub tester może korzystać z aplikacji.

W projekcie rozwiązania dla widoku możą być:

- frontend JavaScript/Vite,
- Swagger UI,
- formularze/interfejs użytkownika,
- Postman jako narzędzie testowe podczas prezentacji API.

**Wyrażenie:**

> Widokiem jest frontend aplikacji oraz Swagger UI. To warstwa, która prezentuje dane użytkownikowi i pozwala wykonywać operacje, np. dodawanie, edycję i usuwanie zadań.

---

### Controller

Kontrolerami są funkcje obsługujące endpointy Express.

Kontrolery:

- odbierają żądania HTTP,
- pobierają dane z `req.params` lub `req.body`,
- walidują dane,
- wykonują zapytania SQL,
- zwracają odpowiedź JSON.

**Wyrażenie pilotażowe:**

> Kontrolerem są funkcje route'ów Express, np. `GET /tasks`, `POST /tasks`, `PUT /tasks/:id` i `DELETE /tasks/:id`. Te funkcje odbierają żądanie, komunikują się z bazą danych i zwracają odpowiedź do klienta.

---

## 6. Najważniejsze endpointy API

| Endpoint | Metoda | Funkcja |
| :--- | :--- | :--- |
| `/tasks` | GET | Pobiera listę zadań |
| `/tasks/:id` | GET | Pobiera jedno zadanie |
| `/tasks` | POST | Dodaje nowe zadanie |
| `/tasks/:id` | PUT | Aktualizuje zadanie |
| `/tasks/:id` | DELETE | Usuwa zadanie |
| `/users` | GET | Pobiera użytkowników |
| `/users` | POST | Dodaje użytkownika |
| `/users/:id/tasks` | GET | Pobiera zadania danego użytkownika |
| `/projects` | GET | Pobiera projekty |
| `/projects` | POST | Dodaje projekt |
| `/projects/:id/tasks` | GET | Pobiera zadania danego projektu |
| `/labels` | GET | Pobiera etykiety |
| `/labels` | POST | Dodaje etykietę |
| `/task-labels` | POST | Przypisuje etykietę do zadania |
| `/time-logs` | POST | Dodaje wpis czasu pracy |
| `/time-logs/:id` | DELETE | Usuwa wpis czasu pracy |

---

## 7. Routing

Routing w projekcie jest realizowany przez Express.js.

Przykłady:

```js
app.use("/labels", labelsRoutes);
app.use("/task-labels", taskLabelsRoutes);
app.use("/time-logs", timeLogsRoutes);
```

**Wyrażenie pilotażowe:**

> Routing odpowiada za przypisanie adresów URL do odpowiednich funkcji backendu. Dzięki temu np. żądanie `GET /tasks` pobiera zadania, a `POST /tasks` tworzy nowe zadanie.

---

## 8. Komunikacja z bazą danych

Komunikacja z PostgreSQL odbywa się przez plik `db.js`.

Przykładowa rola pliku `db.js`:

- przechowuje konfigurację połączenia,
- wykorzystuje dane z `.env`,
- udostępnia obiekt `pool`,
- pozwala wykonywać zapytania SQL w route'ach.

**Gotowa odpowiedź:**

> Backend nie przechowuje danych w pamięci, tylko komunikuje się z PostgreSQL. Do połączenia używany jest plik `db.js`, a dane dostępowe są trzymane w pliku `.env`, którego nie umieszcza się w repozytorium.

---

## 9. Walidacja danych wejściowych

Projekt posiada walidację danych po stronie backendu.

Przykładowe walidacje:

- wymagany tytuł zadania,
- maksymalna długość tytułu,
- poprawny status zadania,
- poprawny format e-mail,
- poprawny format daty,
- sprawdzenie, czy użytkownik istnieje,
- sprawdzenie, czy projekt istnieje,
- sprawdzenie, czy wpis czasu pracy istnieje przed usunięciem.

Dozwolone statusy zadania:

```text
todo
in_progress
done
```

**Wypowiedź:**

> Walidacja chroni aplikację przed zapisaniem błędnych danych. Przykładowo zadanie nie może mieć pustego tytułu, status musi należeć do określonej listy, a `assigned_user_id` i `project_id` muszą wskazywać istniejące rekordy.

---

## 10. Obsługa błędów

Aplikacja zwraca odpowiednie kody HTTP oraz komunikaty JSON.

| Kod | Znaczenie | Przykład |
| :--- | :--- | :--- |
| `200 OK` | Poprawne pobranie lub aktualizacja danych | Pobranie listy zadań |
| `201 Created` | Utworzenie nowego rekordu | Dodanie zadania |
| `400 Bad Request` | Błąd danych wejściowych | Pusty tytuł zadania |
| `404 Not Found` | Nie znaleziono rekordu | Brak zadania o podanym ID |
| `500 Internal Server Error` | Błąd po stronie serwera | Problem z bazą danych |

Przykład odpowiedzi błędu:

```json
{
  "error": "Nieprawidłowy format daty."
}
```

**Wypowiedź:**

> Obsługa błędów polega na tym, że aplikacja nie kończy działania po błędzie, tylko zwraca kontrolowaną odpowiedź JSON z odpowiednim kodem HTTP.

---

## 11. CRUD w projekcie

Projekt realizuje podstawowe operacje CRUD.

| Operacja | Znaczenie | Przykład w projekcie |
| :--- | :--- | :--- |
| Create | Dodawanie danych | `POST /tasks` |
| Read | Odczyt danych | `GET /tasks` |
| Update | Aktualizacja danych | `PUT /tasks/:id` |
| Delete | Usuwanie danych | `DELETE /tasks/:id` |

**Wyrażenie:**

> Projekt spełnia wymaganie kompletnej aplikacji, ponieważ pozwala tworzyć, odczytywać, aktualizować i usuwać dane.

---

## 12. Dodatkowe funkcjonalności wykraczające poza minimum

Projekt posiada funkcje dodatkowe, które wykraczają poza prosty CRUD:

- Swagger UI,
- relacje użytkownik–zadania,
- relacje projekt–zadania,
- etykiety zadań,
- tabela pośrednia `task_labels`,
- rejestrowanie czasu pracy,
- pola `estimated_hours` i `logged_hours`,
- walidacja relacji,
- uporządkowana struktura plików,
- instrukcja uruchomienia,
- diagram ERD.

**Wypowiedź:**

> Projekt nie ogranicza się tylko do prostego dodawania zadań. Dodałem etykiety, przypisywanie etykiet, rejestrowanie czasu pracy oraz dokumentację Swagger, co rozszerza projekt ponad minimum.

---

## 13. Różnica: `labels.routes.js` a `taskLabels.routes.js`

### `labels.routes.js`

Ten plik obsługuje same etykiety.

Przykładowo:

- utworzenie etykiety,
- pobranie listy etykiet,
- edycja etykiety,
- usunięcie etykiety.

Etykieta to osobny słownik, np.:

```text
Bug
Frontend
Backend
Pilne
```

### `taskLabels.routes.js`

Ten plik obsługuje relację między zadaniem a etykietą.

Przykładowo:

- przypisanie etykiety do zadania,
- usunięcie etykiety z zadania,
- pobranie etykiet przypisanych do zadania.

**Instrukcja:**

> `labels.routes.js` zarządza samymi etykietami, a `taskLabels.routes.js` zarządza przypisaniem etykiet do konkretnych zadań. To rozdzielenie jest poprawne, bo etykieta może istnieć niezależnie, a dopiero tabela `task_labels` łączy ją z zadaniem.

---

## 14. Rola `timeLogs.routes.js`

`timeLogs.routes.js` odpowiada za rejestrowanie czasu pracy przy zadaniach.

Przykładowe działania:

- dodanie wpisu czasu pracy,
- pobranie wpisów,
- usunięcie wpisu czasu,
- aktualizacja pola `logged_hours` w tabeli `tasks`.

**Wyrażenie:**

> `timeLogs.routes.js` pozwala rejestrować czas pracy przy zadaniu. Po dodaniu wpisu backend zwiększa `logged_hours`, a po usunięciu wpisu zmniejsza `logged_hours`, dzięki czemu zadanie ma aktualną liczbę przepracowanych godzin.

---

## 15. Instrukcja uruchomienia projektu

### 1. Klonowanie repozytorium

```bash
git clone https://github.com/krystianmarciniak/task-manager-backend.git
cd task-manager-backend
```

### 2. Instalacja zależności

```bash
npm install
```

### 3. Konfiguracja `.env`

Utworzyć plik `.env` na podstawie `.env.example`.

```text
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskmanager
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### 4. Utworzenie bazy danych

```sql
CREATE DATABASE taskmanager;
```

### 5. Import schematu i danych

```bash
psql -U postgres -d taskmanager -f database/init.sql
```

### 6. Uruchomienie migracji

```sql
database/migrations/task-enhancements.sql
```

Migracja dodaje:

- `labels`,
- `task_labels`,
- `time_logs`,
- `estimated_hours`,
- `logged_hours`.

### 7. Uruchomienie serwera

```bash
npm run dev
```

lub:

```bash
node server.js
```

### 8. Swagger UI

```text
http://localhost:3000/api/docs
```

---

## 16. Sekwencja podczas prezentacji

Zakładana kolejność demonstracji:

1. Uruchomienie backendu.
2. Pokazanie Swagger UI.
3. `GET /tasks` – pobranie zadań.
4. `POST /tasks` – dodanie zadania.
5. `PUT /tasks/:id` – edycja zadania.
6. `DELETE /tasks/:id` – usunięcie zadania.
7. `POST /labels` – dodanie etykiety.
8. `POST /tasks/{id}/labels` – przypisanie etykiety do zadania.
9. `POST /tasks/{id}/time-logs` – dodanie czasu pracy.
10. Pokazanie struktury bazy danych lub ERD.
11. Pokazanie fragmentu kodu route'a i omówienie MVC.

---

## 17. Plan awaryjny na obronę

Nagrania działania aplikacji.

### Film główny

Format:

```text
MP4
```

Czas:

```text
3–5 minut
```

Zawartość:

- uruchomienie backendu,
- otwarcie Swagger UI,
- wykonanie kilku endpointów,
- pokazanie działania bazy danych,
- pokazanie frontendu.

### Krótkie GIF-y

Przygotować 3–4 krótkie GIF-y po 10–20 sekund:

| GIF | Co pokazuje |
| :--- | :--- |
| `01-crud-task.gif` | Dodanie, edycja i usunięcie zadania |
| `02-labels.gif` | Dodanie etykiety i przypisanie jej do zadania |
| `03-time-logs.gif` | Dodanie czasu pracy i aktualizacja `logged_hours` |
| `04-swagger.gif` | Testowanie endpointów w Swagger UI |

**Instrukcja awaryjna:**

> Zostało przygotowane krótkie nagranie działania aplikacji wykonane po zakończeniu implementacji. Jeżeli środowisko lokalne chwilowo nie uruchomi się podczas prezentacji, jestem w stanie pokazać nagranie oraz przejść do omówienia kodu.

---

## 18. Pytania, które mogą paść na obronie

### 1. Node.js i Express powód wyboru?

> Node.js pozwala pisać backend w JavaScript, a Express upraszcza tworzenie routingu i endpointów REST API.

### 2. `server.js` zadanie pliku ? 

> `server.js` uruchamia aplikację Express, konfiguruje middleware, podłącza route'y, dokumentację Swagger i startuje serwer na określonym porcie.

### 3. `.env` zadanie pliku ?

> `.env` przechowuje dane konfiguracyjne, np. hasło do bazy danych. Nie powinien być dodawany do repozytorium ze względów bezpieczeństwa.

### 4. `db.js` zadanie pliku ?

> `db.js` odpowiada za połączenie z PostgreSQL i udostępnia `pool`, z którego korzystają endpointy wykonujące zapytania SQL.

### 5. REST API co to ?

> REST API to sposób komunikacji, w którym klient wysyła żądania HTTP, np. GET, POST, PUT i DELETE, a serwer zwraca dane najczęściej w formacie JSON.

### 6. Walidacja działanie?

> Backend sprawdza dane przed zapisem do bazy. Jeżeli dane są błędne, zwraca kod `400` i komunikat błędu.

### 7. Użytkownik podał nieistniejące ID , rozwój przypadku ?

> Backend sprawdza, czy rekord istnieje. Jeżeli nie istnieje, zwraca `404 Not Found`.

### 8. PostgreSQL decyzja o wyborze ?

> PostgreSQL dobrze nadaje się do danych relacyjnych, ponieważ pozwala tworzyć tabele, relacje, klucze obce i wykonywać zapytania SQL.

### 9. Swagger decyzja o wyborze?

> Swagger dokumentuje endpointy API i pozwala testować je bezpośrednio w przeglądarce.

### 10.  MVC spełnił warunki projektu ?

> Model to PostgreSQL i zapytania SQL, View to frontend/Swagger UI, a Controller to funkcje route'ów Express obsługujące żądania i komunikację między widokiem a modelem => Tak.

---

## 19. Krótka wypowiedź na rozpoczęcie prezentacji

> Dzień dobry, przedstawię projekt Task Manager Backend wykonany w technologii Node.js i Express.js. Aplikacja służy do zarządzania projektami, użytkownikami, zadaniami, etykietami oraz czasem pracy. Dane są przechowywane w bazie PostgreSQL, a komunikacja odbywa się przez REST API. Projekt posiada routing, walidację danych, obsługę błędów, dokumentację Swagger oraz strukturę zgodną z architekturą MVC.

---

## 20. Krótka wypowiedź na zakończenie prezentacji

> Podsumowując, projekt jest kompletną aplikacją backendową w Node.js. Spełnia wymagania dotyczące routingu, komunikacji z bazą danych, walidacji, obsługi błędów oraz architektury MVC. Dodatkowo posiada Swagger UI, relacje w bazie danych, etykiety i rejestrowanie czasu pracy, czyli funkcjonalności wykraczające poza podstawowe minimum.

---

## 21. IMPORTANT wyrażenie

> W projekcie Model to PostgreSQL i zapytania SQL, View to frontend oraz Swagger UI, a Controller to endpointy Express, które odbierają żądania, walidują dane, komunikują się z bazą i zwracają odpowiedź JSON.

---

## 22. 'logged_hours' do czego służy

> Pole logged_hours przechowuje łączny czas pracy zapisany dla zadania. Gdy użytkownik dodaje wpis czasu przez endpoint POST /tasks/{id}/time-logs, backend zapisuje wpis w tabeli time_logs, a następnie aktualizuje sumę czasu w polu logged_hours w tabeli tasks.

## 22. Autor

**Krystian Marciniak**

