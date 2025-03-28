import json
import numpy as np
import matplotlib.pyplot as plt

participant_names = ["Participant1", "Participant2", "Participant3", "Participant4", "Participant5"]

# Load JSON data from files Participant1.json to Participant5.json in the current directory
participants = []
for i in range(1, 6):
    filename = f"Participant{i}.json"
    with open(filename, 'r') as f:
        data = json.load(f)
        # Add an "id" field if not already present
        data["id"] = participant_names[i-1]
        participants.append(data)

# Days of the week (assuming Wednesday to Tuesday)
days = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"]

# Prepare lists for summary statistics
ids = []
avg_baseline = []
avg_playing = []
improvement = []
levels = []
balances = []  # using balance (currency) instead of experience

for p in participants:
    ids.append(p["id"])
    baseline = np.array(p["stepsSevendaysBeforeplaying"])
    playing = np.array(p["stepsLastSevenDaysWhilePlaying"])
    avg_baseline.append(np.mean(baseline))
    avg_playing.append(np.mean(playing))
    improvement.append(np.mean(playing) - np.mean(baseline))
    levels.append(p["level"])
    balances.append(p["balance"])

# ---------------------------------------------
# Visualization 1: Faceted Line Plots (Small Multiples) in a Grid Layout
# ---------------------------------------------
rows, cols = 2, 3  # 2 rows x 3 columns grid
fig, axes = plt.subplots(rows, cols, figsize=(15, 8), sharex=True, sharey=True)
axes = axes.flatten()

for i, p in enumerate(participants):
    ax = axes[i]
    ax.plot(days, p["stepsSevendaysBeforeplaying"], marker='o', linestyle='--', color='gray', label='Baseline')
    ax.plot(days, p["stepsLastSevenDaysWhilePlaying"], marker='o', linestyle='-', color='blue', label='While Playing')
    ax.set_title(p["id"])
    ax.set_ylabel("Steps")
    # Manually set x-ticks and labels
    ax.set_xticks(range(len(days)))
    ax.set_xticklabels(days)
    ax.tick_params(axis='x', labelbottom=True)
    ax.legend(loc='upper left')

# Hide any extra subplots if total subplots > number of participants
for j in range(len(participants), len(axes)):
    fig.delaxes(axes[j])

plt.suptitle("Daily Steps Comparison: Baseline vs. While Playing", y=0.98, fontsize=16)
plt.tight_layout(rect=[0, 0, 1, 0.95])
plt.savefig("daily_steps_comparison.png", dpi=300, bbox_inches="tight")
plt.show()

# ---------------------------------------------
# Visualization 2: Grouped Bar Chart of Average Daily Steps
# ---------------------------------------------
x = np.arange(len(ids))
width = 0.35

plt.figure(figsize=(10, 6))
plt.bar(x - width/2, avg_baseline, width, label='Baseline')
plt.bar(x + width/2, avg_playing, width, label='While Playing')
plt.xticks(x, ids)
plt.xlabel("Participant")
plt.ylabel("Average Daily Steps")
plt.title("Average Daily Steps: Baseline vs. While Playing")
plt.legend()
plt.savefig("avg_daily_steps.png", dpi=300, bbox_inches="tight")
plt.show()

# ---------------------------------------------
# Visualization 3: Scatter Plot - Improvement vs. Game Level (with Best Fit Line)
# ---------------------------------------------
plt.figure(figsize=(8, 6))
plt.scatter(levels, improvement, c='blue', s=100)
for i, txt in enumerate(ids):
    plt.annotate(txt, (levels[i], improvement[i]), textcoords="offset points", xytext=(5, 5))

# Compute line of best fit
coeffs_level = np.polyfit(levels, improvement, 1)
poly_eq_level = np.poly1d(coeffs_level)
x_line_level = np.linspace(min(levels), max(levels), 100)
y_line_level = poly_eq_level(x_line_level)
plt.plot(x_line_level, y_line_level, color='red', linestyle='--', label='Best Fit Line')

# Calculate Pearson's correlation coefficient (R) for Game Level vs. Improvement
r_level = np.corrcoef(levels, improvement)[0, 1]
print(f"Correlation coefficient (R) for game level and step count improvement: {r_level:.2f}")

# Place the correlation coefficient on the plot
plt.text(0.05, 0.95, f"R = {r_level:.2f}", transform=plt.gca().transAxes,
         fontsize=12, verticalalignment='top')

plt.xlabel("Game Level")
plt.ylabel("Average Improvement (Playing - Baseline)")
plt.title("Improvement in Steps vs. Game Level")
plt.legend()
plt.grid(True)
plt.savefig("improvement_vs_level.png", dpi=300, bbox_inches="tight")
plt.show()

# ---------------------------------------------
# Visualization 4: Scatter Plot - Improvement vs. Balance (with Best Fit Line)
# ---------------------------------------------
plt.figure(figsize=(8, 6))
plt.scatter(balances, improvement, c='green', s=100)
for i, txt in enumerate(ids):
    plt.annotate(txt, (balances[i], improvement[i]), textcoords="offset points", xytext=(5, 5))

# Compute line of best fit
coeffs_balance = np.polyfit(balances, improvement, 1)
poly_eq_balance = np.poly1d(coeffs_balance)
x_line_balance = np.linspace(min(balances), max(balances), 100)
y_line_balance = poly_eq_balance(x_line_balance)
plt.plot(x_line_balance, y_line_balance, color='red', linestyle='--', label='Best Fit Line')

# Calculate Pearson's correlation coefficient (R) for Balance vs. Improvement
r_balance = np.corrcoef(balances, improvement)[0, 1]
print(f"Correlation coefficient (R) for currency (balance) and step count improvement: {r_balance:.2f}")

# Place the correlation coefficient on the plot
plt.text(0.05, 0.95, f"R = {r_balance:.2f}", transform=plt.gca().transAxes,
         fontsize=12, verticalalignment='top')

plt.xlabel("Balance")
plt.ylabel("Average Improvement (Playing - Baseline)")
plt.title("Improvement in Steps vs. Balance")
plt.legend()
plt.grid(True)
plt.savefig("improvement_vs_balance.png", dpi=300, bbox_inches="tight")
plt.show()

# ---------------------------------------------
# Visualization 5: Boxplot of Daily Steps for All Participants
# ---------------------------------------------
baseline_all = []
playing_all = []

for p in participants:
    baseline_all.extend(p["stepsSevendaysBeforeplaying"])
    playing_all.extend(p["stepsLastSevenDaysWhilePlaying"])

plt.figure(figsize=(10, 6))
data_to_plot = [baseline_all, playing_all]
plt.boxplot(data_to_plot, labels=["Baseline", "While Playing"])
plt.ylabel("Steps")
plt.title("Distribution of Daily Steps: Baseline vs. While Playing")
plt.savefig("daily_steps_boxplot.png", dpi=300, bbox_inches="tight")
plt.show()
