import sys
try:
    import dotenv
    print("dotenv version:", dotenv.__version__ if hasattr(dotenv, "__version__") else "unknown")
    print("dotenv location:", dotenv.__file__)
except ImportError as e:
    print("ImportError:", e)

print("\nsys.path:")
for path in sys.path:
    print(path)
