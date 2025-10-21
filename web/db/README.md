# ElectroMed MySQL schema

This folder contains the MySQL DDL for the backend database inferred from the frontend app.

Files:
- `electromed_mysql.sql` — Creates database, tables, constraints, one view, a trigger, and minimal seed.

## Entities overview

- users: login accounts with roles (admin, medico, enfermeria, auxiliar, analista)
- password_resets: one-time codes for password recovery
- patients: master patient data (document, names, sex, contact, EPS, location)
- hospitalizations: admission episodes (fecha_ingreso, planta/area, habitación, diagnóstico, motivo)
- discharges: alta record linked to an admission (epicrisis, indicaciones, responsable, tipo/destino)
- electrolyte_tests: lab panel results (exam_date, planta, Na/K/Cl, alertas JSON)
- v_panel_rows: view tailored to UI panel/report consumption

## Mappings to frontend payloads

- POST /api/patients (Ingresar): The payload includes both patient and admission fields. Backend should:
  1) Upsert patient by `identificacion` into `patients`
  2) Create `hospitalizations` row with `fechaIngreso` -> `fecha_ingreso`, `area` -> `planta`, etc.

- Panel/Reportes: Data comes from `electrolyte_tests` (optionally joined to patients). Filters map to:
  - paciente: search by concatenated name or identificacion
  - fecha/fechaInicio/fechaFin: `exam_date`
  - planta: enum('uci','urgencias','hospitalizacion')

- Alta (Discharge): Create a `discharges` row for the active `hospitalizations` of the patient; the trigger marks it closed.

## Importing the schema

Use the MySQL client; replace credentials as appropriate. On Windows PowerShell:

```powershell
# Create database, tables, and seed
mysql --user=root --password --host=127.0.0.1 --port=3306 < .\db\electromed_mysql.sql
```

If your MySQL root does not allow TCP, try without host/port.

## Notes & Assumptions

- `planta` uses lowercase enums to match filters used in the Panel and Reportes pages; normalize inputs coming as 'UCI'/'Urgencias' from the admisión form to 'uci'/'urgencias'.
- `alertas` in `electrolyte_tests` is JSON (array of strings). MySQL 8.0 enforces the `CHECK` constraint; in 5.7 it's parsed but ignored.
- Passwords are stored as `password_hash` (bcrypt recommended). Replace the seeded admin hash.
- `edad` in patients is optional; prefer deriving from `fecha_nacimiento` if available.
- Indexes cover common filters and lookups used by the frontend; add more based on real workloads.

## Next steps

- Implement REST endpoints to map the exact payloads the frontend sends/reads.
- Add audit trails if required by compliance.
- If needed, add reference tables for EPS, departamentos/ciudades, and habitaciones with FKs.
