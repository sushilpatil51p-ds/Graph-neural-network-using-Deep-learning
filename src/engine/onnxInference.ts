import * as ort from 'onnxruntime-web';

export interface OnnxPrediction {
  score: number;      // probability of illicit (0-1)
  isIllicit: boolean;  // score > 0.5
  confidence: number;  // max(score, 1-score)
}

export class OnnxFraudClassifier {
  private static instance: OnnxFraudClassifier | null = null;
  private session: ort.InferenceSession | null = null;
  private _isLoaded = false;

  get isLoaded(): boolean { return this._isLoaded; }

  static async getInstance(): Promise<OnnxFraudClassifier> {
    if (!OnnxFraudClassifier.instance) {
      OnnxFraudClassifier.instance = new OnnxFraudClassifier();
      await OnnxFraudClassifier.instance.load();
    }
    return OnnxFraudClassifier.instance;
  }

  private async load(): Promise<void> {
    try {
      // onnxruntime-web: use wasm backend
      ort.env.wasm.numThreads = 1;
      this.session = await ort.InferenceSession.create('/model/graphguard.onnx', {
        executionProviders: ['wasm'],
      });
      this._isLoaded = true;
      console.log('✓ ONNX model loaded successfully');
    } catch (err) {
      console.warn('⚠ ONNX model not available, using fallback scoring:', err);
      this._isLoaded = false;
    }
  }

  async predict(features: number[]): Promise<OnnxPrediction> {
    if (!this.session || !this._isLoaded) {
      return { score: 0.5, isIllicit: false, confidence: 0.5 };
    }

    try {
      const inputTensor = new ort.Tensor('float32', Float32Array.from(features), [1, 8]);
      const results = await this.session.run({ node_features: inputTensor });

      // GradientBoosting with zipmap=False outputs 'probabilities' tensor of shape [1, 2]
      const probabilities = results['probabilities'];
      if (probabilities) {
        const probs = probabilities.data as Float32Array;
        const illicitProb = probs[1]; // class 1 = illicit
        return {
          score: illicitProb,
          isIllicit: illicitProb > 0.5,
          confidence: Math.max(illicitProb, 1 - illicitProb),
        };
      }

      // Fallback: try 'label' output
      const label = results['label'];
      if (label) {
        const isIllicit = (label.data as BigInt64Array)[0] === BigInt(1);
        return { score: isIllicit ? 0.95 : 0.05, isIllicit, confidence: 0.95 };
      }

      return { score: 0.5, isIllicit: false, confidence: 0.5 };
    } catch (err) {
      console.warn('ONNX inference error:', err);
      return { score: 0.5, isIllicit: false, confidence: 0.5 };
    }
  }
}
