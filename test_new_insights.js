async function testNewInsights() {
    console.log('--- TESTING NEW AI INSIGHTS (using Native Fetch) ---');
    try {
        // 1. Check ML Service directly
        console.log('Checking ML service at http://localhost:5001/predict...');
        const response = await fetch('http://localhost:5001/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: "The main water pipe in Downtown is leaking severely, causing a flood. This is urgent and dangerous for traffic.",
                category: "Water Supply",
                location: { latitude: 11.0, longitude: 77.0 }
            })
        });

        const data = await response.json();

        console.log('ML Prediction Results:');
        console.log('- Sentiment:', data.nlpInsights.sentiment);
        console.log('- Keywords:', data.nlpInsights.keywords.join(', '));
        console.log('- Suggested Resolution:', data.suggestedResolution.action);

        if (data.nlpInsights.sentiment && data.suggestedResolution.action) {
            console.log('✅ ML Service verification successful.');
        } else {
            console.log('❌ ML Service verification failed: missing new fields.');
            console.log('Data received:', JSON.stringify(data, null, 2));
            return;
        }

        console.log('\nIntegration Note: Backend model and routes have been updated to map these fields.');

    } catch (error) {
        console.error('Test Error:', error.message);
    }
}

testNewInsights();
