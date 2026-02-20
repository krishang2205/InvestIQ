import yfinance as yf
import json

def debug_news():
    print("Fetching News for RELIANCE.NS...")
    try:
        nifty = yf.Ticker("RELIANCE.NS")
        news = nifty.news
        
        if news:
            raw_item = news[0]
            content = raw_item.get('content', {})
            print(f"Content Keys: {content.keys()}")
            print(f"Title: {content.get('title')}")
            print(f"Link: {content.get('clickThroughUrl')}")
            print(f"Provider: {content.get('provider')}")
            print(f"PubDate: {content.get('pubDate')}")
        else:
            print("No news found.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_news()
