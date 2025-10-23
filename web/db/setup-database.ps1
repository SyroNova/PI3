# Script para configurar la base de datos ElectroMed
# Ejecutar desde PowerShell en este directorio

Write-Host "=== ElectroMed Database Setup ===" -ForegroundColor Cyan
Write-Host ""

# Rutas comunes de MySQL en Windows
$mysqlPaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\wamp64\bin\mysql\mysql8.0.31\bin\mysql.exe"
)

$mysqlExe = $null
foreach ($path in $mysqlPaths) {
    if (Test-Path $path) {
        $mysqlExe = $path
        Write-Host "✓ MySQL encontrado en: $path" -ForegroundColor Green
        break
    }
}

if (-not $mysqlExe) {
    Write-Host "✗ No se encontró MySQL en las rutas comunes" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, ingresa la ruta completa a mysql.exe:" -ForegroundColor Yellow
    Write-Host "Ejemplo: C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    $mysqlExe = Read-Host "Ruta"
    
    if (-not (Test-Path $mysqlExe)) {
        Write-Host "✗ La ruta no existe. Saliendo..." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Configuración de conexión:" -ForegroundColor Cyan
$dbUser = Read-Host "Usuario de MySQL (default: root)"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "root" }

Write-Host ""
Write-Host "¿El usuario tiene contraseña? (S/N)" -ForegroundColor Yellow
$hasPassword = Read-Host
$usePassword = $hasPassword -eq "S" -or $hasPassword -eq "s"

Write-Host ""
Write-Host "=== Ejecutando setup_complete.sql ===" -ForegroundColor Cyan

$sqlFile = Join-Path $PSScriptRoot "setup_complete.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "✗ No se encontró el archivo setup_complete.sql" -ForegroundColor Red
    exit 1
}

try {
    if ($usePassword) {
        Write-Host "Ingresa la contraseña de MySQL cuando se solicite..." -ForegroundColor Yellow
        Get-Content $sqlFile | & $mysqlExe -u $dbUser -p --default-character-set=utf8mb4
    } else {
        Get-Content $sqlFile | & $mysqlExe -u $dbUser --default-character-set=utf8mb4
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Base de datos configurada exitosamente!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Base de datos: electromed" -ForegroundColor Cyan
        Write-Host "Usuario admin creado con:" -ForegroundColor Cyan
        Write-Host "  Username: admin" -ForegroundColor White
        Write-Host "  Password: admin123" -ForegroundColor White
        Write-Host ""
        Write-Host "⚠️  IMPORTANTE: Cambia la contraseña antes de usar en producción!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Próximos pasos:" -ForegroundColor Cyan
        Write-Host "1. Actualiza el .env del backend con la contraseña correcta" -ForegroundColor White
        Write-Host "2. Configura las credenciales de Firebase" -ForegroundColor White
        Write-Host "3. Ejecuta 'npm start' en el backend" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "✗ Error al ejecutar el script SQL" -ForegroundColor Red
        Write-Host "Revisa los mensajes de error arriba" -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "✗ Error al ejecutar el script SQL: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Presiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
