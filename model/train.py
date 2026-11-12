"""
GraphGuard AI — ONNX Model Training Script
Trains a GradientBoosting classifier on synthetic Elliptic-format data
and exports to ONNX for browser-side inference via onnxruntime-web.
"""

import numpy as np
import json
import os
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

FEATURE_NAMES = [
    'inDegree', 'outDegree', 'transactedVolumeBtc', 'feeRateSats',
    'avgNeighborRisk', 'temporalVelocity', 'burstScore', 'circularityIndex'
]

def generate_synthetic_data(n_licit=4000, n_illicit=1000, seed=42):
    rng = np.random.RandomState(seed)
    licit = np.column_stack([
        rng.randint(1, 8, n_licit).astype(float),
        rng.randint(1, 8, n_licit).astype(float),
        rng.uniform(0.1, 50.0, n_licit),
        rng.uniform(1, 30, n_licit),
        rng.uniform(0.01, 0.30, n_licit),
        rng.uniform(0.5, 8.0, n_licit),
        rng.uniform(0.01, 0.20, n_licit),
        rng.uniform(0.01, 0.15, n_licit),
    ])
    illicit = np.column_stack([
        rng.randint(3, 12, n_illicit).astype(float),
        rng.randint(3, 12, n_illicit).astype(float),
        rng.uniform(5.0, 200.0, n_illicit),
        rng.uniform(10, 60, n_illicit),
        rng.uniform(0.50, 1.00, n_illicit),
        rng.uniform(10.0, 50.0, n_illicit),
        rng.uniform(0.60, 1.00, n_illicit),
        rng.uniform(0.50, 1.00, n_illicit),
    ])
    X = np.vstack([licit, illicit]).astype(np.float32)
    y = np.array([0]*n_licit + [1]*n_illicit, dtype=np.int64)
    return X, y

def main():
    print("=" * 60)
    print("GraphGuard AI - ONNX Model Training")
    print("=" * 60)

    print("\n[1/4] Generating synthetic Elliptic-format dataset...")
    X, y = generate_synthetic_data()
    print(f"  Total: {len(y)} (licit={np.sum(y==0)}, illicit={np.sum(y==1)})")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    print(f"  Train: {len(y_train)}, Test: {len(y_test)}")

    print("\n[2/4] Training GradientBoostingClassifier...")
    clf = GradientBoostingClassifier(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n[3/4] Accuracy: {accuracy:.4f} ({accuracy*100:.1f}%)")
    print(classification_report(y_test, y_pred, target_names=['licit', 'illicit']))

    print("[4/4] Exporting to ONNX...")
    initial_type = [('node_features', FloatTensorType([None, 8]))]
    onnx_model = convert_sklearn(clf, initial_types=initial_type, options={type(clf): {'zipmap': False}})

    output_dir = os.path.dirname(os.path.abspath(__file__))
    onnx_path = os.path.join(output_dir, 'graphguard.onnx')
    with open(onnx_path, 'wb') as f:
        f.write(onnx_model.SerializeToString())

    file_size = os.path.getsize(onnx_path) / 1024
    print(f"  Saved: {onnx_path} ({file_size:.1f} KB)")

    info = {
        'features': FEATURE_NAMES, 'accuracy': round(accuracy, 4),
        'threshold': 0.5, 'version': '1.0.0',
        'n_estimators': 100, 'max_depth': 4,
        'train_samples': len(y_train), 'test_samples': len(y_test),
        'model_size_kb': round(file_size, 1),
    }
    with open(os.path.join(output_dir, 'model_info.json'), 'w') as f:
        json.dump(info, f, indent=2)

    print(f"\n{'='*60}")
    print(f"Done! Copy model/graphguard.onnx -> public/model/graphguard.onnx")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
