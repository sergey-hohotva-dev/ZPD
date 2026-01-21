import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv('hunger_metrics_gen655.csv')

plt.figure(figsize=(10, 6))
plt.scatter(df['AvgHunger'], df['AvgHealth'], c=df['Alive'], cmap='viridis', alpha=0.5)
plt.colorbar(label='Alive Agents')
plt.title('Hunger vs Health: The Death Zone')
plt.xlabel('Average Hunger (Negative = Starving)')
plt.ylabel('Average Health')
plt.grid(True, alpha=0.3)
plt.savefig('visual_hunger_crisis.png')