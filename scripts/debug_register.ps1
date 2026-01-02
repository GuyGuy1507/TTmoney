Set-Location 'D:\VScode\TTMONEY'
try {
  $body = @{ name='CI Test'; email='ci-test@example.com'; password='Password123' } | ConvertTo-Json
  $r = Invoke-RestMethod -Method Post -Uri 'http://localhost:5000/api/auth/register' -Body $body -ContentType 'application/json' -TimeoutSec 10
  Write-Output ("OK: " + ($r | ConvertTo-Json -Compress))
} catch {
  Write-Output ("EXCEPTION: " + $_.Exception.Message)
  if ($_.Exception.Response) {
    $resp = $_.Exception.Response.GetResponseStream()
    $sr = New-Object System.IO.StreamReader($resp)
    $content = $sr.ReadToEnd()
    Write-Output ("RESPONSE_BODY: " + $content)
  }
}
