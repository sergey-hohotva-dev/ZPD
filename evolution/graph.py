import json
import pandas as pd
import matplotlib.pyplot as plt

with open('evolution_data_gen500_1768939460845.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
df = pd.DataFrame(data['history'])

plt.figure(figsize=(12, 6))
plt.plot(df['generation'], df['huntersCount'], label='Hunters', color='red', linewidth=2)
plt.plot(df['generation'], df['runnersCount'], label='Runners', color='green', linewidth=2)

plt.fill_between(df['generation'], df['huntersCount'], alpha=0.1, color='red')
plt.fill_between(df['generation'], df['runnersCount'], alpha=0.1, color='green')

plt.title('Population Dynamics: Hunters vs Runners')
plt.xlabel('Generation')
plt.ylabel('Population Count')
plt.legend()
plt.grid(True, alpha=0.2)
plt.savefig('visual_evolution.png')