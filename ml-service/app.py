from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import os
from datetime import datetime
import logging

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

try:
    nltk.data.find('sentiment/vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')

from nltk.sentiment import SentimentIntensityAnalyzer
sia = SentimentIntensityAnalyzer()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize ML components
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

# Global variables for models
category_vectorizer = None
category_model = None
severity_model = None
kmeans_model = None
models_trained = False

# Categories and priority levels
CATEGORIES = [
    'Infrastructure', 'Sanitation', 'Water Supply', 'Electricity', 
    'Roads', 'Public Safety', 'Noise Pollution', 'Other'
]

PRIORITIES = ['low', 'medium', 'high', 'critical']

class TextPreprocessor:
    @staticmethod
    def clean_text(text):
        """Clean and preprocess text data"""
        if not isinstance(text, str):
            text = str(text)
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters and numbers
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords and lemmatize
        tokens = [lemmatizer.lemmatize(word) for word in tokens if word not in stop_words]
        
        return ' '.join(tokens)

class CategoryClassifier:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
        self.model = MultinomialNB()
        self.is_trained = False
    
    def train(self, texts, labels):
        """Train the category classifier"""
        try:
            # Preprocess texts
            processed_texts = [TextPreprocessor.clean_text(text) for text in texts]
            
            # Create TF-IDF features
            X = self.vectorizer.fit_transform(processed_texts)
            y = np.array(labels)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Train model
            self.model.fit(X_train, y_train)
            
            # Evaluate
            y_pred = self.model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            self.is_trained = True
            logger.info(f"Category classifier trained with accuracy: {accuracy:.4f}")
            
            return {
                'accuracy': accuracy,
                'classification_report': classification_report(y_test, y_pred, output_dict=True)
            }
        except Exception as e:
            logger.error(f"Error training category classifier: {str(e)}")
            raise
    
    def predict(self, text):
        """Predict category for given text"""
        if not self.is_trained:
            raise ValueError("Model not trained yet")
        
        processed_text = TextPreprocessor.clean_text(text)
        X = self.vectorizer.transform([processed_text])
        prediction = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]
        
        # Get confidence scores
        class_probabilities = dict(zip(self.model.classes_, probabilities))
        
        return {
            'predicted': prediction,
            'confidence': float(max(probabilities)),
            'all_probabilities': class_probabilities
        }

class SeverityPredictor:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=3000, ngram_range=(1, 2))
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.is_trained = False
    
    def train(self, texts, categories, locations, priorities):
        """Train the severity predictor"""
        try:
            # Preprocess texts
            processed_texts = [TextPreprocessor.clean_text(text) for text in texts]
            
            # Create features
            text_features = self.vectorizer.fit_transform(processed_texts).toarray()
            
            # Add category as feature
            category_features = np.array([[CATEGORIES.index(cat) if cat in CATEGORIES else len(CATEGORIES)-1] for cat in categories])
            
            # Add location features (latitude, longitude)
            location_features = np.array([[loc.get('latitude', 0), loc.get('longitude', 0)] for loc in locations])
            
            # Combine all features
            X = np.hstack([text_features, category_features, location_features])
            
            # Convert priorities to numerical
            priority_map = {'low': 0, 'medium': 1, 'high': 2, 'critical': 3}
            y = np.array([priority_map.get(p, 1) for p in priorities])
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Train model
            self.model.fit(X_train, y_train)
            
            # Evaluate
            y_pred = self.model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            self.is_trained = True
            logger.info(f"Severity predictor trained with accuracy: {accuracy:.4f}")
            
            return {
                'accuracy': accuracy,
                'classification_report': classification_report(y_test, y_pred, output_dict=True)
            }
        except Exception as e:
            logger.error(f"Error training severity predictor: {str(e)}")
            raise
    
    def predict(self, text, category, location):
        """Predict severity for given complaint"""
        if not self.is_trained:
            raise ValueError("Model not trained yet")
        
        processed_text = TextPreprocessor.clean_text(text)
        text_features = self.vectorizer.transform([processed_text]).toarray()
        
        # Category feature
        category_feature = np.array([[CATEGORIES.index(category) if category in CATEGORIES else len(CATEGORIES)-1]])
        
        # Location features
        location_feature = np.array([[location.get('latitude', 0), location.get('longitude', 0)]])
        
        # Combine features
        X = np.hstack([text_features, category_feature, location_feature])
        
        prediction = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]
        
        # Convert back to priority labels
        priority_map = ['low', 'medium', 'high', 'critical']
        predicted_priority = priority_map[prediction]
        
        # Calculate risk score (0-100)
        risk_score = float(max(probabilities) * 100)
        
        return {
            'predicted': predicted_priority,
            'confidence': float(max(probabilities)),
            'riskScore': risk_score,
            'all_probabilities': dict(zip(priority_map, probabilities))
        }

class HotspotDetector:
    def __init__(self):
        self.model = KMeans(n_clusters=10, random_state=42)
        self.is_trained = False
    
    def train(self, locations):
        """Train the hotspot detection model"""
        try:
            if len(locations) < 10:
                raise ValueError("Need at least 10 locations for clustering")
            
            # Extract coordinates
            coords = np.array([[loc.get('latitude', 0), loc.get('longitude', 0)] for loc in locations])
            
            # Remove invalid coordinates
            valid_coords = coords[(coords[:, 0] != 0) & (coords[:, 1] != 0)]
            
            if len(valid_coords) < 10:
                raise ValueError("Need at least 10 valid coordinates for clustering")
            
            # Fit KMeans
            self.model.fit(valid_coords)
            self.is_trained = True
            
            logger.info(f"Hotspot detector trained with {len(valid_coords)} locations")
            
            return {
                'clusters': len(set(self.model.labels_)),
                'inertia': self.model.inertia_
            }
        except Exception as e:
            logger.error(f"Error training hotspot detector: {str(e)}")
            raise
    
    def predict_cluster(self, location):
        """Predict cluster for a given location"""
        if not self.is_trained:
            raise ValueError("Model not trained yet")
        
        coord = np.array([[location.get('latitude', 0), location.get('longitude', 0)]])
        
        if coord[0][0] == 0 or coord[0][1] == 0:
            return {
                'clusterId': -1,
                'hotspotScore': 0
            }
        
        cluster_id = self.model.predict(coord)[0]
        
        # Calculate hotspot score based on distance to cluster center
        center = self.model.cluster_centers_[cluster_id]
        distance = np.linalg.norm(coord[0] - center)
        hotspot_score = max(0, 100 - distance * 10)  # Simple scoring function
        
        return {
            'clusterId': int(cluster_id),
            'hotspotScore': float(hotspot_score)
        }
    
    def get_hotspots(self, locations, min_complaints=3):
        """Get hotspot areas"""
        if not self.is_trained:
            raise ValueError("Model not trained yet")
        
        coords = np.array([[loc.get('latitude', 0), loc.get('longitude', 0)] for loc in locations])
        valid_coords = coords[(coords[:, 0] != 0) & (coords[:, 1] != 0)]
        
        if len(valid_coords) == 0:
            return []
        
        cluster_labels = self.model.predict(valid_coords)
        
        # Count complaints per cluster
        unique_clusters, counts = np.unique(cluster_labels, return_counts=True)
        
        hotspots = []
        for cluster_id, count in zip(unique_clusters, counts):
            if count >= min_complaints:
                center = self.model.cluster_centers_[cluster_id]
                hotspots.append({
                    'clusterId': int(cluster_id),
                    'center': {
                        'latitude': float(center[0]),
                        'longitude': float(center[1])
                    },
                    'complaintCount': int(count),
                    'hotspotScore': float(count * 10)  # Simple scoring
                })
        
        return sorted(hotspots, key=lambda x: x['hotspotScore'], reverse=True)

class NLPInsightGenerator:
    @staticmethod
    def get_insights(text):
        """Extract NLP insights from text"""
        processed_text = TextPreprocessor.clean_text(text)
        tokens = word_tokenize(processed_text)
        
        # Get sentiment
        sentiment_scores = sia.polarity_scores(text)
        sentiment = 'neutral'
        if sentiment_scores['compound'] >= 0.05:
            sentiment = 'positive'
        elif sentiment_scores['compound'] <= -0.05:
            sentiment = 'negative'
            
        # Extract keywords (simple implementation)
        # In a real app, this could use TF-IDF or RAKE
        keywords = list(set([word for word in tokens if len(word) > 3]))[:5]
        
        return {
            'keywords': keywords,
            'sentiment': sentiment,
            'sentimentScore': sentiment_scores['compound']
        }

class ResolutionSuggester:
    # Historical correlation between categories and common resolutions
    RESOLUTION_TEMPLATES = {
        'Infrastructure': "Schedule a site inspection by the engineering department. Check for structural integrity.",
        'Sanitation': "Dispatch the sanitation crew for immediate cleanup. Verify the waste disposal schedule in the area.",
        'Water Supply': "Inspect the main pipeline for leaks or blockages. Coordinate with the water department for pressure testing.",
        'Electricity': "Report to the local power grid authority. Check for transformer issues or line faults.",
        'Roads': "Initiate a road repair request. Mark the area for safety if there are deep potholes.",
        'Public Safety': "Notify the local police or security patrol. Increase surveillance in the reported vicinity.",
        'Noise Pollution': "Issue a noise nuisance notice. Monitor decibel levels during peak hours.",
        'Other': "Categorize the issue for specialized review. Contact the relevant department for a preliminary assessment."
    }

    @staticmethod
    def suggest(category, description):
        """Suggest a resolution based on category and description"""
        # Default resolution
        resolution = "Analyze the complaint details and assign to the most relevant department for investigation."
        
        if category in ResolutionSuggester.RESOLUTION_TEMPLATES:
            resolution = ResolutionSuggester.RESOLUTION_TEMPLATES[category]
        
        # Refine based on keywords in description
        desc_lower = description.lower()
        if 'urgent' in desc_lower or 'emergency' in desc_lower or 'danger' in desc_lower:
            resolution = "URGENT: " + resolution + " Prioritize immediate field response."
            
        return {
            'action': resolution,
            'confidence': 0.82 if category in ResolutionSuggester.RESOLUTION_TEMPLATES else 0.5
        }

# Initialize models
category_classifier = CategoryClassifier()
severity_predictor = SeverityPredictor()
hotspot_detector = HotspotDetector()

def load_models():
    """Load pre-trained models if available"""
    global models_trained
    
    try:
        if os.path.exists('models/category_vectorizer.pkl'):
            with open('models/category_vectorizer.pkl', 'rb') as f:
                category_classifier.vectorizer = pickle.load(f)
        
        if os.path.exists('models/category_model.pkl'):
            with open('models/category_model.pkl', 'rb') as f:
                category_classifier.model = pickle.load(f)
                category_classifier.is_trained = True
        
        if os.path.exists('models/severity_vectorizer.pkl'):
            with open('models/severity_vectorizer.pkl', 'rb') as f:
                severity_predictor.vectorizer = pickle.load(f)
        
        if os.path.exists('models/severity_model.pkl'):
            with open('models/severity_model.pkl', 'rb') as f:
                severity_predictor.model = pickle.load(f)
                severity_predictor.is_trained = True
        
        if os.path.exists('models/kmeans_model.pkl'):
            with open('models/kmeans_model.pkl', 'rb') as f:
                hotspot_detector.model = pickle.load(f)
                hotspot_detector.is_trained = True
        
        models_trained = category_classifier.is_trained and severity_predictor.is_trained
        logger.info(f"Models loaded. Trained: {models_trained}")
        
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")
        models_trained = False

def save_models():
    """Save trained models"""
    try:
        os.makedirs('models', exist_ok=True)
        
        if category_classifier.is_trained:
            with open('models/category_vectorizer.pkl', 'wb') as f:
                pickle.dump(category_classifier.vectorizer, f)
            with open('models/category_model.pkl', 'wb') as f:
                pickle.dump(category_classifier.model, f)
        
        if severity_predictor.is_trained:
            with open('models/severity_vectorizer.pkl', 'wb') as f:
                pickle.dump(severity_predictor.vectorizer, f)
            with open('models/severity_model.pkl', 'wb') as f:
                pickle.dump(severity_predictor.model, f)
        
        if hotspot_detector.is_trained:
            with open('models/kmeans_model.pkl', 'wb') as f:
                pickle.dump(hotspot_detector.model, f)
        
        logger.info("Models saved successfully")
        
    except Exception as e:
        logger.error(f"Error saving models: {str(e)}")

# Load models on startup
load_models()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'models_trained': models_trained
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Make predictions for a complaint"""
    try:
        data = request.get_json()
        
        text = data.get('text', '')
        category = data.get('category', '')
        location = data.get('location', {})
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        predictions = {}
        
        # Category prediction
        if category_classifier.is_trained:
            category_pred = category_classifier.predict(text)
            predictions['category'] = {
                'predicted': category_pred['predicted'],
                'confidence': category_pred['confidence'],
                'processedAt': datetime.now().isoformat()
            }
        
        # Severity prediction
        if severity_predictor.is_trained and category and location:
            severity_pred = severity_predictor.predict(text, category, location)
            predictions['severity'] = {
                'predicted': severity_pred['predicted'],
                'confidence': severity_pred['confidence'],
                'riskScore': severity_pred['riskScore'],
                'processedAt': datetime.now().isoformat()
            }
        # Cluster prediction
        if hotspot_detector.is_trained and location:
            cluster_pred = hotspot_detector.predict_cluster(location)
            predictions['cluster'] = {
                'clusterId': cluster_pred['clusterId'],
                'hotspotScore': cluster_pred['hotspotScore'],
                'processedAt': datetime.now().isoformat()
            }
        
        # NLP Insights
        predictions['nlpInsights'] = NLPInsightGenerator.get_insights(text)
        
        # Suggested Resolution
        predictions['suggestedResolution'] = ResolutionSuggester.suggest(category or predictions.get('category', {}).get('predicted', 'Other'), text)
        
        return jsonify(predictions)
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/train', methods=['POST'])
def train_models():
    """Train ML models with provided data"""
    try:
        data = request.get_json()
        training_data = data.get('data', [])
        model_type = data.get('modelType', 'all')
        
        if len(training_data) < 100:
            return jsonify({'error': 'Need at least 100 training samples'}), 400
        
        # Extract training data
        texts = [item.get('text', '') for item in training_data]
        categories = [item.get('category', '') for item in training_data]
        priorities = [item.get('priority', '') for item in training_data]
        locations = [item.get('location', {}) for item in training_data]
        
        results = {}
        
        # Train category classifier
        if model_type in ['all', 'category']:
            try:
                results['category'] = category_classifier.train(texts, categories)
            except Exception as e:
                results['category'] = {'error': str(e)}
        
        # Train severity predictor
        if model_type in ['all', 'severity']:
            try:
                results['severity'] = severity_predictor.train(texts, categories, locations, priorities)
            except Exception as e:
                results['severity'] = {'error': str(e)}
        
        # Train hotspot detector
        if model_type in ['all', 'cluster']:
            try:
                results['cluster'] = hotspot_detector.train(locations)
            except Exception as e:
                results['cluster'] = {'error': str(e)}
        
        # Save models
        save_models()
        
        # Update global trained status
        global models_trained
        models_trained = category_classifier.is_trained and severity_predictor.is_trained
        
        return jsonify({
            'message': 'Training completed',
            'results': results,
            'samples_used': len(training_data)
        })
        
    except Exception as e:
        logger.error(f"Training error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/cluster', methods=['POST'])
def get_clusters():
    """Get hotspot clusters"""
    try:
        data = request.get_json()
        radius = data.get('radius', 1000)
        min_complaints = data.get('minComplaints', 3)
        
        # This would typically fetch from database
        # For now, return mock data
        mock_clusters = [
            {
                'clusterId': 1,
                'center': {'latitude': 40.7128, 'longitude': -74.0060},
                'count': 15,
                'hotspotScore': 85.5,
                'categories': ['Infrastructure', 'Sanitation']
            },
            {
                'clusterId': 2,
                'center': {'latitude': 40.7580, 'longitude': -73.9855},
                'count': 8,
                'hotspotScore': 62.3,
                'categories': ['Roads', 'Public Safety']
            }
        ]
        
        return jsonify(mock_clusters)
        
    except Exception as e:
        logger.error(f"Cluster error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/models/status', methods=['GET'])
def models_status():
    """Get status of all models"""
    return jsonify({
        'category_classifier': {
            'trained': category_classifier.is_trained,
            'model_type': 'Multinomial Naive Bayes'
        },
        'severity_predictor': {
            'trained': severity_predictor.is_trained,
            'model_type': 'Random Forest'
        },
        'hotspot_detector': {
            'trained': hotspot_detector.is_trained,
            'model_type': 'K-Means Clustering'
        },
        'overall': {
            'models_trained': models_trained,
            'timestamp': datetime.now().isoformat()
        }
    })

@app.route('/analytics/patterns', methods=['GET'])
def get_patterns():
    """Get complaint patterns and insights"""
    try:
        # This would typically analyze database data
        # For now, return mock patterns
        mock_patterns = {
            'timePatterns': [
                {'hour': 9, 'category': 'Infrastructure', 'count': 25},
                {'hour': 14, 'category': 'Sanitation', 'count': 18},
                {'hour': 18, 'category': 'Public Safety', 'count': 32}
            ],
            'categoryTrends': {
                'Infrastructure': 'increasing',
                'Sanitation': 'stable',
                'Water Supply': 'decreasing'
            },
            'severityDistribution': {
                'low': 30,
                'medium': 45,
                'high': 20,
                'critical': 5
            }
        }
        
        return jsonify(mock_patterns)
        
    except Exception as e:
        logger.error(f"Patterns error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
