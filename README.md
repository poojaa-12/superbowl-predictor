# Super Bowl Predictor

ML model to predict the Super Bowl winner (Seahawks vs Patriots) using Logistic Regression with Random Forest feature selection.

## Architecture

```
┌─────────────────────────┐     ┌─────────────────────────┐
│  Lovable Frontend       │────▶│  FastAPI Backend         │
│  (React + Tailwind)     │     │  (Python ML Pipeline)    │
│                         │     │                          │
│  • Team logos & colors  │     │  GET /predict            │
│  • Probability bar      │     │  GET /stats              │
│  • Mascot animations    │     │  GET /features           │
│  • Feature charts       │     │  GET /teams              │
└─────────────────────────┘     └─────────────────────────┘
```

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Train the model

```bash
python -m models.train
```

This will:
- Fetch NFL data (2010-2024 seasons) via `nfl_data_py`
- Engineer 16 team-pair differential features
- Select top features using Random Forest importance
- Train Logistic Regression (L2-regularized) and Random Forest
- Evaluate with time-series cross-validation
- Save models to `models/saved/`

### 3. Predict (CLI)

```bash
python predict.py --team_a SEA --team_b NE --season 2014
```

### 4. Start the API server

```bash
python -m app.main
# or
uvicorn app.main:app --reload --port 8000
```

API docs available at http://localhost:8000/docs

### 5. Connect the Lovable frontend

See `lovable_prompt.md` for the detailed prompt to paste into [Lovable](https://lovable.dev) to generate the React frontend.

## Features

### Anti-Overfitting Measures
- **L2 Regularization** with cross-validated C parameter
- **Time-Series Cross-Validation** (no future data leakage)
- **Random Forest Feature Selection** (reduces 16 → ~10-12 features)
- **Correlation Filtering** (drops features with r > 0.85)
- **Conservative feature count** (~250:1 samples-to-features ratio)
- **Playoff game upweighting** (2x weight for playoff games)

### Feature Categories
- **Offensive**: Points/game, yards/game, point differential
- **Defensive**: Points allowed/game, yards allowed/game
- **Team Strength**: Win %, Pythagorean expectation, strength of schedule
- **Situational**: Home/away, margin of victory

### API Endpoints
| Endpoint | Description |
|----------|-------------|
| `GET /predict?team_a=SEA&team_b=NE&season=2014` | Win probabilities + feature breakdown |
| `GET /stats?team=SEA&season=2014` | Team season stats |
| `GET /features` | Feature importances + model metrics |
| `GET /teams` | Available team abbreviations |

## Project Structure

```
superbowl_predictor/
├── data/
│   └── fetch_data.py        # NFL data fetching + caching
├── features/
│   ├── engineering.py        # Feature engineering pipeline
│   └── selection.py          # RF importance + correlation filtering
├── models/
│   ├── train.py              # Training + evaluation pipeline
│   └── evaluate.py           # Plots (calibration, ROC, features)
├── app/
│   └── main.py               # FastAPI JSON API
├── predict.py                # CLI prediction tool
├── lovable_prompt.md         # Prompt for Lovable frontend
└── requirements.txt
```

## Tech Stack

- **Python 3.12**
- **scikit-learn** — Logistic Regression, Random Forest, cross-validation
- **nfl_data_py** — NFL data source
- **FastAPI** — REST API backend
- **pandas / numpy** — Data processing
- **matplotlib / seaborn** — Evaluation plots
