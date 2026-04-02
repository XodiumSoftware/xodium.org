$ErrorActionPreference = "Stop"

$DAISYUI_VERSION = "5.5.19"
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
