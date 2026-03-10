$ErrorActionPreference = "Stop"

$DaisyuiVersion = "5.5.19"
$BaseUrl = "https://github.com/saadeghi/daisyui/releases/download/v$DaisyuiVersion"
$Sentinel = "public/.daisyui-version"

if ((Test-Path $Sentinel) -and (Get-Content $Sentinel) -eq $DaisyuiVersion) {
    exit 0
}

Write-Host "Fetching daisyui v$DaisyuiVersion..."
Invoke-WebRequest -Uri "$BaseUrl/daisyui.mjs" -OutFile "public/daisyui.mjs"
Invoke-WebRequest -Uri "$BaseUrl/daisyui-theme.mjs" -OutFile "public/daisyui-theme.mjs"
Set-Content -Path $Sentinel -Value $DaisyuiVersion
