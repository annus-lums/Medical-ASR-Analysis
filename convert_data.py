"""
Convert WER prediction CSV files to JSON format for the dashboard.
Usage: python convert_data.py
"""

import pandas as pd
import json
import sys
from pathlib import Path

def convert_csv_to_json(csv_path, output_path='public/data/wer_data.json'):
    """
    Convert WER prediction CSV to JSON format for React dashboard.
    
    Args:
        csv_path: Path to the CSV file
        output_path: Output JSON file path
    """
    try:
        # Read CSV
        print(f"Reading {csv_path}...")
        df = pd.read_csv(csv_path)
        
        # Check required columns
        required_cols = [
            'wer', 'duration_sec', 'word_count', 'char_count', 'avg_word_len',
            'speaking_rate', 'energy', 'zcr', 'spectral_centroid', 
            'silence_ratio', 'snr', 'pred_text', 'gt_text'
        ]
        
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            print(f"⚠️  Warning: Missing columns: {missing_cols}")
            print(f"Available columns: {list(df.columns)}")
        
        # Convert to dictionary format
        data = {}
        for col in df.columns:
            if col in required_cols:
                if df[col].dtype == 'object':  # String columns
                    data[col] = df[col].fillna('').tolist()
                else:  # Numeric columns
                    data[col] = df[col].fillna(0).tolist()
        
        # Create output directory if it doesn't exist
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Write JSON
        print(f"Writing to {output_path}...")
        with open(output_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"✅ Successfully converted {len(df)} rows")
        print(f"📊 Sample stats:")
        print(f"   - Avg WER: {df['wer'].mean():.3f}")
        print(f"   - Median WER: {df['wer'].median():.3f}")
        print(f"   - 90th percentile WER: {df['wer'].quantile(0.9):.3f}")
        print(f"   - High WER rate: {(df['wer'] >= 0.5).mean() * 100:.1f}%")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


def merge_csv_files(train_path, val_path, test_path, output_csv='merged_wer_data.csv'):
    """
    Merge train, val, and test CSV files into one.
    
    Args:
        train_path: Path to train CSV
        val_path: Path to validation CSV
        test_path: Path to test CSV
        output_csv: Output merged CSV path
    """
    try:
        print("Merging CSV files...")
        
        train_df = pd.read_csv(train_path)
        val_df = pd.read_csv(val_path)
        test_df = pd.read_csv(test_path)
        
        train_df['split'] = 'train'
        val_df['split'] = 'val'
        test_df['split'] = 'test'
        
        merged_df = pd.concat([train_df, val_df, test_df], ignore_index=True)
        merged_df.to_csv(output_csv, index=False)
        
        print(f"✅ Merged {len(merged_df)} rows")
        print(f"   - Train: {len(train_df)}")
        print(f"   - Val: {len(val_df)}")
        print(f"   - Test: {len(test_df)}")
        
        return output_csv
        
    except Exception as e:
        print(f"❌ Error merging files: {e}")
        sys.exit(1)


if __name__ == '__main__':
    # Example usage
    print("🔄 WER Data Converter for Dashboard\n")
    
    # Check if files exist
    csv_file = 'wer_prediction_dataset_extended.csv'
    
    if Path(csv_file).exists():
        print(f"Found {csv_file}")
        convert_csv_to_json(csv_file, 'dashboard/public/data/wer_data.json')
    else:
        print(f"⚠️  {csv_file} not found.")
        print("\nOptions:")
        print("1. Place your CSV file in the current directory")
        print("2. Or provide paths to train/val/test splits to merge them first")
        
        # Example for split files
        train_file = 'wer_prediction_train.csv'
        val_file = 'wer_prediction_val.csv'
        test_file = 'wer_prediction_test.csv'
        
        if all(Path(f).exists() for f in [train_file, val_file, test_file]):
            print(f"\n✓ Found split files, merging...")
            merged_file = merge_csv_files(train_file, val_file, test_file)
            convert_csv_to_json(merged_file, 'dashboard/public/data/wer_data.json')
        else:
            print(f"\n❌ No data files found. Please provide:")
            print(f"   - {csv_file}, OR")
            print(f"   - {train_file}, {val_file}, {test_file}")
            sys.exit(1)
    
    print("\n✅ Done! You can now run the dashboard:")
    print("   cd dashboard")
    print("   npm install")
    print("   npm run dev")

