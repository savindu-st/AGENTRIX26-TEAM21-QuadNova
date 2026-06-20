import os

# Priority Layers
LAYER_1_OFFICIAL = "official"
LAYER_2_CIRCULAR = "circular"
LAYER_3_COMMUNITY = "community"

# Source Priority Ranking (lower index = higher priority)
PRIORITY_ORDER = [LAYER_1_OFFICIAL, LAYER_2_CIRCULAR, LAYER_3_COMMUNITY]

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAG_DATA_DIR = os.path.join(BASE_DIR, "rag", "data")
EMBEDDINGS_CACHE_FILE = os.path.join(RAG_DATA_DIR, "embeddings_cache.json")

# Verification Status
STATUS_PENDING = "Pending"
STATUS_VERIFIED = "Verified"
STATUS_REJECTED = "Rejected"

