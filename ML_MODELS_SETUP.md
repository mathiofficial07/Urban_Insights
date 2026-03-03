# 🧠 ML Models Setup and Testing Guide

## 🎯 Overview

The Urban Insights system includes ML models for:
- **Complaint Classification** - Categorizes complaints automatically
- **Hotspot Detection** - Identifies problem areas using clustering
- **Priority Prediction** - Predicts complaint urgency

## 🚀 Quick Test

### Test All ML Components
```bash
cd backend
npm run test-ml
```

This will test:
- ML Service connection
- ML Prediction endpoint
- ML Clustering endpoint
- Backend ML routes

## 📋 ML System Architecture

```
Frontend → Backend API → ML Service (Python) → ML Models
```

- **Backend**: Node.js server on port 5000
- **ML Service**: Python Flask server on port 5001
- **Models**: Scikit-learn models for classification and clustering

## 🔧 Setup Instructions

### Step 1: Install Python Dependencies
```bash
cd ml-service
pip install -r requirements.txt
```

### Step 2: Start ML Service
```bash
cd ml-service
python app.py
```
Expected output:
```
* Running on http://127.0.0.1:5001
* Debug mode: on
```

### Step 3: Start Backend
```bash
cd backend
npm run dev
```

### Step 4: Test ML Models
```bash
cd backend
npm run test-ml
```

## 🧪 Manual Testing

### Test ML Service Health
```bash
curl http://localhost:5001/health
```
Expected: `{"status": "healthy", "service": "ML Service"}`

### Test ML Prediction
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Broken water pipe on main street",
    "category": "water",
    "location": {"latitude": 13.0827, "longitude": 80.2707}
  }'
```

### Test ML Clustering
```bash
curl -X POST http://localhost:5001/cluster \
  -H "Content-Type: application/json" \
  -d '{
    "complaints": [
      {
        "text": "Broken water pipe",
        "category": "water",
        "location": {"latitude": 13.0827, "longitude": 80.2707}
      }
    ]
  }'
```

## 🤖 ML Models Available

### 1. Complaint Classifier
- **Purpose**: Classify complaints into categories
- **Algorithm**: Naive Bayes + Random Forest
- **Features**: Text content, category, location
- **Output**: Priority level, category prediction

### 2. Hotspot Detector
- **Purpose**: Identify geographic problem clusters
- **Algorithm**: K-Means Clustering
- **Features**: Location coordinates, complaint density
- **Output**: Cluster assignments, hotspot areas

### 3. Priority Predictor
- **Purpose**: Predict complaint urgency
- **Algorithm**: Random Forest
- **Features**: Text analysis, historical data
- **Output**: Priority score (1-10)

## 📊 ML API Endpoints

### ML Service (Port 5001)
- `GET /health` - Service health check
- `POST /predict` - Make predictions
- `POST /cluster` - Cluster complaints
- `POST /train` - Train models
- `GET /models/status` - Model status

### Backend Routes (Port 5000)
- `POST /api/ml/predict` - Backend proxy for predictions
- `POST /api/ml/cluster` - Backend proxy for clustering
- `POST /api/ml/train` - Train ML models
- `GET /api/ml/models/status` - Get model status

## 🔍 Troubleshooting

### ML Service Not Running
**Error**: `Connection refused` or `ECONNREFUSED`
**Solution**:
```bash
cd ml-service
python app.py
```

### Python Dependencies Missing
**Error**: `ModuleNotFoundError`
**Solution**:
```bash
cd ml-service
pip install -r requirements.txt
```

### Port Already in Use
**Error**: `Address already in use`
**Solution**:
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9
# Or use different port
export PORT=5002
python app.py
```

### Backend Can't Connect to ML Service
**Error**: `ML service is currently unavailable`
**Solution**:
1. Make sure ML service is running on port 5001
2. Check ML_SERVICE_URL in backend .env
3. Verify no firewall blocking the connection

### Models Not Training
**Error**: `No training data available`
**Solution**:
1. Generate sample data: `python generate_data.py`
2. Check DATA_DIR environment variable
3. Verify data files exist in ml-service/data/

## 📈 Performance Monitoring

### Check Model Status
```bash
curl http://localhost:5001/models/status
```

### Monitor ML Service Logs
```bash
tail -f ml-service/logs/ml_service.log
```

### Test Model Performance
```bash
cd backend
npm run test-ml
```

## 🎯 Success Indicators

✅ **ML Service Running**: http://localhost:5001 responds  
✅ **Models Loaded**: No import errors in ML service  
✅ **Predictions Working**: Test predictions return results  
✅ **Clustering Working**: Clustering returns meaningful groups  
✅ **Backend Integration**: Backend can call ML service  
✅ **Frontend Integration**: UI shows ML predictions  

## 🚀 Advanced Usage

### Train Custom Models
```bash
curl -X POST http://localhost:5001/train \
  -H "Content-Type: application/json" \
  -d '{"model_type": "classifier", "data_source": "database"}'
```

### Batch Predictions
```bash
curl -X POST http://localhost:5000/api/ml/batch-predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"complaint_ids": ["id1", "id2"]}'
```

### Model Performance Metrics
```bash
curl http://localhost:5001/models/metrics
```

---

## 🆘 Still Having Issues?

1. **Run the test script**: `npm run test-ml`
2. **Check all services are running**: Backend (5000) + ML Service (5001)
3. **Verify dependencies**: Python packages installed
4. **Check logs**: Both backend and ML service logs
5. **Test endpoints manually**: Use curl commands above

**Remember**: ML Service must be running separately from the backend!
