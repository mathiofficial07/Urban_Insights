# ML Models Test Script
Write-Host "🧠 TESTING ML MODELS" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if ML Service is running
Write-Host "1. Testing ML Service on port 5001..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5001/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ ML Service is RUNNING" -ForegroundColor Green
    Write-Host "📊 Response: $response"
    $mlRunning = $true
} catch {
    Write-Host "❌ ML Service is NOT RUNNING" -ForegroundColor Red
    Write-Host "📝 Error: $($_.Exception.Message)"
    $mlRunning = $false
}

Write-Host ""

# Test 2: Check if Backend is running
Write-Host "2. Testing Backend on port 5000..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Backend is RUNNING" -ForegroundColor Green
    Write-Host "📊 Response: $response"
    $backendRunning = $true
} catch {
    Write-Host "❌ Backend is NOT RUNNING" -ForegroundColor Red
    Write-Host "📝 Error: $($_.Exception.Message)"
    $backendRunning = $false
}

Write-Host ""

# Test 3: Check ML Service files
Write-Host "3. Checking ML Service files..." -ForegroundColor Yellow
$mlServicePath = ".\ml-service"
$requiredFiles = @("app.py", "requirements.txt", ".env.example")

$filesExist = $true
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $mlServicePath $file
    if (Test-Path $filePath) {
        Write-Host "✅ $file - Found" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - Missing" -ForegroundColor Red
        $filesExist = $false
    }
}

Write-Host ""

# Summary
Write-Host "📋 RESULTS SUMMARY:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "ML Service: $(if ($mlRunning) { '✅ RUNNING' } else { '❌ STOPPED' })"
Write-Host "Backend: $(if ($backendRunning) { '✅ RUNNING' } else { '❌ STOPPED' })"
Write-Host "ML Files: $(if ($filesExist) { '✅ COMPLETE' } else { '❌ INCOMPLETE' })"

Write-Host ""
Write-Host "🔧 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan

if (-not $mlRunning) {
    Write-Host "1. Start ML Service:" -ForegroundColor Yellow
    Write-Host "   cd ml-service" -ForegroundColor White
    Write-Host "   pip install -r requirements.txt" -ForegroundColor White
    Write-Host "   python app.py" -ForegroundColor White
    Write-Host ""
}

if (-not $backendRunning) {
    Write-Host "2. Start Backend:" -ForegroundColor Yellow
    Write-Host "   cd backend" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
}

if ($mlRunning -and $backendRunning) {
    Write-Host "🎉 Both services are running!" -ForegroundColor Green
    Write-Host "💡 ML models should be working" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test ML features:" -ForegroundColor Yellow
    Write-Host "1. Open admin dashboard" -ForegroundColor White
    Write-Host "2. Create a test complaint" -ForegroundColor White
    Write-Host "3. Check if ML predictions appear" -ForegroundColor White
}

Write-Host ""
Write-Host "📚 For detailed ML testing:" -ForegroundColor Cyan
Write-Host "cd backend && npm run test-ml" -ForegroundColor White
Write-Host ""

# Keep window open
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
