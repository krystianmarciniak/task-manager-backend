const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Manager API",
      version: "1.0.0",
      description: "Dokumentacja API projektu task-manager-backend",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Serwer lokalny",
      },
    ],
    components: {
      schemas: {
        Task: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: { type: "string", example: "Przygotować prezentację" },
            description: { type: "string", example: "Dodać Swagger do projektu" },
            status: {
              type: "string",
              enum: ["todo", "in_progress", "done"],
              example: "todo",
            },
            due_date: {
              type: "string",
              format: "date",
              example: "2026-04-20",
              nullable: true,
            },
            created_at: {
              type: "string",
              format: "date-time",
              example: "2026-04-16T20:30:00.000Z",
            },
            assigned_user_id: {
              type: "integer",
              example: 1,
              nullable: true,
            },
            project_id: {
              type: "integer",
              example: 2,
              nullable: true,
            },
            assigned_user_name: {
              type: "string",
              example: "Jan Kowalski",
            },
            project_name: {
              type: "string",
              example: "Projekt zaliczeniowy",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Jan Kowalski" },
            email: { type: "string", example: "jan@example.com" },
          },
        },
        CreateUserInput: {
          type: "object",
          required: ["name", "email"],
          properties: {
            name: {
              type: "string",
              maxLength: 80,
              example: "Jan Kowalski",
            },
            email: {
              type: "string",
              maxLength: 120,
              example: "jan@example.com",
            },
          },
        },
        CreateProjectInput: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              maxLength: 80,
              example: "Projekt zaliczeniowy",
            },
            description: {
              type: "string",
              maxLength: 300,
              example: "Lista zadań do projektu zespołowego",
            },
          },
        },

        Project: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Task Manager" },
            description: {
              type: "string",
              example: "Projekt do zarządzania zadaniami",
            },
          },
        },
        CreateTaskInput: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", example: "Napisać dokumentację API" },
            description: {
              type: "string",
              example: "Dodać opis endpointów do Swaggera",
            },
            status: {
              type: "string",
              enum: ["todo", "in_progress", "done"],
              example: "todo",
            },
            due_date: {
              type: "string",
              format: "date",
              example: "2026-04-20",
              nullable: true,
            },
            assigned_user_id: {
              type: "integer",
              example: 1,
              nullable: true,
            },
            project_id: {
              type: "integer",
              example: 2,
              nullable: true,
            },
          },
        },
        UpdateTaskInput: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", example: "Zaktualizować dokumentację API" },
            description: {
              type: "string",
              example: "Uzupełnić status codes i schematy",
            },
            status: {
              type: "string",
              enum: ["todo", "in_progress", "done"],
              example: "in_progress",
            },
            due_date: {
              type: "string",
              format: "date",
              example: "2026-04-25",
              nullable: true,
            },
            assigned_user_id: {
              type: "integer",
              example: 1,
              nullable: true,
            },
            project_id: {
              type: "integer",
              example: 2,
              nullable: true,
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "Błąd serwera",
            },
          },
        },
      },
    },
    tags: [
      { name: "Tasks", description: "Operacje na zadaniach" },
      { name: "Users", description: "Operacje na użytkownikach" },
      { name: "Projects", description: "Operacje na projektach" },
    ],
    paths: {
      "/": {
        get: {
          summary: "Sprawdza, czy API działa",
          responses: {
            200: {
              description: "API działa poprawnie",
            },
          },
        },
      },
      "/tasks": {
        get: {
          tags: ["Tasks"],
          summary: "Pobiera listę wszystkich zadań wraz z informacjami o użytkowniku i projekcie",
          responses: {
            200: {
              description: "Lista zadań została pobrana poprawnie",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
            500: {
              description: "Błąd serwera",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        post: {
          tags: ["Tasks"],
          summary: "Tworzy nowe zadanie w systemie",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateTaskInput" },
              },
            },
          },
          responses: {
            201: {
              description: "Zadanie zostało utworzone",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Task" },
                },
              },
            },
            400: {
              description: "Nieprawidłowe dane wejściowe",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Błąd serwera",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/tasks/{id}": {
        get: {
          tags: ["Tasks"],
          summary: "Pobiera szczegóły zadania na podstawie identyfikatora",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "ID zadania",
            },
          ],
          responses: {
            200: {
              description: "Zadanie zostało znalezione",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Task" },
                },
              },
            },
            404: {
              description: "Nie znaleziono zadania",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Błąd serwera",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        put: {
          tags: ["Tasks"],
          summary: "Aktualizuje dane istniejącego zadania",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "ID zadania",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateTaskInput" },
              },
            },
          },
          responses: {
            200: {
              description: "Zadanie zostało zaktualizowane",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Task" },
                },
              },
            },
            400: {
              description: "Nieprawidłowe dane wejściowe",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            404: {
              description: "Nie znaleziono zadania",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Błąd serwera",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Tasks"],
          summary: "Usuwa zadanie z systemu",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "ID zadania",
            },
          ],
          responses: {
            200: {
              description: "Zadanie zostało usunięte",
            },
            404: {
              description: "Nie znaleziono zadania",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Błąd serwera",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/users": {
        get: {
          tags: ["Users"],
          summary: "Pobiera listę wszystkich użytkowników",
          responses: {
            200: {
              description: "Lista użytkowników została pobrana poprawnie",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
            500: {
              description: "Błąd serwera",
            },
          },
        },
        post: {
          tags: ["Users"],
          summary: "Tworzy nowego użytkownika",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateUserInput" },
              },
            },
          },
          responses: {
            201: {
              description: "Użytkownik został utworzony",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/User" },
                },
              },
            },
            400: {
              description: "Nieprawidłowe dane użytkownika",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            409: {
              description: "Użytkownik o tym adresie e-mail już istnieje",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Błąd serwera",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/users/{id}": {
        get: {
          tags: ["Users"],
          summary: "Pobiera szczegóły użytkownika na podstawie ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "ID użytkownika",
            },
          ],
          responses: {
            200: {
              description: "Użytkownik został znaleziony",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/User" },
                },
              },
            },
            404: {
              description: "Nie znaleziono użytkownika",
            },
            500: {
              description: "Błąd serwera",
            },
          },
        },
        put: {
          tags: ["Users"],
          summary: "Aktualizuje dane użytkownika",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "ID użytkownika",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateUserInput" },
              },
            },
          },
          responses: {
            200: {
              description: "Użytkownik został zaktualizowany",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/User" },
                },
              },
            },
            400: {
              description: "Nieprawidłowe dane użytkownika",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            404: {
              description: "Nie znaleziono użytkownika",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            409: {
              description: "Konflikt danych",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Błąd serwera",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Users"],
          summary: "Usuwa użytkownika",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "ID użytkownika",
            },
          ],
          responses: {
            200: {
              description: "Użytkownik został usunięty",
            },
            404: {
              description: "Nie znaleziono użytkownika",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Błąd serwera",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/users/{id}/tasks": {
        get: {
          tags: ["Users"],
          summary: "Pobiera zadania przypisane do konkretnego użytkownika",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "ID użytkownika",
            },
          ],
          responses: {
            200: {
              description: "Lista zadań użytkownika została pobrana poprawnie",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
            404: {
              description: "Nie znaleziono użytkownika",
            },
            500: {
              description: "Błąd serwera",
            },
          },
        },
      },
      "/projects": {
        get: {
          tags: ["Projects"],
          summary: "Pobiera listę wszystkich projektów",
          responses: {
            200: {
              description: "Lista projektów została pobrana poprawnie",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Project" },
                  },
                },
              },
            },
            500: {
              description: "Błąd serwera",
            },
          },
        },
        post: {
          tags: ["Projects"],
          summary: "Tworzy nowy projekt / listę zadań",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateProjectInput" },
              },
            },
          },
          responses: {
            201: {
              description: "Projekt został utworzony",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Project" },
                },
              },
            },
            400: {
              description: "Nieprawidłowe dane projektu",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Błąd serwera",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/projects/{id}": {
        get: {
          tags: ["Projects"],
          summary: "Pobiera szczegóły projektu",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "ID projektu",
            },
          ],
          responses: {
            200: {
              description: "Projekt został znaleziony",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Project" },
                },
              },
            },
            404: {
              description: "Nie znaleziono projektu",
            },
            500: {
              description: "Błąd serwera",
            },
          },
        },
        delete: {
          tags: ["Projects"],
          summary: "Usuwa projekt / listę zadań razem z powiązanymi zadaniami",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "ID projektu",
            },
          ],
          responses: {
            200: {
              description: "Projekt i powiązane zadania zostały usunięte",
            },
            403: {
              description: "Nie można usunąć bazowej listy projektu",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            404: {
              description: "Nie znaleziono projektu",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            500: {
              description: "Błąd serwera",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/projects/{id}/tasks": {
        get: {
          tags: ["Projects"],
          summary: "Pobiera zadania przypisane do projektu",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "ID projektu",
            },
          ],
          responses: {
            200: {
              description: "Lista zadań projektu została pobrana poprawnie",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
            404: {
              description: "Nie znaleziono projektu",
            },
            500: {
              description: "Błąd serwera",
            },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;