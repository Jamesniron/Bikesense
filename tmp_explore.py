import json

notebook_path = "../Motor-Bike-Price-Prediction-In-Sri-Lanka/used_bikes.ipynb"
output_path = "tmp_notebook_code.py"

try:
    with open(notebook_path, "r", encoding="utf-8") as f:
        nb = json.load(f)
    
    code_cells = []
    for cell in nb.get("cells", []):
        if cell.get("cell_type") == "code":
            source = "".join(cell.get("source", []))
            code_cells.append(source)
            
    with open(output_path, "w", encoding="utf-8") as out:
        out.write("\n\n# ==================== CELL ====================\n\n".join(code_cells))
        
    print(f"Successfully extracted {len(code_cells)} code cells to {output_path}")
except Exception as e:
    print(f"Error parsing notebook: {e}")
