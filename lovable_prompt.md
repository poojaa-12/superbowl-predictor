# Lovable Prompt — Super Bowl Predictor Frontend

> Paste everything below the line into Lovable to generate the frontend.

---

Build a Super Bowl prediction web app that shows the matchup between the Seattle Seahawks and New England Patriots. The app fetches predictions from a backend API and displays them with rich team-branded visuals and animations.

## Page Layout

Single-page app with a dark background (#0a0a1a). The page has these sections from top to bottom:

### 1. Header / Hero Section
- Title: "SUPER BOWL PREDICTOR" in bold, uppercase, white text with a subtle gold (#FFD700) glow
- Subtitle: "Powered by Machine Learning" in smaller gray text
- Below the title, show the two team logos side by side:
  - LEFT: Seattle Seahawks logo (use this URL: https://a.espncdn.com/i/teamlogos/nfl/500/sea.png) with a navy/green (#002244 / #69BE28) gradient glow behind it
  - CENTER: A large glowing "VS" badge
  - RIGHT: New England Patriots logo (use this URL: https://a.espncdn.com/i/teamlogos/nfl/500/ne.png) with a navy/red (#002244 / #C60C30) gradient glow behind it
- Both logos should be ~120px and have a subtle floating animation (slow up/down bob)

### 2. Predict Button
- A large centered button: "PREDICT THE WINNER"
- Styled with a gold-to-orange gradient, rounded, with a pulse animation when idle
- On click, it fetches from the API and triggers all the animations below

### 3. Probability Bar (appears after prediction)
- A horizontal "tug-of-war" bar, full width, ~60px tall
- LEFT side fills with Seahawks green (#69BE28), RIGHT side fills with Patriots red (#C60C30)
- Animated: starts at 50/50 and smoothly transitions to the actual predicted split (e.g., 42% / 58%)
- Above the bar, show each team's name and win probability as large text: "Seahawks 42.3%" on the left, "Patriots 57.7%" on the right
- Add a small centered triangle marker on the bar showing the split point

### 4. Mascot Celebration (appears after prediction)
- Below the probability bar, show two mascot/team-themed areas
- The PREDICTED WINNER side: show a celebratory animated effect (confetti particles, a trophy icon, or a "WINNER" badge with a bounce animation)
- The predicted loser side: subdued/grayed out with a slight opacity reduction
- Use team colors for the celebration effects

### 5. Feature Breakdown Chart (appears after prediction)
- Title: "What The Model Sees"
- A horizontal diverging bar chart (use Recharts library)
- Each bar represents a feature: bars extending LEFT (in red) favor Patriots, bars extending RIGHT (in green) favor Seahawks
- Features to display (from the API response): Points Per Game, Points Allowed, Point Differential, Win %, Pythagorean Wins, Strength of Schedule, Average Margin
- Each bar should have a label and the numeric value
- The chart should animate in, bars growing from center outward

### 6. Model Comparison Section
- Title: "Model Comparison"
- A pill/toggle switch: "Logistic Regression" | "Random Forest"
- Default to Logistic Regression
- When toggled, re-fetch the prediction from the API with the different model parameter
- Show a small metrics table below:
  - Columns: Model, Accuracy, Log Loss, ROC AUC
  - Rows: One per model
  - Highlight the active model row

### 7. Confidence Meter
- A circular arc/gauge that shows model confidence
- 50% = dead center (uncertain), 100% = fully confident
- Use the winning team's color for the arc fill
- Label: "Model Confidence: XX%"

## API Integration

The backend runs at `http://localhost:8000`. Make the base URL configurable via an environment variable or a settings panel.

API calls:
- `GET /predict?team_a=SEA&team_b=NE&season=2014&model=logistic_regression`
  - Returns: `{ team_a: { abbr, name, win_prob }, team_b: { abbr, name, win_prob }, confidence_interval: [lo, hi], feature_contributions: [{ feature, value, favors }] }`
- `GET /features`
  - Returns: `{ selected_features, all_importances: [{ feature, importance, selected }], model_comparison: [{ model_name, accuracy, accuracy_std, log_loss, log_loss_std, roc_auc, roc_auc_std }] }`
- `GET /stats?team=SEA&season=2014`
  - Returns team stats object

## Design Details

- Font: Use Inter or a similar clean sans-serif
- All sections should have smooth fade-in / slide-up animations when they appear
- Cards and sections should have subtle glassmorphism (semi-transparent backgrounds with backdrop blur)
- Responsive: works on desktop (1200px+) and mobile (375px+)
- Add a subtle animated background effect (like slowly moving gradient orbs or particles)
- Use Framer Motion for animations
- Use Recharts for the feature breakdown chart
- Add loading skeletons while waiting for API responses

## Color Palette

- Background: #0a0a1a (near black)
- Card backgrounds: rgba(255, 255, 255, 0.05) with backdrop-blur
- Seahawks primary: #69BE28 (Action Green)
- Seahawks secondary: #002244 (College Navy)
- Patriots primary: #C60C30 (Red)
- Patriots secondary: #002244 (Nautical Blue)
- Patriots accent: #B0B7BC (Silver)
- Gold accent: #FFD700 (for title, button)
- Text: white and gray-400
