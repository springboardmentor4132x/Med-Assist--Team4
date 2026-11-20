# Datasets (Milestone 1)

Download these manually and place the CSV files in this folder (they are git-ignored):

1. **Disease Symptoms and Patient Profile Dataset** (Kaggle) - primary dataset
2. **Disease Prediction Using Symptoms Dataset** (Kaggle)
3. **CDC BRFSS** - from the CDC BRFSS website (annual survey data)
4. MIMIC-IV - optional, needs credentialed access (skip for now)

Search the exact names above on kaggle.com / cdc.gov. Kaggle needs a free account.

Quick load check (run later, in `backend/` with the venv active; needs `pip install pandas`):

```python
import pandas as pd
df = pd.read_csv("../datasets/<your-file>.csv")
print(df.shape); print(df.head()); print(df.isna().sum())
```
