$Root        = Split-Path -Parent $MyInvocation.MyCommand.Path
$MlDir       = Join-Path $Root 'ml-service'
$BackendDir  = Join-Path $Root 'backend\BikeSense.Api'
$FrontendDir = Join-Path $Root 'frontend'
$LogDir      = Join-Path $Root 'logs'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Write-Step($msg) { Write-Host $msg -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "  [OK]   $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "  [FAIL] $msg" -ForegroundColor Red }

function Stop-AndExit($code) {
    Read-Host "Press Enter to close this window"
    exit $code
}

Write-Host "============================================" -ForegroundColor DarkGray
Write-Host " BikeSense Local Dev Launcher" -ForegroundColor White
Write-Host "============================================" -ForegroundColor DarkGray
Write-Host ""

# ---------------------------------------------------------------
# 1. Check local database - report only, never create
# ---------------------------------------------------------------
Write-Step "[1/5] Checking local database..."
if (-not (Get-Command sqlcmd -ErrorAction SilentlyContinue)) {
    Write-Warn "sqlcmd not found on PATH - skipping database check."
} else {
    $dbRows = & sqlcmd -S "(localdb)\MSSQLLocalDB" -h -1 -Q "SET NOCOUNT ON; SELECT name FROM sys.databases WHERE name = 'BikeSenseDb'" 2>$null |
        Where-Object { $_ -and $_.Trim() -ne '' }
    if ($dbRows) {
        Write-Ok "Database 'BikeSenseDb' found on (localdb)\MSSQLLocalDB."
    } else {
        Write-Warn "Database 'BikeSenseDb' not found yet - EF Core will create it automatically when the backend starts."
    }
}
Write-Host ""

# ---------------------------------------------------------------
# 2. Install ML service dependencies (only if missing)
# ---------------------------------------------------------------
Write-Step "[2/5] Checking ML service dependencies..."
$pyExeName        = $null
$pyExtraArgs      = @()
$pyVersionMatched = $false
$pyInstallHint    = "Install Python 3.12 from https://www.python.org/downloads/release/python-3120/ then re-run this script - it will pick up 3.12 automatically."

# pandas/numpy at the versions pinned in requirements.txt only ship prebuilt
# wheels for Python 3.9-3.12. On anything newer, pip falls back to building
# from source, which fails on most machines (missing MSVC/vswhere setup).
if (Get-Command py -ErrorAction SilentlyContinue) {
    foreach ($v in '3.12', '3.11', '3.10', '3.9') {
        & py "-$v" --version *> $null
        if ($LASTEXITCODE -eq 0) { $pyExeName = 'py'; $pyExtraArgs = @("-$v"); $pyVersionMatched = $true; break }
    }
    if (-not $pyExeName) { $pyExeName = 'py' }
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $pyExeName = 'python'
}

if (-not $pyExeName) {
    Write-Err "Python was not found on PATH. Install Python 3.9-3.12 and re-run."
    Stop-AndExit 1
}
$pyDisplay = (@($pyExeName) + $pyExtraArgs) -join ' '
Write-Host "  Using: $pyDisplay"

if (-not $pyVersionMatched) {
    Write-Warn "No Python 3.9-3.12 install was found on this machine (only newer/untested versions)."
    Write-Warn "The ML dependencies below may fail to install as a result. If they do, and the error"
    Write-Warn "mentions 'meson', 'vswhere', or 'building wheel': $pyInstallHint"
}

# Resolve the real python.exe path: the "py" launcher hands off to the actual
# interpreter and can exit before it, orphaning the child so its PID can no
# longer be tracked/killed. Launching the resolved exe directly avoids that.
$pyExePath = (& $pyExeName @pyExtraArgs -c "import sys; print(sys.executable)").Trim()

Push-Location $MlDir
& $pyExeName @pyExtraArgs -m pip install -r requirements.txt
$pipExit = $LASTEXITCODE
Pop-Location

if ($pipExit -ne 0) {
    Write-Err "ML dependency install failed. See the pip output above."
    if (-not $pyVersionMatched) {
        Write-Err "This is most likely because $pyDisplay has no prebuilt wheels for these packages."
        Write-Err $pyInstallHint
    }
    Stop-AndExit 1
}
Write-Ok "ML service dependencies installed."
Write-Host ""

# ---------------------------------------------------------------
# 3. Install Angular dependencies only if missing
# ---------------------------------------------------------------
Write-Step "[3/5] Checking frontend dependencies..."
$nodeModules = Join-Path $FrontendDir 'node_modules'
if (Test-Path $nodeModules) {
    Write-Ok "node_modules already present - skipping npm install."
} else {
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Err "npm was not found on PATH. Install Node.js and re-run."
        Stop-AndExit 1
    }
    Write-Host "  node_modules not found, running npm install..."
    Push-Location $FrontendDir
    & npm install
    $npmExit = $LASTEXITCODE
    Pop-Location
    if ($npmExit -ne 0) {
        Write-Err "npm install failed. See the npm output above."
        Stop-AndExit 1
    }
    Write-Ok "Frontend dependencies installed."
}
Write-Host ""

# ---------------------------------------------------------------
# 4. Start all three services hidden in the background
# ---------------------------------------------------------------
Write-Step "[4/5] Starting services..."

$mlLog       = Join-Path $LogDir 'ml-service.log'
$backendLog  = Join-Path $LogDir 'backend.log'
$frontendLog = Join-Path $LogDir 'frontend.log'
Remove-Item $mlLog, $backendLog, $frontendLog -ErrorAction SilentlyContinue

$mlCmd       = "chcp 65001>nul && cd /d `"$MlDir`" && `"$pyExePath`" -m uvicorn app:app --port 8000"
$backendCmd  = "chcp 65001>nul && cd /d `"$BackendDir`" && dotnet run"
# Angular CLI/Vite force-colorize output even when redirected to a file; NO_COLOR
# keeps the log plain so pattern matching and the live tail below stay readable.
# chcp 65001 switches the console to UTF-8 so its unicode icons (spinners, arrows)
# don't come back as garbled bytes when the log is read back.
$frontendCmd = "chcp 65001>nul && cd /d `"$FrontendDir`" && set NO_COLOR=1 && npm start"

$mlProc       = Start-Process -FilePath cmd.exe -ArgumentList "/c $mlCmd > `"$mlLog`" 2>&1"             -WindowStyle Hidden -PassThru
Write-Host "  ML service starting (PID $($mlProc.Id))..."
$backendProc  = Start-Process -FilePath cmd.exe -ArgumentList "/c $backendCmd > `"$backendLog`" 2>&1"   -WindowStyle Hidden -PassThru
Write-Host "  Backend API starting (PID $($backendProc.Id))..."
$frontendProc = Start-Process -FilePath cmd.exe -ArgumentList "/c $frontendCmd > `"$frontendLog`" 2>&1" -WindowStyle Hidden -PassThru
Write-Host "  Frontend starting (PID $($frontendProc.Id))..."
Write-Host ""

function Strip-Ansi($text) {
    if (-not $text) { return $text }
    $esc = [char]27
    return [Regex]::Replace($text, "$esc\[[0-9;]*[A-Za-z]", '')
}

function Wait-ForLog($path, [string[]]$patterns, $timeoutSec) {
    $sw = [Diagnostics.Stopwatch]::StartNew()
    while ($sw.Elapsed.TotalSeconds -lt $timeoutSec) {
        if (Test-Path $path) {
            $content = Strip-Ansi (Get-Content $path -Raw -Encoding UTF8 -ErrorAction SilentlyContinue)
            if ($content) {
                foreach ($p in $patterns) {
                    if ($content -match $p) { return $true }
                }
            }
        }
        Start-Sleep -Milliseconds 500
    }
    return $false
}

if (Wait-ForLog $mlLog @('Application startup complete', 'Uvicorn running on') 15) {
    Write-Ok "ML service is up on http://localhost:8000"
} else {
    Write-Warn "ML service did not confirm startup within 15s - check logs\ml-service.log"
}

if (Wait-ForLog $backendLog @('Now listening on') 25) {
    Write-Ok "Backend API is up on http://localhost:5073"
} else {
    Write-Warn "Backend API did not confirm startup within 25s - check logs\backend.log"
}

if (Wait-ForLog $frontendLog @('Local:\s+http://localhost:4200', 'listening on localhost:4200', 'bundle generation complete') 60) {
    Write-Ok "Frontend is up on http://localhost:4200"
} else {
    Write-Warn "Frontend did not confirm startup within 60s - check logs\frontend.log"
}
Write-Host ""

Write-Step "[5/5] Opening browser..."
Start-Process "http://localhost:4200"
Write-Host ""

# ---------------------------------------------------------------
# 6. Live combined logs + press 0 to stop everything
# ---------------------------------------------------------------
Write-Host "============================================" -ForegroundColor DarkGray
Write-Host " All services running. Press 0 to stop everything and exit." -ForegroundColor White
Write-Host " Live combined logs are shown below:" -ForegroundColor DarkGray
Write-Host "============================================" -ForegroundColor DarkGray
Write-Host ""

$logMap = [ordered]@{ 'ML ' = $mlLog; 'API' = $backendLog; 'WEB' = $frontendLog }
$pos    = @{}
foreach ($k in $logMap.Keys) { $pos[$k] = 0 }

$procMap = [ordered]@{ 'ML ' = $mlProc; 'API' = $backendProc; 'WEB' = $frontendProc }
$deadNotified = @{}

$canPoll = $true
try { [Console]::KeyAvailable | Out-Null } catch { $canPoll = $false }

while ($true) {
    foreach ($k in $logMap.Keys) {
        $path = $logMap[$k]
        if (Test-Path $path) {
            $lines = Get-Content $path -Encoding UTF8 -ErrorAction SilentlyContinue
            if ($lines -and $lines.Count -gt $pos[$k]) {
                $lines[$pos[$k]..($lines.Count - 1)] | ForEach-Object { Write-Host "[$k] $(Strip-Ansi $_)" }
                $pos[$k] = $lines.Count
            }
        }
    }

    foreach ($k in $procMap.Keys) {
        $p = $procMap[$k]
        $p.Refresh()
        if ($p.HasExited -and -not $deadNotified[$k]) {
            Write-Warn "$k process exited unexpectedly (exit code $($p.ExitCode)). Check its log in the logs folder."
            $deadNotified[$k] = $true
        }
    }

    if ($canPoll -and [Console]::KeyAvailable) {
        $key = [Console]::ReadKey($true)
        if ($key.KeyChar -eq '0') { break }
    } elseif (-not $canPoll) {
        if ((Read-Host "Type 0 and press Enter to stop everything") -eq '0') { break }
    }

    Start-Sleep -Milliseconds 400
}

Write-Host ""
Write-Host "Stopping all services..." -ForegroundColor Yellow
foreach ($k in $procMap.Keys) {
    $p = $procMap[$k]
    if ($p -and -not $p.HasExited) {
        try {
            taskkill /PID $p.Id /T /F | Out-Null
            Write-Ok "$k stopped (PID $($p.Id))."
        } catch {
            Write-Warn "Could not stop $k (PID $($p.Id)) - it may have already exited."
        }
    }
}
Write-Host ""
Write-Ok "All services stopped."
Stop-AndExit 0
