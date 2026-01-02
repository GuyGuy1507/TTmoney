Set-Location 'D:\VScode\TTMONEY'
$net = netstat -ano | Select-String ':5000'
if ($net) {
  $line = $net[0].ToString()
  $foundPid = ($line -split '\s+')[-1]
  Write-Output "Found PID: $foundPid. Killing..."
  taskkill /PID $foundPid /F | Out-Null
} else { Write-Output "No process on port 5000" }

Start-Process -FilePath 'powershell' -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-Command','Set-Location "D:\VScode\TTMONEY\apps\backend"; npm run dev' -WindowStyle Hidden
Write-Output 'Started backend in a new PowerShell process'
