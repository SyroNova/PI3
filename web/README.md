# ElectroMed — Landing + Recuperación (MVC + TypeScript + CSS)

## Requisitos
- Node.js 18+ y npm

## Comandos
```bash
npm install
npm run build
npm run serve  # http://localhost:5173
# o
npm run dev    # watch + live-reload
```

## Estructura
```
public/
  index.html
  forgot.html
  dashboard.html
  styles/
    base.css
    login.css
    forgot.css
  assets/
    logo-electromed.png (tu logo)
src/
  models/
    User.ts
    Recovery.ts
  views/
    LoginView.ts
    RecoveryView.ts
  controllers/
    LoginController.ts
    RecoveryController.ts
  services/
    AuthService.ts
  app.ts
  app-forgot.ts
```

> `AuthService` está mockeado: imprime el código en consola y lo guarda en `sessionStorage`. Cambia a tu API cuando quieras.