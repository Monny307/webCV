#!/usr/bin/env python
"""
Clean jobs.csv - Remove duplicates and empty rows

Usage:
    python clean_jobs_csv.py
"""

import pandas as pd

print("🧹 Cleaning jobs.csv...\n")

# Read CSV
df = pd.read_csv('jobs.csv')
print(f"📊 Original: {len(df)} jobs")

# Remove duplicates (same Job Title + Company Name)
original_count = len(df)
df = df.drop_duplicates(subset=['Job Title', 'Company Name'], keep='first')
dup_removed = original_count - len(df)
print(f"🗑️  Removed {dup_removed} duplicates")

# Remove rows with empty Job Title or Company Name (if any)
df = df[df['Job Title'].notna()]
df = df[df['Job Title'].str.strip() != '']
df = df[df['Company Name'].notna()]
df = df[df['Company Name'].str.strip() != '']

print(f"✅ Final: {len(df)} jobs")

# Save cleaned CSV
df.to_csv('jobs_cleaned.csv', index=False)

print(f"\n✅ Saved to: jobs_cleaned.csv")
print(f"\nNext step:")
print(f"  python import_jobs_from_csv.py jobs_cleaned.csv")
