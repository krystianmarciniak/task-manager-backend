http://localhost:3000/api/docs
select * from tasks

1.4 POST /tasks – dodanie zadania.
{
  "title": "Prezentacja projektu",
  "description": "Obrona projektu JS",
  "status": "todo",
  "assigned_user_id": 1,
  "project_id": 14
}
{
  "title": "Przygotowanie instrukcji API",
  "description": "Dodać dokumentacje zdo README.md",
  "status": "todo",
  "due_date": "2026-05-30",
  "assigned_user_id": 1,
  "project_id": 2
}
1.6 PUT /tasks/{id}
{
  "title": "Prezentacja projektu",
  "description": "Obrona projektu JS",
  "status": "done"
}

2.1 POST /labels
{
  "name": "Gwiazdka",
  "color": "slate",
  "icon": "star"
}

select * from tasks
select * from users
select * from projects
select * from labels
select * from task_labels
select * from time_logs

SELECT * FROM time_logs  ORDER BY created_at DESC

estimated_hours = planowany czas pracy
logged_hours = rzeczywiście zapisany czas pracy

{
  "hours": 1.5,
  "comment": "Test dodania czasu pracy"
}