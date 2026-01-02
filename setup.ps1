# TTMoney Setup Script - Windows
# Sets up database, dependencies, and environment

param(
    [string]$PostgresPassword = "postgres",
    [string]$PostgresUser = "postgres"
)

Write-Host "TTMoney Setup Script" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host ""

# 1. Check PostgreSQL
Write-Host "[1] Checking PostgreSQL..." -ForegroundColor Yellow
$psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
if ($psqlCmd) {
    $psqlPath = $psqlCmd.Source
} else {
    $psqlPath = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'
}
$pgCheck = & "$psqlPath" --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: PostgreSQL not found. Install from https://www.postgresql.org/download/" -ForegroundColor Red
    exit 1
}
Write-Host "OK: PostgreSQL installed at $psqlPath" -ForegroundColor Green
Write-Host ""

# 2. Create database
Write-Host "[2] Creating database 'ttmoney'..." -ForegroundColor Yellow
& "$psqlPath" -U $PostgresUser -h localhost -d postgres -w -c "DROP DATABASE IF EXISTS ttmoney;" 2>&1 | Out-Null
& "$psqlPath" -U $PostgresUser -h localhost -d postgres -w -c "CREATE DATABASE ttmoney;" 2>&1 | Out-Null
Write-Host "OK: Database created" -ForegroundColor Green
Write-Host ""

# 3. Apply schema
Write-Host "[3] Applying database schema..." -ForegroundColor Yellow
$schemaContent = Get-Content "docs/DATABASE_SCHEMA.md" -Raw
$sqlBlocks = [regex]::Matches($schemaContent, '(?s)```sql(.*?)```')

foreach ($match in $sqlBlocks) {
    $sql = $match.Groups[1].Value.Trim()
    if ($sql.Length -gt 0) {
        $sql | & "$psqlPath" -U $PostgresUser -h localhost -d ttmoney -w 2>&1 | Out-Null
    }
}
Write-Host "OK: Schema applied" -ForegroundColor Green
Write-Host ""

# 4. Install dependencies
Write-Host "[4] Installing backend dependencies..." -ForegroundColor Yellow
Push-Location "apps/backend"
npm install 2>&1 | Select-Object -Last 1
Pop-Location
Write-Host "OK: Backend dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "[5] Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location "apps/frontend"
npm install 2>&1 | Select-Object -Last 1
Pop-Location
Write-Host "OK: Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

# 5. Create .env files
Write-Host "[6] Creating environment files..." -ForegroundColor Yellow
$backendEnv = @"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ttmoney
DB_USER=$PostgresUser
DB_PASSWORD=$PostgresPassword
JWT_SECRET=dev_secret_key_change_in_production
PORT=5000
NODE_ENV=development
"@

$frontendEnv = "NEXT_PUBLIC_API_URL=http://localhost:5000"

Set-Content -Path "apps/backend/.env" -Value $backendEnv
Set-Content -Path "apps/frontend/.env.local" -Value $frontendEnv
Write-Host "OK: Environment files created" -ForegroundColor Green
Write-Host ""

Write-Host "===================" -ForegroundColor Green
Write-Host "SETUP COMPLETE!" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Start the servers" -ForegroundColor Yellow
Write-Host "Terminal 1: cd apps/backend && npm run dev" -ForegroundColor Cyan
Write-Host "Terminal 2: cd apps/frontend && npm run dev" -ForegroundColor Cyan
Write-Host "Then open: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
