Set-Location 'D:\VScode\TTMONEY'

# Register
Try {
    $regBody = @{ name='CI Test'; email='ci-test@example.com'; password='Password123' } | ConvertTo-Json
    $r = Invoke-RestMethod -Method Post -Uri 'http://localhost:5000/api/auth/register' -Body $regBody -ContentType 'application/json' -TimeoutSec 10
    Write-Output ("REGISTER_OK: " + ($r | ConvertTo-Json -Compress))
} Catch {
    Write-Output ("REGISTER_ERROR: " + $_.Exception.Message)
}

# Login
Try {
    $loginBody = @{ email='ci-test@example.com'; password='Password123' } | ConvertTo-Json
    $l = Invoke-RestMethod -Method Post -Uri 'http://localhost:5000/api/auth/login' -Body $loginBody -ContentType 'application/json' -TimeoutSec 10
    Write-Output ("LOGIN_OK: " + ($l | ConvertTo-Json -Compress))
    if ($l.token) { $token = $l.token } elseif ($l.accessToken) { $token = $l.accessToken } elseif ($l.data -and $l.data.token) { $token = $l.data.token } else { $token = $null }
} Catch {
    Write-Output ("LOGIN_ERROR: " + $_.Exception.Message)
    exit 2
}

if (-not $token) { Write-Output 'NO_TOKEN'; exit 3 }

# Create category
Try {
    $catBody = @{ name='TestCat' } | ConvertTo-Json
    $cat = Invoke-RestMethod -Method Post -Uri 'http://localhost:5000/api/categories' -Headers @{ Authorization = "Bearer $token" } -Body $catBody -ContentType 'application/json' -TimeoutSec 10
    Write-Output ("CATEGORY_OK: " + ($cat | ConvertTo-Json -Compress))
} Catch {
    Write-Output ("CATEGORY_ERROR: " + $_.Exception.Message)
}

# Create expense
Try {
    $catId = $null
    if ($cat -ne $null) { if ($cat.id) { $catId = $cat.id } elseif ($cat._id) { $catId = $cat._id } }
    $expBody = @{ amount = 12.34; description = 'E2E expense'; category = $catId } | ConvertTo-Json
    $exp = Invoke-RestMethod -Method Post -Uri 'http://localhost:5000/api/expenses' -Headers @{ Authorization = "Bearer $token" } -Body $expBody -ContentType 'application/json' -TimeoutSec 10
    Write-Output ("EXPENSE_OK: " + ($exp | ConvertTo-Json -Compress))
} Catch {
    Write-Output ("EXPENSE_ERROR: " + $_.Exception.Message)
}

# List expenses
Try {
    $list = Invoke-RestMethod -Method Get -Uri 'http://localhost:5000/api/expenses' -Headers @{ Authorization = "Bearer $token" } -TimeoutSec 10
    Write-Output ("EXPENSES_LIST: " + ($list | ConvertTo-Json -Compress))
} Catch {
    Write-Output ("LIST_ERROR: " + $_.Exception.Message)
}

Write-Output 'E2E_DONE'
