"""
Medical Term Error Analysis for ASR System
==========================================

This script analyzes medical terminology errors in ASR transcriptions.
It identifies:
1. Most frequently confused medical terms
2. Term-level error patterns
3. Context-dependent errors

Requirements:
- pip install pandas jiwer medspacy scispacy
- python -m spacy download en_core_sci_md
"""

import pandas as pd
import numpy as np
from jiwer import wer
from collections import Counter, defaultdict
import re
import json

# If medspacy is available, use it for medical entity extraction
try:
    import medspacy
    import spacy
    MEDSPACY_AVAILABLE = True
    nlp = None  # Don't load by default - too slow
    print("⚠️  MedSpaCy available but not loaded (use --advanced flag to enable)")
except ImportError:
    MEDSPACY_AVAILABLE = False
    nlp = None
    print("⚠️  MedSpaCy not available. Using pattern-based term extraction.")


def extract_medical_terms_simple(text):
    """
    Simple pattern-based medical term extraction.
    Looks for medical-like words (capitalized, Latin-ish, medical suffixes/prefixes).
    """
    # Common medical prefixes and suffixes
    medical_patterns = [
        r'\b\w*itis\b',  # inflammation (bronchitis, arthritis)
        r'\b\w*osis\b',  # condition (thrombosis, necrosis)
        r'\b\w*oma\b',   # tumor (carcinoma, melanoma)
        r'\b\w*pathy\b', # disease (neuropathy, myopathy)
        r'\b\w*emia\b',  # blood condition (anemia, leukemia)
        r'\bhyper\w+\b', # excessive
        r'\bhypo\w+\b',  # deficient
        r'\b[A-Z]{2,}\b', # acronyms (MRI, CT, COPD)
    ]
    
    terms = []
    for pattern in medical_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        terms.extend([m.lower() for m in matches])
    
    return list(set(terms))


def extract_medical_terms_advanced(text):
    """
    Use MedSpaCy/ScispaCy for medical entity extraction.
    """
    if not MEDSPACY_AVAILABLE:
        return extract_medical_terms_simple(text)
    
    doc = nlp(text)
    terms = [ent.text.lower() for ent in doc.ents]
    return list(set(terms))


def analyze_term_errors(pred_text, gt_text, use_advanced=False):
    """
    Compare predicted and ground truth to find term-level errors.
    
    Returns:
        dict with 'missed', 'added', 'substituted' terms
    """
    extract_fn = extract_medical_terms_advanced if use_advanced else extract_medical_terms_simple
    
    pred_terms = set(extract_fn(pred_text))
    gt_terms = set(extract_fn(gt_text))
    
    missed = gt_terms - pred_terms  # In GT but not in pred
    added = pred_terms - gt_terms   # In pred but not in GT
    correct = pred_terms & gt_terms # In both
    
    return {
        'missed': list(missed),
        'added': list(added),
        'correct': list(correct),
        'gt_terms': list(gt_terms),
        'pred_terms': list(pred_terms)
    }


def build_confusion_pairs(df, sample_size=None):
    """
    Build a confusion matrix of medical terms.
    
    Args:
        df: DataFrame with 'pred_text' and 'gt_text' columns
        sample_size: Limit analysis to N samples (for speed)
    
    Returns:
        Counter of (gt_term, pred_term) pairs
    """
    confusion = Counter()
    
    if sample_size:
        df = df.head(sample_size)
    
    print(f"Analyzing {len(df)} samples for term-level errors...")
    
    for idx, row in df.iterrows():
        if idx % 100 == 0:
            print(f"  Progress: {idx}/{len(df)}")
        
        pred = row['pred_text']
        gt = row['gt_text']
        
        # Simple word-level alignment (better: use edit distance alignment)
        pred_words = pred.lower().split()
        gt_words = gt.lower().split()
        
        # Extract medical terms
        pred_terms = extract_medical_terms_simple(pred)
        gt_terms = extract_medical_terms_simple(gt)
        
        # Find term errors
        errors = analyze_term_errors(pred, gt)
        
        # Record missed terms (GT term not in prediction)
        for gt_term in errors['missed']:
            # Try to find what it was transcribed as (simple heuristic)
            # This is imperfect without proper alignment
            confusion[(gt_term, '[missed]')] += 1
        
        # Record added terms (hallucinated)
        for pred_term in errors['added']:
            confusion[('[hallucinated]', pred_term)] += 1
    
    return confusion


def generate_term_error_report(csv_path, output_json='term_error_analysis.json', sample_size=500):
    """
    Generate comprehensive term error analysis report.
    """
    print(f"\n{'='*60}")
    print("Medical Term Error Analysis")
    print(f"{'='*60}\n")
    
    # Load data
    print(f"📂 Loading data from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    print(f"✅ Loaded {len(df)} samples")
    print(f"📊 Columns: {list(df.columns)}\n")
    
    if 'pred_text' not in df.columns or 'gt_text' not in df.columns:
        print("❌ Error: CSV must have 'pred_text' and 'gt_text' columns")
        print(f"   Found columns: {list(df.columns)}")
        return
    
    num_samples = len(df) if sample_size is None else min(sample_size, len(df))
    print(f"🔍 Will analyze {num_samples} samples\n")
    
    # Analyze term errors
    print("🔬 Analyzing term-level errors...")
    import time
    start_time = time.time()
    
    all_missed = []
    all_added = []
    all_gt_terms = []
    all_pred_terms = []
    
    # Sample for speed
    sample_df = df.head(sample_size) if sample_size else df
    total_samples = len(sample_df)
    
    for i, (idx, row) in enumerate(sample_df.iterrows()):
        if i % 50 == 0 or i == total_samples - 1:
            progress = (i + 1) / total_samples * 100
            elapsed = time.time() - start_time
            est_total = elapsed / (i + 1) * total_samples if i > 0 else 0
            est_remaining = est_total - elapsed
            print(f"  Progress: {i+1}/{total_samples} ({progress:.1f}%) | "
                  f"Elapsed: {elapsed:.1f}s | Est. remaining: {est_remaining:.1f}s")
        
        analysis = analyze_term_errors(row['pred_text'], row['gt_text'])
        all_missed.extend(analysis['missed'])
        all_added.extend(analysis['added'])
        all_gt_terms.extend(analysis['gt_terms'])
        all_pred_terms.extend(analysis['pred_terms'])
    
    elapsed = time.time() - start_time
    print(f"\n✅ Analysis complete in {elapsed:.2f} seconds")
    
    # Compute statistics
    missed_counter = Counter(all_missed)
    added_counter = Counter(all_added)
    gt_term_counter = Counter(all_gt_terms)
    
    # Term-level recall
    total_gt_terms = len(all_gt_terms)
    total_missed = len(all_missed)
    term_recall = (total_gt_terms - total_missed) / total_gt_terms if total_gt_terms > 0 else 0
    
    print(f"\n{'='*60}")
    print("RESULTS")
    print(f"{'='*60}")
    print(f"✅ Term-level Recall: {term_recall:.3f}")
    print(f"📊 Total GT terms: {total_gt_terms}")
    print(f"❌ Total missed: {total_missed}")
    print(f"➕ Total hallucinated: {len(all_added)}")
    
    # Filter missed terms: only show those with total occurrence < 100
    filtered_missed = [
        (term, count) for term, count in missed_counter.most_common()
        if gt_term_counter.get(term, 0) < 100
    ]
    
    total_unique_missed = len(missed_counter)
    rare_missed = len(filtered_missed)
    
    print(f"\n🔝 Top 20 Most Frequently Missed Medical Terms (Total Occurrence < 100):")
    print(f"{'-'*60}")
    print(f"   Showing {min(20, rare_missed)} of {rare_missed} rare terms (out of {total_unique_missed} total unique missed terms)")
    print(f"{'-'*60}")
    for term, count in filtered_missed[:20]:
        freq_in_gt = gt_term_counter.get(term, 0)
        miss_rate = count / freq_in_gt if freq_in_gt > 0 else 0
        print(f"  {term:30s} | Missed: {count:4d} / Total: {freq_in_gt:4d} ({miss_rate:.1%})")
    
    print(f"\n➕ Top 20 Most Frequently Hallucinated Terms:")
    print(f"{'-'*60}")
    for term, count in added_counter.most_common(20):
        print(f"  {term:30s} | Count: {count:4d}")
    
    # Save report
    report = {
        'summary': {
            'term_recall': float(term_recall),
            'total_gt_terms': int(total_gt_terms),
            'total_missed': int(total_missed),
            'total_hallucinated': int(len(all_added)),
            'samples_analyzed': len(sample_df)
        },
        'top_missed_terms_rare': [
            {'term': term, 'missed_count': count, 'total_occurrences': gt_term_counter.get(term, 0),
             'miss_rate': count / gt_term_counter.get(term, 1)}
            for term, count in filtered_missed[:50]
        ],
        'top_missed_terms_all': [
            {'term': term, 'missed_count': count, 'total_occurrences': gt_term_counter.get(term, 0),
             'miss_rate': count / gt_term_counter.get(term, 1)}
            for term, count in missed_counter.most_common(50)
        ],
        'top_hallucinated_terms': [
            {'term': term, 'count': count}
            for term, count in added_counter.most_common(50)
        ],
    }
    
    with open(output_json, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n✅ Report saved to {output_json}")
    print(f"{'='*60}\n")


if __name__ == '__main__':
    import sys
    
    # Usage
    csv_file = 'wer_prediction_dataset_extended.csv'
    
    if len(sys.argv) > 1:
        csv_file = sys.argv[1]
    
    if not pd.io.common.file_exists(csv_file):
        print(f"❌ Error: {csv_file} not found")
        print("Usage: python term_error_analysis.py [csv_file]")
        sys.exit(1)
    
    # Analyze full test set for accurate metrics
    generate_term_error_report(csv_file, sample_size=None)
    
    print("\n💡 Tips:")
    print("  - This script analyzed 500 samples by default for speed")
    print("  - For full analysis, edit the sample_size parameter in the script")
    print("  - Install MedSpaCy for better term extraction (optional):")
    print("    pip install medspacy scispacy")
    print("    python -m spacy download en_core_sci_md")
    print("  - Use the JSON output for dashboard integration")




