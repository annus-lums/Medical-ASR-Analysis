"""
Convert WER prediction CSV files to JSON format for the dashboard.
Usage: python convert_data.py
"""

import dask.dataframe as dd
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
        # Read CSV with Dask
        print(f"Reading {csv_path}...")
        df = dd.read_csv(csv_path)
        
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
        # Note: For Dask, we need to compute values before converting to list
        data = {}
        for col in df.columns:
            if col in required_cols:
                # Get dtype from a sample (Dask doesn't always have full dtype info)
                sample_dtype = df[col].dtype
                if sample_dtype == 'object':  # String columns
                    data[col] = df[col].fillna('').compute().tolist()
                else:  # Numeric columns
                    data[col] = df[col].fillna(0).compute().tolist()
        
        # Create output directory if it doesn't exist
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Write JSON
        print(f"Writing to {output_path}...")
        with open(output_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        # Compute statistics
        num_rows = len(df.compute())
        wer_mean = df['wer'].mean().compute()
        wer_median = df['wer'].median().compute()
        wer_quantile = df['wer'].quantile(0.9).compute()
        high_wer_rate = (df['wer'] >= 0.5).mean().compute() * 100
        
        print(f"✅ Successfully converted {num_rows} rows")
        print(f"📊 Sample stats:")
        print(f"   - Avg WER: {wer_mean:.3f}")
        print(f"   - Median WER: {wer_median:.3f}")
        print(f"   - 90th percentile WER: {wer_quantile:.3f}")
        print(f"   - High WER rate: {high_wer_rate:.1f}%")
        
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
        
        train_df = dd.read_csv(train_path)
        val_df = dd.read_csv(val_path)
        test_df = dd.read_csv(test_path)
        
        train_df = train_df.assign(split='train')
        val_df = val_df.assign(split='val')
        test_df = test_df.assign(split='test')
        
        merged_df = dd.concat([train_df, val_df, test_df], ignore_index=True)
        merged_df.to_csv(output_csv, index=False, single_file=True)
        
        # Compute row counts for reporting
        train_count = len(train_df.compute())
        val_count = len(val_df.compute())
        test_count = len(test_df.compute())
        merged_count = train_count + val_count + test_count
        
        print(f"✅ Merged {merged_count} rows")
        print(f"   - Train: {train_count}")
        print(f"   - Val: {val_count}")
        print(f"   - Test: {test_count}")
        
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