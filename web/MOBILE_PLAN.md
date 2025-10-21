# App móvil (Flutter) — Guía de inicio rápido

Esta app es para enfermería. Comparte backend con la web, pero con flujos y pantallas orientados a monitoreo rápido.

## Pantallas clave
1. Login (rol nurse)
2. Lista de pacientes (filtrar por área: UCI, Urgencias, Hospitalización)
3. Detalle de paciente
   - Vitals/electrolitos recientes (Na, K, Cl)
   - Gráficas (últimas 24h/7d)
   - Alertas activas
4. Alertas (feed con filtros)
5. Perfil / Cambiar tema

## Arquitectura sugerida
- State management: Riverpod o Bloc (Riverpod para empezar rápido)
- Networking: dio + retrofit (o chopper), modelos con json_serializable/freezed
- Almacenamiento seguro: flutter_secure_storage (tokens)
- Routing: go_router
- Theming: light/dark con ThemeData

## Paquetes recomendados
```yaml
# pubspec.yaml (extracto)
dependencies:
  flutter: { sdk: flutter }
  flutter_riverpod: ^2.4.0
  dio: ^5.7.0
  retrofit: ^4.0.3
  json_annotation: ^4.9.0
  go_router: ^14.2.0
  flutter_secure_storage: ^9.2.2
  freezed_annotation: ^2.4.4
  syncfusion_flutter_charts: ^26.2.11

dev_dependencies:
  build_runner: ^2.4.11
  retrofit_generator: ^8.1.0
  json_serializable: ^6.9.0
  freezed: ^2.5.7
```

## API compartida
- Contrato en `contracts/openapi.yaml`
- Generar cliente Dart (opción A — openapi-generator):
  - `openapi-generator generate -i contracts/openapi.yaml -g dart-dio -o mobile/packages/api_client`
- Opción B — retrofit manual con interfaces: más control, menos generación.

## Flujo de auth
- Login -> accessToken + refreshToken
- Guardar tokens: flutter_secure_storage
- Interceptor dio para
  - añadir Authorization: Bearer <accessToken>
  - refrescar cuando expire (401) con refreshToken

## Gráficas de electrolitos
- Endpoint: `GET /patients/{id}/electrolytes?from&to`
- Serie temporal (timestamp, na, k, cl)
- UI: líneas con umbrales (rangos normales) y resaltado en puntos fuera de rango

## Estructura de carpetas móvil
```
mobile/
  lib/
    app.dart
    main.dart
    core/
      api/ (client, interceptors)
      models/ (dto)
      repo/ (repositorios)
      utils/
    features/
      auth/
      patients/
        list/
        detail/
        charts/
      alerts/
    theme/
  packages/
    api_client/ (si generas SDK)
```

## Próximo paso
1) Confirmar el contrato de `patients` y `electrolytes` en `openapi.yaml`.
2) Generar SDK TS (web) y Dart (móvil) desde el mismo contrato.
3) Sustituir services mock en la web por el SDK; crear esqueleto Flutter con login + lista de pacientes.
