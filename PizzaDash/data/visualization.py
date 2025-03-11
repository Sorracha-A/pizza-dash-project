import json
import os
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime

# Get the directory where the current script is located.
script_dir = os.path.dirname(os.path.realpath(__file__))

# Update this path based on your file structure.
# If your JSON files are in a subfolder called "data" within the script directory:
filenames = [os.path.join(script_dir, fname) for fname in 
             ["Participant1.json", "Participant2.json", "Participant3.json", "Participant4.json", "Participant5.json"]]

# If your JSON files are in the same directory as the script, use:
# filenames = [os.path.join(script_dir, fname) for fname in 
#              ["Au.json", "Kaikaew.json", "Prae.json", "Roma.json", "Wipat.json"]]

data_list = []
for fname in filenames:
    with open(fname, 'r') as f:
        data = json.load(f)
        # Derive username from filename (remove .json extension)
        username = os.path.splitext(os.path.basename(fname))[0]
        data['username'] = username
        
        # Calculate average and best steps from the stepsLastSevenDays array
        steps = data.get("stepsLastSevenDays", [])
        if steps:
            data['avgSteps'] = sum(steps) / len(steps)
            data['bestSteps'] = max(steps)
        else:
            data['avgSteps'] = None
            data['bestSteps'] = None
        
        # Parse timestamp into a Python datetime object (assume ISO format)
        data['timestamp'] = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
        
        data_list.append(data)

# Create a DataFrame from the list
df = pd.DataFrame(data_list)
print("Combined DataFrame:")
print(df)

# --- Visualization 1: Average Daily Steps by User ---
fig_avg = px.bar(
    df,
    x="username",
    y="avgSteps",
    title="Average Daily Steps (Last 7 Days) by User",
    labels={"avgSteps": "Average Steps", "username": "User"},
    text="avgSteps"
)
fig_avg.update_traces(texttemplate='%{text:.0f}', textposition='outside')
fig_avg.update_layout(uniformtext_minsize=8, uniformtext_mode='hide')
fig_avg.show()

# --- Visualization 2: Best Day Steps by User ---
fig_best = px.bar(
    df,
    x="username",
    y="bestSteps",
    title="Best Day Steps (Last 7 Days) by User",
    labels={"bestSteps": "Best Steps", "username": "User"},
    text="bestSteps"
)
fig_best.update_traces(texttemplate='%{text:.0f}', textposition='outside')
fig_best.update_layout(uniformtext_minsize=8, uniformtext_mode='hide')
fig_best.show()

# --- Visualization 3: Daily Steps Trend for Each User ---
# Expand the stepsLastSevenDays array into a DataFrame with day labels.
days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
records = []
for _, row in df.iterrows():
    for i, step in enumerate(row['stepsLastSevenDays']):
        records.append({
            "username": row["username"],
            "Day": days[i],
            "Steps": step
        })
df_steps = pd.DataFrame(records)

fig_line = px.line(
    df_steps,
    x="Day",
    y="Steps",
    color="username",
    markers=True,
    title="Daily Steps (Last 7 Days) per User"
)
fig_line.show()

# --- Visualization 4: Scatter Plot of User Level vs. Average Daily Steps ---
fig_scatter = px.scatter(
    df,
    x="level",
    y="avgSteps",
    size="totalStepsToday",
    color="username",
    title="User Level vs Average Daily Steps",
    labels={"level": "User Level", "avgSteps": "Average Steps"},
    hover_data=["experience", "balance"]
)
fig_scatter.show()
