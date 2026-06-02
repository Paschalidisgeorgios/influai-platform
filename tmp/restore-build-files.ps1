# Run after freeing disk: stop npm run dev, delete .next, empty Recycle Bin
# Then: powershell -ExecutionPolicy Bypass -File tmp\restore-build-files.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "Restoring tool-status.ts and CreatorToolbox.tsx..."

# See agent transcript for full restore - run npm run build after.
