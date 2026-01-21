import json
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec

# --- 1. Подготовка данных ---
# Football
with open('football_ai_12500_games_1768924207568.json', 'r', encoding='utf-8') as f:
    fb_df = pd.DataFrame(json.load(f)['gameHistory'])

# Hunger Games (Hybrid)
hg_df = pd.read_csv('hunger_metrics_gen655.csv')

# Evolution (Genetic)
with open('evolution_data_gen500_1768939460845.json', 'r', encoding='utf-8') as f:
    evo_df = pd.DataFrame(json.load(f)['history'])

# --- 2. Визуализация ---
fig = plt.figure(figsize=(18, 14))
gs = gridspec.GridSpec(3, 2, figure=fig)

# --- РАЗДЕЛ 1: FOOTBALL (DEEP Q-LEARNING) ---
ax1 = fig.add_subplot(gs[0, 0])
ax1.plot(fb_df['game'], fb_df['avgLoss'].rolling(100).mean(), color='#e74c3c')
ax1.set_title('1. Football DQL: Training Loss (Convergence)', fontsize=12, fontweight='bold')
ax1.set_ylabel('Loss Value')

ax2 = fig.add_subplot(gs[0, 1])
ax2.plot(fb_df['game'], fb_df['reward'].rolling(100).mean(), color='#2ecc71', label='Reward')
ax2_twin = ax2.twinx()
ax2_twin.plot(fb_df['game'], fb_df['deadNeurons'], color='#7f8c8d', alpha=0.3, label='Dead Neurons')
ax2.set_title('1. Football DQL: Reward vs Network Health', fontsize=12, fontweight='bold')
ax2.legend(loc='upper left')
ax2_twin.legend(loc='upper right')

# --- РАЗДЕЛ 2: HUNGER GAMES (HYBRID ALGORITHM) ---
ax3 = fig.add_subplot(gs[1, 0])
ax3.plot(hg_df.index, hg_df['AvgMaxQ'], color='#3498db')
ax3.set_title('2. Hunger Hybrid: Decision Confidence (AvgMaxQ)', fontsize=12, fontweight='bold')
ax3.set_ylabel('Q-Value Strength')

ax4 = fig.add_subplot(gs[1, 1])
ax4.fill_between(hg_df.index, hg_df['AvgHealth'], color='#27ae60', alpha=0.3, label='Health')
ax4.plot(hg_df.index, hg_df['AvgHunger'], color='#f39c12', label='Hunger')
ax4.set_title('2. Hunger Hybrid: Vitals & Survival State', fontsize=12, fontweight='bold')
ax4.legend()

# --- РАЗДЕЛ 3: EVOLUTION (GENETIC ALGORITHM) ---
ax5 = fig.add_subplot(gs[2, :])
ax5.stackplot(evo_df['generation'], evo_df['huntersCount'], evo_df['runnersCount'], 
              labels=['Hunters (Genetic)', 'Runners (Genetic)'], colors=['#c0392b', '#27ae60'], alpha=0.6)
ax5_twin = ax5.twinx()
ax5_twin.plot(evo_df['generation'], evo_df['collisions'], color='black', linestyle=':', alpha=0.5, label='Collisions')
ax5.set_title('3. Evolution: Population Equilibrium & Environmental Pressure', fontsize=12, fontweight='bold')
ax5.set_xlabel('Timeline (Games / Generations / Steps)')
ax5.legend(loc='upper left')

plt.tight_layout(rect=[0, 0.03, 1, 0.95])
plt.suptitle('Full System Analysis: DQL vs Hybrid vs Genetic Approaches', fontsize=16, fontweight='bold')
plt.savefig('full_system_report.png', dpi=300)
print("Full report saved as 'full_system_report.png'")