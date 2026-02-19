
import random
import math
import requests
from datetime import datetime
from typing import List, Dict, Tuple, Optional
import models
import schemas

# --- Constants ---
import os
AGMARKNET_API_KEY = os.getenv("AGMARKNET_API_KEY", "579b464db66ec23bdd0000018357d1bca9c94d8d65c04a5e7c603f61")
AGMARKNET_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"  # Resource ID for "Current Daily Price of Various Commodities..."

# User provided 2025-26 estimates: ₹0.30 - ₹0.50 for medium loads.
# We choose ₹0.50 as a safe default for medium trucks.
TRANSPORT_COST_PER_KM_PER_QUINTAL = 0.50 

# Average loading/unloading charges (₹500 - ₹2000 per trip), simplified to fixed avg
LOADING_UNLOADING_COST = 1000.0 

# Default User Location (Ludhiana, Punjab - Major wheat belt hub)
DEFAULT_USER_LAT = 30.9010
DEFAULT_USER_LON = 75.8573

# --- Coordinate Mapping (District -> (Lat, Lon)) ---
# Populating with major districts in Punjab, Haryana, UP, MP for Wheat
DISTRICT_COORDINATES: Dict[str, Tuple[float, float]] = {
    # Punjab
    "Ludhiana": (30.9010, 75.8573),
    "Patiala": (30.3398, 76.3869),
    "Jalandhar": (31.3260, 75.5762),
    "Amritsar": (31.6340, 74.8723),
    "Bathinda": (30.2110, 74.9455),
    "Ferozepur": (30.9237, 74.6100),
    "Sangrur": (30.2458, 75.8421),
    "Moga": (30.8230, 75.1748),
    "Gurdaspur": (32.0419, 75.4053),
    "Hoshiarpur": (31.5143, 75.9115),
    "Fatehgarh Sahib": (30.6425, 76.3986),
    "Faridkot": (30.6769, 74.7583),
    "Muktsar": (30.4745, 74.5244),
    "Mansa": (29.9880, 75.3816),
    "Rupnagar": (30.9664, 76.5331),
    "SAS Nagar": (30.7046, 76.7179), # Mohali
    "Tarn Taran": (31.4514, 74.9254),
    "Barnala": (30.3819, 75.5468),
    "Kapurthala": (31.3802, 75.3822),
    "Fazilka": (30.4030, 74.0245),
    "Pathankot": (32.2643, 75.6990),
    
    # Haryana
    "Ambala": (30.3782, 76.7767),
    "Karnal": (29.6857, 76.9905),
    "Kurukshetra": (29.9695, 76.8783),
    "Panipat": (29.3909, 76.9635),
    "Sonipat": (28.9931, 77.0151),
    "Rohtak": (28.8955, 76.6066),
    "Hisar": (29.1492, 75.7217),
    "Sirsa": (29.5352, 75.0255),
    "Jind": (29.3198, 76.3102),
    "Kaithal": (29.8015, 76.3996),
    "Fatehabad": (29.5135, 75.4578),
    "Bhiwani": (28.7830, 76.1319),
    "Yamunanagar": (30.1290, 77.2674),
    "Panchkula": (30.6942, 76.8606),
    "Gurugram": (28.4595, 77.0266),
    "Faridabad": (28.4089, 77.3178),
    "Rewari": (28.2460, 76.6171),
    "Mahendragarh": (28.2693, 76.1517),
    "Jhajjar": (28.6080, 76.6565),
    "Palwal": (28.1487, 77.3320),
    "Nuh": (28.1065, 77.0099),

    # Uttar Pradesh (Major Western UP districts)
    "Saharanpur": (29.9640, 77.5448),
    "Muzaffarnagar": (29.4727, 77.7085),
    "Meerut": (28.9845, 77.7064),
    "Bulandshahr": (28.4069, 77.8498),
    "Aligarh": (27.8974, 78.0880),
    "Mathura": (27.4924, 77.6737),
    "Agra": (27.1767, 78.0081),
    "Bareilly": (28.3670, 79.4304),
    "Moradabad": (28.8386, 78.7733),
    "Lucknow": (26.8467, 80.9462),
    "Kanpur": (26.4499, 80.3319),
    "Ghaziabad": (28.6692, 77.4538),
    "Gautam Buddha Nagar": (28.3510, 77.5530), # Noida
    "Hapur": (28.7297, 77.7766),
    "Bijnor": (29.3737, 78.1351),
    "Shamli": (29.4475, 77.3106),
    "Baghpat": (28.9667, 77.2917),

    # Madhya Pradesh
    "Bhopal": (23.2599, 77.4126),
    "Indore": (22.7196, 75.8577),
    "Ujjain": (23.1765, 75.7885),
    "Sehore": (23.2030, 77.0844),
    "Vidisha": (23.5251, 77.8081),
    
    # Rajasthan
    "Jaipur": (26.9124, 75.7873),
    "Alwar": (27.5530, 76.6346),
    "Ganganagar": (29.9038, 73.8772),
    "Hanumangarh": (29.5800, 74.3129),
}

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    """
    try:
        # Convert decimal degrees to radians 
        lat1, lon1, lat2, lon2 = map(math.radians, [float(lat1), float(lon1), float(lat2), float(lon2)])

        # Haversine formula 
        dlon = lon2 - lon1 
        dlat = lat2 - lat1 
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a)) 
        r = 6371 # Radius of earth in kilometers. Use 3956 for miles
        return c * r
    except Exception as e:
        print(f"Error calculating distance: {e}")
        return 9999.0

def fetch_agmarknet_data(commodity: str = "Wheat") -> List[Dict]:
    """
    Fetches real-time data from Agmarknet API using data.gov.in
    """
    try:
        url = f"https://api.data.gov.in/resource/{AGMARKNET_RESOURCE_ID}"
        params = {
            "api-key": AGMARKNET_API_KEY,
            "format": "json",
            "filters[commodity]": commodity,
            "limit": 200  # Getting more records to find nearby ones
        }
        # print(f"Fetching data from {url}...")
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Validating response structure
        if "records" in data:
            return data["records"]
        return []
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching API data: {e}")
        return []

def get_coordinates(district: str) -> Optional[Tuple[float, float]]:
    # Simple capitalization normalization and sanitization
    if not district:
        return None
    dist_norm = district.strip().title()
    
    # Try direct match
    if dist_norm in DISTRICT_COORDINATES:
        return DISTRICT_COORDINATES[dist_norm]
    
    # Try fuzzy match or known aliases if needed in future
    # For now, return None
    return None

def get_mandi_prices(crop: str = "Wheat", user_lat: float = DEFAULT_USER_LAT, user_lon: float = DEFAULT_USER_LON) -> List[schemas.MandiPrice]:
    """
    Fetches real-time Agmarknet prices and calculates distance from user.
    """
    records = fetch_agmarknet_data(crop)
    prices = []
    
    # If API fails or returns empty, assume service down or no data for today
    if not records:
        print("Warning: No data returned from Agmarknet API. Using Mock Fallback for demonstration.")
        return _get_mock_prices_fallback(user_lat, user_lon)

    for r in records:
        # API fields: state, district, market, commodity, variety, grade, arrival_date, min_price, max_price, modal_price
        
        state = r.get("state", "Unknown")
        district = r.get("district", "Unknown")
        market = r.get("market", "Unknown")
        commodity_name = r.get("commodity", crop)
        
        # Coords
        coords = get_coordinates(district)
        
        if coords:
            lat, lon = coords
            distance = haversine_distance(user_lat, user_lon, lat, lon)
        else:
            # If we can't find coordinates, we punish this entry with a high distance
            # so it's less likely to be recommended unless price is massive.
            distance = 500.0 # KM
        
        try:
            min_p = float(r.get("min_price", 0))
            max_p = float(r.get("max_price", 0))
            modal_p = float(r.get("modal_price", 0))
        except (ValueError, TypeError):
            continue # Skip invalid price records

        prices.append(schemas.MandiPrice(
            state=state,
            district=district,
            market=market,
            commodity=commodity_name,
            variety=r.get("variety", "FAQ"),
            grade=r.get("grade", "FAQ"),
            min_price=min_p,
            max_price=max_p,
            modal_price=modal_p,
            arrival_date=r.get("arrival_date", datetime.now().strftime("%d/%m/%Y")),
            distance_km=round(distance, 1)
        ))
        
    # Sort by distance initially, then by price (descending) for same distance
    # Actually, let's sort by distance primarily for the "Nearby" view
    prices.sort(key=lambda x: x.distance_km)
    
    return prices

def _get_mock_prices_fallback(user_lat, user_lon) -> List[schemas.MandiPrice]:
    """Fallback mock data generator if API fails"""
    mock_data = [
        {"state": "Punjab", "district": "Ludhiana", "market": "Ludhiana Mandi", "lat": 30.9010, "lon": 75.8573},
        {"state": "Punjab", "district": "Patiala", "market": "Patiala Mandi", "lat": 30.3398, "lon": 76.3869},
        {"state": "Haryana", "district": "Ambala", "market": "Ambala City", "lat": 30.3782, "lon": 76.7767},
        {"state": "Haryana", "district": "Hisar", "market": "Hisar Mandi", "lat": 29.1492, "lon": 75.7217},
        {"state": "Punjab", "district": "Jalandhar", "market": "Jalandhar City", "lat": 31.3260, "lon": 75.5762},
    ]
    prices = []
    base_price = 2275.0
    for m in mock_data:
        dist = haversine_distance(user_lat, user_lon, m["lat"], m["lon"])
        variance = random.uniform(-50, 150)
        modal = base_price + variance
        prices.append(schemas.MandiPrice(
            state=m["state"],
            district=m["district"],
            market=m["market"],
            commodity="Wheat",
            variety="Desi",
            grade="FAQ",
            min_price=round(modal - 20, 2),
            max_price=round(modal + 20, 2),
            modal_price=round(modal, 2),
            arrival_date=datetime.now().strftime("%d/%m/%Y"),
            distance_km=round(dist, 1)
        ))
    prices.sort(key=lambda x: x.distance_km)
    return prices

def calculate_strategy(prediction: models.Prediction, user_lat: float = DEFAULT_USER_LAT, user_lon: float = DEFAULT_USER_LON) -> schemas.MarketStrategy:
    """
    Net Profit = (Yield * Price) - (Distance * Rate * Yield) - Production Cost
    """
    yield_quintals = prediction.total_production_quintals
    
    # Get prices relative to user location
    prices = get_mandi_prices(user_lat=user_lat, user_lon=user_lon)
    
    best_market = None
    max_net_revenue = -float('inf')
    
    # Filter out markets that are too far (e.g., > 300km) unless explicit check
    valid_prices = [p for p in prices if p.distance_km < 300]
    
    if not valid_prices:
        # If no valid prices nearby, take the closest one
        if prices:
            valid_prices = [prices[0]]
    
    for p in valid_prices:
        # 1. Gross Revenue from selling
        gross_revenue = yield_quintals * p.modal_price
        
        # 2. Transportation Cost
        # Rate: ₹0.50 per quintal per km (Medium Truck 2025-26 Estimate)
        # Plus Fixed Loading/Unloading: ₹1000
        variable_transport = p.distance_km * TRANSPORT_COST_PER_KM_PER_QUINTAL * yield_quintals
        transport_cost = variable_transport + LOADING_UNLOADING_COST
        
        net_revenue = gross_revenue - transport_cost
        
        if net_revenue > max_net_revenue:
            max_net_revenue = net_revenue
            best_market = p
            
    if best_market:
        total_cost = prediction.fertilizer_cost_inr or 0.0
        # If cost is None, treat as 0
        
        # Net Profit = Net Revenue - Input Cost
        net_profit = max_net_revenue - total_cost
        
        transport_detail = (best_market.distance_km * TRANSPORT_COST_PER_KM_PER_QUINTAL * yield_quintals) + LOADING_UNLOADING_COST

        rec_text = (
            f"Recommended: **{best_market.market}** in {best_market.district} "
            f"({best_market.distance_km} km away). "
            f"Selling here yields highest net return of **₹{round(net_profit, 2)}** "
            f"(Price: ₹{best_market.modal_price}/q, Transport: ₹{round(transport_detail, 2)} incl. loading)."
        )
    else:
        rec_text = "No suitable markets found within range."
        net_profit = 0.0
        max_net_revenue = 0.0
        
    return schemas.MarketStrategy(
        recommended_market=best_market.market if best_market else "None",
        recommended_price=best_market.modal_price if best_market else 0.0,
        total_revenue=round(max_net_revenue, 2),
        transport_cost=round(best_market.distance_km * TRANSPORT_COST_PER_KM_PER_QUINTAL * yield_quintals, 2) if best_market else 0.0,
        net_profit=round(net_profit, 2),
        recommendation_text=rec_text,
        alternative_markets=prices[:15] # Return top 15 relevant markets
    )
