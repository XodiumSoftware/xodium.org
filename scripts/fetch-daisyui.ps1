$ErrorActionPreference = "Stop"

# DAISYUI_VERSION is expected to be set via Trunk.toml [env] section
if (-not $env:DAISYUI_VERSION)
{
    Write-Error "DAISYUI_VERSION environment variable is not set"
    Write-Error "This script should be run via Trunk which sets the variable from Trunk.toml"
    exit 1
}

$DAISYUI_VERSION = $env:DAISYUI_VERSION
$BASE_URL = "https://github.com/saadeghi/daisyui/releases/download/v$DAISYUI_VERSION"
$SENTINEL = "public/.daisyui-version"

if ((Test-Path $SENTINEL) -and (Get-Content $SENTINEL -Raw).Trim() -eq $DAISYUI_VERSION)
{
    exit 0
}

Write-Host "Fetching daisyui v$DAISYUI_VERSION..."
Invoke-WebRequest -Uri "$BASE_URL/daisyui.mjs" -OutFile "public/daisyui.mjs"
Invoke-WebRequest -Uri "$BASE_URL/daisyui-theme.mjs" -OutFile "public/daisyui-theme.mjs"
Set-Content -Path $SENTINEL -Value $DAISYUI_VERSION -NoNewline
