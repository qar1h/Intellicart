import torch
import torch.nn as nn
import os
from typing import List

class ProductEmbeddingModel(nn.Module):
    def __init__(self, input_dim, embedding_dim=32):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.Linear(64, embedding_dim)
        )

    def forward(self, x):
        return self.encoder(x)

# -------------------------------
# Load model once at module level
# -------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pth")

_embeddings        = None
_product_id_to_idx = None
_idx_to_product    = None

def _load_model():
    global _embeddings, _product_id_to_idx, _idx_to_product

    if _embeddings is not None:
        return

    if not os.path.exists(MODEL_PATH):
        print(f"[Inference] Model not found at {MODEL_PATH}")
        return

    checkpoint = torch.load(MODEL_PATH, map_location=torch.device("cpu"), weights_only=False)
    _embeddings        = checkpoint["embeddings"]
    _product_id_to_idx = checkpoint["product_id_to_idx"]
    _idx_to_product    = checkpoint["idx_to_product"]
    print("[Inference] Model loaded successfully.")

def get_recommendations(purchased_product_ids: List[int], top_n: int = 3) -> List[dict]:
    try:
        _load_model()

        if _embeddings is None:
            return []

        if not purchased_product_ids:
            return []

        purchased_indices = [
            _product_id_to_idx[pid]
            for pid in purchased_product_ids
            if pid in _product_id_to_idx
        ]

        if not purchased_indices:
            return []

        # Average embeddings → user taste vector
        purchased_embeddings = _embeddings[purchased_indices]
        user_vector          = purchased_embeddings.mean(dim=0, keepdim=True)

        # Cosine similarity with all products
        cos_sims = nn.functional.cosine_similarity(user_vector, _embeddings)

        # Exclude already purchased
        for idx in purchased_indices:
            cos_sims[idx] = -1.0

        # Get top N
        top_indices = cos_sims.argsort(descending=True)[:top_n].tolist()

        recommendations = []
        for idx in top_indices:
            product = _idx_to_product[idx]
            recommendations.append({
                "product_id": product["product_id"],
                "name":       product["name"],
                "category":   product["category"],
                "price":      product["price"],
                "similarity": round(cos_sims[idx].item(), 4),
            })

        return recommendations

    except Exception as e:
        print(f"[Inference] Error: {e}")
        return []