from decimal import Decimal

def make_json_safe(obj):
    if isinstance(obj, list):
        return [make_json_safe(item) for item in obj]

    if isinstance(obj, dict):
        return {k: make_json_safe(v) for k, v in obj.items()}

    if isinstance(obj, Decimal):
        return float(obj)

    return obj