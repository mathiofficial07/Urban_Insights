// NLP Algorithm Demo - How it processes user complaints
console.log('🧠 NLP ALGORITHM DEMO - Processing User Complaints\n');

// Simulate the NLP processing steps
function processComplaint(complaint) {
  console.log(`📝 Original Complaint: "${complaint}"`);
  console.log('─'.repeat(50));
  
  // Step 1: Text Cleaning (like TextPreprocessor.clean_text)
  console.log('🔧 Step 1: Text Cleaning');
  let cleaned = complaint.toLowerCase()
    .replace(/[^a-zA-Z\s]/g, '') // Remove special characters
    .trim();
  console.log(`   Cleaned: "${cleaned}"`);
  
  // Step 2: Tokenization
  console.log('\n🔧 Step 2: Tokenization');
  let tokens = cleaned.split(/\s+/).filter(word => word.length > 0);
  console.log(`   Tokens: [${tokens.map(t => `"${t}"`).join(', ')}]`);
  
  // Step 3: Stop Word Removal
  console.log('\n🔧 Step 3: Stop Word Removal');
  const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
  let meaningfulTokens = tokens.filter(word => !stopWords.includes(word));
  console.log(`   Meaningful: [${meaningfulTokens.map(t => `"${t}"`).join(', ')}]`);
  
  // Step 4: Lemmatization
  console.log('\n🔧 Step 4: Lemmatization');
  let lemmatized = meaningfulTokens.map(word => {
    // Simple lemmatization simulation
    const lemmas = {
      'broken': 'break',
      'broken': 'break',
      'leaking': 'leak',
      'damaged': 'damage',
      'blocked': 'block',
      'polluted': 'pollute',
      'noisy': 'noise',
      'dangerous': 'danger'
    };
    return lemmas[word] || word;
  });
  console.log(`   Lemmatized: [${lemmatized.map(t => `"${t}"`).join(', ')}]`);
  
  // Step 5: Feature Extraction (TF-IDF simulation)
  console.log('\n🔧 Step 5: Feature Extraction');
  console.log('   Converting to numerical features...');
  console.log('   Creating TF-IDF vectors...');
  
  // Step 6: Classification
  console.log('\n🔧 Step 6: ML Classification');
  let category = classifyComplaint(lemmatized);
  let priority = predictPriority(lemmatized, category);
  let sentiment = analyzeSentiment(lemmatized);
  
  console.log(`   📂 Category: ${category}`);
  console.log(`   🚨 Priority: ${priority}`);
  console.log(`   😊 Sentiment: ${sentiment}`);
  
  return {
    original: complaint,
    cleaned,
    tokens,
    meaningfulTokens,
    lemmatized,
    category,
    priority,
    sentiment
  };
}

// Simulate category classification
function classifyComplaint(tokens) {
  const categories = {
    'water': ['water', 'pipe', 'leak', 'drain', 'sewer', 'flood', 'tap'],
    'electricity': ['power', 'electric', 'light', 'wire', 'pole', 'transformer', 'outage'],
    'roads': ['road', 'street', 'pothole', 'traffic', 'signal', 'highway', 'pavement'],
    'garbage': ['garbage', 'trash', 'waste', 'dump', 'clean', 'bin', 'collection'],
    'noise': ['noise', 'loud', 'sound', 'music', 'construction', 'party'],
    'safety': ['dangerous', 'unsafe', 'hazard', 'accident', 'injury', 'crime']
  };
  
  let scores = {};
  for (let [category, keywords] of Object.entries(categories)) {
    scores[category] = tokens.filter(token => keywords.includes(token)).length;
  }
  
  let bestCategory = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  return scores[bestCategory] > 0 ? bestCategory : 'general';
}

// Simulate priority prediction
function predictPriority(tokens, category) {
  const urgentWords = ['emergency', 'dangerous', 'critical', 'immediate', 'urgent', 'severe', 'hazard'];
  const highWords = ['broken', 'leaking', 'blocked', 'noisy', 'major'];
  const mediumWords = ['issue', 'problem', 'concern', 'needs'];
  
  let score = 0;
  if (urgentWords.some(word => tokens.includes(word))) score += 3;
  if (highWords.some(word => tokens.includes(word))) score += 2;
  if (mediumWords.some(word => tokens.includes(word))) score += 1;
  
  if (category === 'safety' || category === 'electricity') score += 1;
  
  if (score >= 4) return 'critical';
  if (score >= 3) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

// Simulate sentiment analysis
function analyzeSentiment(tokens) {
  const positive = ['thank', 'good', 'great', 'excellent', 'fixed', 'resolved'];
  const negative = ['bad', 'terrible', 'awful', 'broken', 'leaking', 'dangerous', 'frustrated'];
  
  let posCount = tokens.filter(t => positive.includes(t)).length;
  let negCount = tokens.filter(t => negative.includes(t)).length;
  
  if (negCount > posCount) return 'negative';
  if (posCount > negCount) return 'positive';
  return 'neutral';
}

// Demo with different complaint types
console.log('🎯 PROCESSING SAMPLE COMPLAINTS:\n');

const complaints = [
  "There is a broken water pipe leaking on the main street",
  "The street lights are not working and it's very dangerous at night",
  "Garbage is not collected from our area for the past two weeks",
  "Loud construction noise is disturbing the entire neighborhood",
  "Potholes on the highway are causing accidents daily"
];

complaints.forEach((complaint, index) => {
  console.log(`\n📍 Complaint ${index + 1}:`);
  processComplaint(complaint);
  console.log('\n' + '='.repeat(60) + '\n');
});

console.log('🎉 NLP PROCESSING COMPLETE!');
console.log('\n📊 SUMMARY:');
console.log('• Text is cleaned and tokenized');
console.log('• Stop words are removed');
console.log('• Words are lemmatized to root forms');
console.log('• Features are extracted using TF-IDF');
console.log('• ML models classify category and priority');
console.log('• Sentiment analysis detects user emotions');
console.log('• Results help prioritize and route complaints');

console.log('\n🔧 To see this in action:');
console.log('1. Start ML service: cd ml-service && python app.py');
console.log('2. Create a complaint in the app');
console.log('3. Check the ML predictions in the admin dashboard');
