import json
import os
import numpy    as np
import matplotlib.pyplot as plt

# Get the current directory of the script
current_dir = os.path.dirname(os.path.abspath(__file__))
participant_names = ["Participant1", "Participant2", "Participant3", "Participant4", "Participant5"]

# Load JSON data from files Participant1.json to Participant5.json in the same folder
participants = []
for i in range(1, 6):
    filename = os.path.join(current_dir, f"Participant{i}.json")
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
balances = []  # use balance instead of experience

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
    ax.legend(loc='upper left')

# Hide any extra subplots if total subplots > number of participants
for j in range(len(participants), len(axes)):
    fig.delaxes(axes[j])

plt.suptitle("Daily Steps Comparison: Baseline vs. While Playing", y=0.98, fontsize=16)
plt.tight_layout(rect=[0, 0, 1, 0.95])
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
plt.show()

# ---------------------------------------------
# Visualization 3: Scatter Plot - Improvement vs. Game Level (with Best Fit Line)
# ---------------------------------------------
plt.figure(figsize=(8, 6))
plt.scatter(levels, improvement, c='blue', s=100)
for i, txt in enumerate(ids):
    plt.annotate(txt, (levels[i], improvement[i]), textcoords="offset points", xytext=(5, 5))
# Compute and plot line of best fit
coeffs = np.polyfit(levels, improvement, 1)
poly_eq = np.poly1d(coeffs)
x_line = np.linspace(min(levels), max(levels), 100)
y_line = poly_eq(x_line)
plt.plot(x_line, y_line, color='red', linestyle='--', label='Best Fit Line')
plt.xlabel("Game Level")
plt.ylabel("Average Improvement (Playing - Baseline)")
plt.title("Improvement in Steps vs. Game Level")
plt.legend()
plt.grid(True)
plt.show()

# ---------------------------------------------
# Visualization 4: Scatter Plot - Improvement vs. Balance (with Best Fit Line)
# ---------------------------------------------
plt.figure(figsize=(8, 6))
plt.scatter(balances, improvement, c='green', s=100)
for i, txt in enumerate(ids):
    plt.annotate(txt, (balances[i], improvement[i]), textcoords="offset points", xytext=(5, 5))
# Compute and plot line of best fit
coeffs = np.polyfit(balances, improvement, 1)
poly_eq = np.poly1d(coeffs)
x_line = np.linspace(min(balances), max(balances), 100)
y_line = poly_eq(x_line)
plt.plot(x_line, y_line, color='red', linestyle='--', label='Best Fit Line')
plt.xlabel("Balance")
plt.ylabel("Average Improvement (Playing - Baseline)")
plt.title("Improvement in Steps vs. Balance")
plt.legend()
plt.grid(True)
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
plt.show()
