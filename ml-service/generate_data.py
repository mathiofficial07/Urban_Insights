import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import json

# Seed for reproducibility
np.random.seed(42)
random.seed(42)

# Categories and their typical descriptions
CATEGORIES = {
    'Infrastructure': [
        'Street light not working on main road',
        'Traffic signal malfunction at intersection',
        'Public bench broken in city park',
        'Footpath damaged and needs repair',
        'Street sign missing or damaged',
        'Public toilet facilities out of order',
        'Bus shelter glass broken',
        'Community center roof leaking',
        'Public parking lot markings faded',
        'Playground equipment damaged'
    ],
    'Sanitation': [
        'Garbage not collected for past week',
        'Overflowing dustbin in residential area',
        'Dead animal on roadside needs removal',
        'Drainage blocked causing water logging',
        'Public area not cleaned regularly',
        'Illegal dumping in empty plot',
        'Sewer line overflow in neighborhood',
        'Garbage burning in public area',
        'Lack of dustbins in commercial area',
        'Street cleaning not done properly'
    ],
    'Water Supply': [
        'Water supply interrupted for 3 days',
        'Low water pressure in apartment complex',
        'Contaminated water supply in area',
        'Water pipeline leakage on main road',
        'No water supply during peak hours',
        'Water meter not working properly',
        'Illegal water connection in neighborhood',
        'Water quality issues - muddy water',
        'Frequent water supply disruptions',
        'Water tank cleaning not done'
    ],
    'Electricity': [
        'Power outage lasting more than 6 hours',
        'Electric pole leaning dangerously',
        'Street lights flickering or not working',
        'Low voltage problem in residential area',
        'Electric wires hanging low posing danger',
        'Transformer making unusual noises',
        'Frequent power fluctuations',
        'New electricity connection pending',
        'Meter reading not done for months',
        'Street light pole damaged'
    ],
    'Roads': [
        'Large pothole on main highway',
        'Road completely damaged due to rain',
        'No street lights on newly built road',
        'Road construction debris not cleared',
        'Speed breaker too high causing accidents',
        'Road marking absent on busy intersection',
        'Footpath encroached by street vendors',
        'Road drainage system blocked',
        'Uneven road surface causing accidents',
        'Traffic jam due to road work'
    ],
    'Public Safety': [
        'Stray dogs creating nuisance in area',
        'No security guards in residential complex',
        'Street crime increasing in neighborhood',
        'Fire safety equipment not working',
        'Public place lacks proper lighting',
        'Emergency response time very slow',
        'No CCTV cameras in crime-prone area',
        'Police patrol frequency very low',
        'Illegal liquor shop in residential area',
        'Public nuisance by loud speakers'
    ],
    'Noise Pollution': [
        'Construction noise during late hours',
        'Loud music from nearby function hall',
        'Generator noise affecting residents',
        'Industrial noise during night time',
        'Religious institution using loudspeakers',
        'Traffic noise due to honking',
        'Noise from street vendors',
        'Construction work starting early morning',
        'Noise pollution from nearby factory',
        'Loud parties in residential area'
    ],
    'Other': [
        'Tree branches touching electric wires',
        'Illegal hoarding blocking footpath',
        'Public telephone booth not working',
        'Lack of parking space in commercial area',
        'Public internet WiFi not working',
        'Information center closed during hours',
        'Public library facilities poor',
        'Lack of wheelchair accessibility',
        'Public transport frequency low',
        'Community hall booking issues'
    ]
}

# Priority levels and their distribution
PRIORITIES = {
    'low': 0.3,
    'medium': 0.4,
    'high': 0.25,
    'critical': 0.05
}

# Cities and their coordinates (approximate)
CITIES = [
    {'name': 'New York', 'lat': 40.7128, 'lng': -74.0060},
    {'name': 'Los Angeles', 'lat': 34.0522, 'lng': -118.2437},
    {'name': 'Chicago', 'lat': 41.8781, 'lng': -87.6298},
    {'name': 'Houston', 'lat': 29.7604, 'lng': -95.3698},
    {'name': 'Phoenix', 'lat': 33.4484, 'lng': -112.0740},
    {'name': 'Philadelphia', 'lat': 39.9526, 'lng': -75.1652},
    {'name': 'San Antonio', 'lat': 29.4241, 'lng': -98.4936},
    {'name': 'San Diego', 'lat': 32.7157, 'lng': -117.1611},
    {'name': 'Dallas', 'lat': 32.7767, 'lng': -96.7970},
    {'name': 'San Jose', 'lat': 37.3382, 'lng': -121.8863}
]

def generate_description(base_description, category):
    """Generate a more detailed description"""
    details = [
        "This issue has been persisting for the past few days",
        "Multiple residents have complained about this",
        "This is causing significant inconvenience",
        "Urgent attention is required",
        "This affects daily life of many people",
        "Previous complaints have been ignored",
        "This poses safety risks to citizens",
        "The situation is getting worse day by day",
        "Immediate action needed to resolve this",
        "This has been reported multiple times"
    ]
    
    additional_info = random.choice(details)
    
    # Add some specific details based on category
    category_specific = {
        'Infrastructure': "The infrastructure is deteriorating rapidly",
        'Sanitation': "This is creating unhygienic conditions",
        'Water Supply': "Water scarcity is affecting normal life",
        'Electricity': "Power issues are disrupting daily activities",
        'Roads': "Road conditions are accident-prone",
        'Public Safety': "Safety concerns are increasing",
        'Noise Pollution': "Noise levels are beyond permissible limits",
        'Other': "This requires immediate administrative attention"
    }
    
    return f"{base_description}. {additional_info}. {category_specific.get(category, '')}"

def generate_location(city):
    """Generate a location within city bounds"""
    # Add some random offset to city coordinates (within ~50km radius)
    lat_offset = random.uniform(-0.5, 0.5)
    lng_offset = random.uniform(-0.5, 0.5)
    
    return {
        'address': f"{random.randint(100, 9999)} {random.choice(['Main St', 'Oak Ave', 'Park Rd', 'First St', 'Second Ave'])}, {city['name']}",
        'latitude': round(city['lat'] + lat_offset, 6),
        'longitude': round(city['lng'] + lng_offset, 6)
    }

def generate_priority():
    """Generate priority based on distribution"""
    rand = random.random()
    cumulative = 0
    
    for priority, probability in PRIORITIES.items():
        cumulative += probability
        if rand <= cumulative:
            return priority
    
    return 'medium'

def generate_synthetic_data(num_complaints=2000):
    """Generate synthetic complaint data"""
    
    complaints = []
    
    for i in range(num_complaints):
        # Select category
        category = random.choice(list(CATEGORIES.keys()))
        
        # Select base description
        base_description = random.choice(CATEGORIES[category])
        
        # Generate full description
        description = generate_description(base_description, category)
        
        # Generate title (shorter version)
        title = base_description[:50] + "..." if len(base_description) > 50 else base_description
        
        # Select city and generate location
        city = random.choice(CITIES)
        location = generate_location(city)
        
        # Generate priority
        priority = generate_priority()
        
        # Generate date (within last 6 months)
        days_ago = random.randint(0, 180)
        created_date = datetime.now() - timedelta(days=days_ago)
        
        # Generate status based on age and priority
        if days_ago < 1:
            status = 'pending'
        elif days_ago < 7:
            status = random.choice(['pending', 'in-progress'])
        elif days_ago < 30:
            status = random.choice(['pending', 'in-progress', 'resolved'])
        else:
            status = random.choice(['in-progress', 'resolved', 'rejected'])
        
        # Higher priority complaints more likely to be resolved
        if priority in ['high', 'critical'] and days_ago > 7:
            status = random.choice(['in-progress', 'resolved'])
        
        complaint = {
            'complaintId': f'CMP{str(i+1).zfill(4)}',
            'title': title,
            'description': description,
            'category': category,
            'priority': priority,
            'status': status,
            'location': location,
            'createdAt': created_date.isoformat(),
            'estimatedResolution': (created_date + timedelta(days=random.randint(1, 30))).isoformat() if status != 'resolved' else None,
            'upvotes': random.randint(0, 50),
            'views': random.randint(10, 500),
            'images': random.randint(0, 3)  # Number of images
        }
        
        # Add resolution details if resolved
        if status == 'resolved':
            resolution_date = created_date + timedelta(days=random.randint(1, min(days_ago, 60)))
            complaint['resolvedAt'] = resolution_date.isoformat()
            complaint['resolution'] = {
                'description': f"Issue has been resolved by concerned department. {random.choice(['Proper maintenance done', 'Replacement completed', 'Repair work finished', 'Service restored'])}.",
                'timeToResolve': random.randint(1, 72)  # hours
            }
        
        complaints.append(complaint)
    
    return complaints

def save_to_csv(data, filename='synthetic_complaints.csv'):
    """Save data to CSV file"""
    df = pd.DataFrame(data)
    
    # Flatten location for CSV
    df['address'] = df['location'].apply(lambda x: x['address'])
    df['latitude'] = df['location'].apply(lambda x: x['latitude'])
    df['longitude'] = df['location'].apply(lambda x: x['longitude'])
    df = df.drop('location', axis=1)
    
    # Handle nested objects
    if 'resolution' in df.columns:
        df['resolution_description'] = df['resolution'].apply(lambda x: x.get('description', '') if x else '')
        df['timeToResolve'] = df['resolution'].apply(lambda x: x.get('timeToResolve', '') if x else '')
        df = df.drop('resolution', axis=1)
    
    df.to_csv(filename, index=False)
    print(f"Data saved to {filename}")

def save_to_json(data, filename='synthetic_complaints.json'):
    """Save data to JSON file"""
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Data saved to {filename}")

def generate_training_format(data, filename='training_data.json'):
    """Generate data in training format for ML models"""
    training_data = []
    
    for complaint in data:
        training_item = {
            'text': f"{complaint['title']} {complaint['description']}",
            'category': complaint['category'],
            'priority': complaint['priority'],
            'location': {
                'latitude': complaint['location']['latitude'],
                'longitude': complaint['location']['longitude']
            },
            'actualCategory': complaint['category'],
            'actualPriority': complaint['priority']
        }
        training_data.append(training_item)
    
    with open(filename, 'w') as f:
        json.dump(training_data, f, indent=2)
    print(f"Training data saved to {filename}")

def print_statistics(data):
    """Print statistics about generated data"""
    df = pd.DataFrame(data)
    
    print("\n=== Dataset Statistics ===")
    print(f"Total complaints: {len(data)}")
    print(f"Date range: {df['createdAt'].min()} to {df['createdAt'].max()}")
    
    print("\n=== Category Distribution ===")
    category_counts = df['category'].value_counts()
    for category, count in category_counts.items():
        print(f"{category}: {count} ({count/len(data)*100:.1f}%)")
    
    print("\n=== Priority Distribution ===")
    priority_counts = df['priority'].value_counts()
    for priority, count in priority_counts.items():
        print(f"{priority}: {count} ({count/len(data)*100:.1f}%)")
    
    print("\n=== Status Distribution ===")
    status_counts = df['status'].value_counts()
    for status, count in status_counts.items():
        print(f"{status}: {count} ({count/len(data)*100:.1f}%)")
    
    print("\n=== Location Distribution ===")
    city_counts = df['location'].apply(lambda x: x['address'].split(', ')[-1]).value_counts()
    for city, count in city_counts.head(5).items():
        print(f"{city}: {count} complaints")

if __name__ == "__main__":
    print("Generating synthetic complaint data...")
    
    # Generate 2000 complaints
    complaints = generate_synthetic_data(2000)
    
    # Save in different formats
    save_to_csv(complaints)
    save_to_json(complaints)
    generate_training_format(complaints)
    
    # Print statistics
    print_statistics(complaints)
    
    print(f"\n✅ Successfully generated {len(complaints)} synthetic complaints!")
    print("Files created:")
    print("- synthetic_complaints.csv")
    print("- synthetic_complaints.json") 
    print("- training_data.json")
