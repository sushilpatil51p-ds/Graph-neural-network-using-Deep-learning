Set-Location model
pip install -r requirements.txt
python train.py
Move-Item -Force graphguard.onnx ../public/model/graphguard.onnx
Write-Host 'ONNX model ready at public/model/graphguard.onnx'
