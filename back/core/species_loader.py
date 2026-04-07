import json
import os
from typing import Dict, Any

SPECIES_CATALOG: Dict[str, Any] = {}

def load_species_catalog():
    global SPECIES_CATALOG
    file_path = os.path.join(os.path.dirname(__file__), "species.json")
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            SPECIES_CATALOG = json.load(f)
    return SPECIES_CATALOG

# Cargar automáticamente al importar
load_species_catalog()
