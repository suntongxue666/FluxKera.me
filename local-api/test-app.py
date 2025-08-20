from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import uuid
import base64

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'models_loaded': True, 'mode': 'test'})

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json or {}
    prompt = data.get('prompt', 'Test image')
    width = data.get('width', 512)
    height = data.get('height', 512)
    
    # 创建一个简单的SVG测试图片
    svg = f'''<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad1)"/>
        <rect x="20" y="20" width="{width-40}" height="{height-40}" fill="none" stroke="white" stroke-width="4"/>
        <text x="50%" y="20%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" font-weight="bold">FLUX.1 Krea [Test]</text>
        <text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle">{prompt[:100]}</text>
        <text x="50%" y="80%" font-family="Arial" font-size="14" fill="white" text-anchor="middle">Size: {width}x{height} | Test Mode</text>
    </svg>'''
    
    svg_b64 = base64.b64encode(svg.encode()).decode()
    
    return jsonify({
        'success': True,
        'imageUrl': f'data:image/svg+xml;base64,{svg_b64}',
        'params': {
            'prompt': prompt,
            'width': width,
            'height': height,
            'guidance': data.get('guidance', 4.5),
            'num_steps': data.get('num_steps', 28),
            'seed': data.get('seed', 42)
        },
        'generationTime': 1500,
        'estimatedTime': 2000,
        'creditsUsed': 10
    })

if __name__ == '__main__':
    print('🚀 启动FluxKrea测试API...')
    app.run(host='0.0.0.0', port=5000, debug=True)
