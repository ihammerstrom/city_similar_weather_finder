import pandas as pd

# Create a DataFrame
data = {'Category': ['A', 'B', 'A', 'B', 'A'],
        'Value': [10, 20, 30, 40, 50]}
df = pd.DataFrame(data)

# Group by the 'Category' column
grouped = df.groupby('Category')

print(grouped)

# Calculate the sum of each group
sums = grouped.sum()

print(sums)
