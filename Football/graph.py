import json
import pandas as pd
import matplotlib.pyplot as plt

with open('football_ai_12500_games_1768924207568.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
df = pd.DataFrame(data['gameHistory'])

plt.figure(figsize=(12, 6))
# Сглаживаем для тренда
rolling_ai = df['scoreAI'].rolling(window=200).mean()
rolling_reward = df['reward'].rolling(window=200).mean()

fig, ax1 = plt.subplots(figsize=(12, 6))
ax2 = ax1.twinx()

ax1.plot(df['game'], rolling_ai, color='blue', label='AI Goals (Smooth)')
ax2.plot(df['game'], rolling_reward, color='green', alpha=0.6, label='Reward (Smooth)')

ax1.set_xlabel('Games')
ax1.set_ylabel('Goals', color='blue')
ax2.set_ylabel('Reward', color='green')
plt.title('Football AI: Learning Progress')
plt.grid(True, alpha=0.2)
plt.savefig('visual_football.png')