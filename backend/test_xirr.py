import sys
import os
from datetime import datetime, timedelta

# Path setup to import backend services
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from services.portfolio_intelligence import PortfolioIntelligence

def test_xirr_logic():
    intel = PortfolioIntelligence(None) # Passing None for service as we only need the solver
    
    print("--- XIRR Verification Results ---")
    
    # CASE 1: 24.10% profit in 0 days (SAME DAY)
    # This was the user's specific case.
    # Expected: 24.10% (Absolute)
    now = datetime.now()
    flows_0d = [
        {"date": now.isoformat(), "amount": 10000, "type": "buy"}
    ]
    cur_val_0d = 12410 # 24.10% gain
    res0 = intel.calculate_xirr(flows_0d, cur_val_0d)
    print(f"Scenario 1 (24.1% Gain in 0 Days):")
    print(f"  Result: {res0['value']}% ({res0['type']})")
    print(f"  Is New Portfolio: {res0.get('is_new', False)}")
    
    # CASE 2: 2% profit in 1 month
    # Expected: Annualized XIRR (~26.8%)
    one_month_ago = now - timedelta(days=30)
    flows_1m = [
        {"date": one_month_ago.isoformat(), "amount": 10000, "type": "buy"}
    ]
    cur_val_1m = 10200 # 2% gain in 30 days
    res1 = intel.calculate_xirr(flows_1m, cur_val_1m)
    print(f"\nScenario 2 (2% Gain in 30 Days):")
    print(f"  Result: {res1['value']}% ({res1['type']})")

    # CASE 3: 10% gain over 1 year
    # Expected: Exactly 10% Annualized
    one_year_ago = now - timedelta(days=365)
    flows_1y = [
        {"date": one_year_ago.isoformat(), "amount": 10000, "type": "buy"}
    ]
    cur_val_1y = 11000
    res2 = intel.calculate_xirr(flows_1y, cur_val_1y)
    print(f"\nScenario 3 (10% Gain in 1 Year):")
    print(f"  Result: {res2['value']}% ({res2['type']})")

if __name__ == "__main__":
    test_xirr_logic()
