# Generate the PMP cheat sheet PDF using Chrome headless.
$chrome  = 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'
$htmlUri = 'file:///G:/Users/daveq/cipher-marketing/lead-magnets/pmp-exam-lens-cheat-sheet.html'
$pdfOut  = 'G:\Users\daveq\cipher-marketing\lead-magnets\pmp-exam-lens-cheat-sheet.pdf'

if (-not (Test-Path $chrome)) {
  Write-Host "Chrome not found at: $chrome"
  exit 1
}

& $chrome `
  --headless=new `
  --disable-gpu `
  --no-pdf-header-footer `
  --virtual-time-budget=8000 `
  "--print-to-pdf=$pdfOut" `
  $htmlUri 2>&1 | Out-Null

if (Test-Path $pdfOut) {
  $size = (Get-Item $pdfOut).Length
  Write-Host ("OK PDF generated: " + $pdfOut + " (" + $size + " bytes)")
} else {
  Write-Host ("FAIL PDF not found at " + $pdfOut)
  exit 1
}
