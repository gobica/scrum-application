# Create sprint in past
Note: assumes a project with ID 1 exists (change that appropriately).
```sql
INSERT INTO Sprints (startDate, endDate, velocity, idProject, createdAt, updatedAt) VALUES ('2020-03-10 00:00:00 +02:00', '2020-03-20 00:00:00 +02:00', 34.0, 1, datetime('now'), datetime('now'));
```

# Create sprint in progress
Note: assumes a project with ID 1 exists (change that appropriately).
```sql
INSERT INTO Sprints (startDate, endDate, velocity, idProject, createdAt, updatedAt) VALUES ('2020-05-01 00:00:00 +02:00','2020-05-20 00:00:00 +02:00', 10.0, 1, datetime('now'), datetime('now'));
```