#!/bin/bash

# 设置颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== FluxKrea 开发环境启动脚本 ===${NC}"

# 检查环境变量文件
if [ ! -f .env.local ]; then
  echo -e "${YELLOW}警告: .env.local 文件不存在，将创建示例文件${NC}"
  cat > .env.local << EOL
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Replicate API
REPLICATE_API_TOKEN=your_replicate_api_token

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EOL
  echo -e "${YELLOW}请编辑 .env.local 文件并填入您的API密钥${NC}"
fi

# 检查依赖
echo -e "${BLUE}检查依赖...${NC}"
if ! command -v npm &> /dev/null; then
  echo -e "${RED}错误: npm 未安装，请先安装 Node.js${NC}"
  exit 1
fi

# 安装依赖
echo -e "${BLUE}安装依赖...${NC}"
npm install

# 启动本地测试API
echo -e "${BLUE}启动本地测试API...${NC}"
mkdir -p local-api
if [ ! -f local-api/test-app.py ]; then
  cat > local-api/test-app.py << EOL
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
EOL
fi

if [ ! -f local-api/requirements.txt ]; then
  cat > local-api/requirements.txt << EOL
flask==2.3.3
flask-cors==4.0.0
EOL
fi

# 安装Python依赖
echo -e "${BLUE}安装Python依赖...${NC}"
cd local-api && pip install -r requirements.txt && cd ..

# 启动测试API和Next.js开发服务器
echo -e "${GREEN}启动服务...${NC}"
echo -e "${YELLOW}测试API将在 http://localhost:5000 运行${NC}"
echo -e "${YELLOW}Next.js将在 http://localhost:3000 运行${NC}"

# 在后台启动测试API
cd local-api && python test-app.py &
API_PID=$!

# 启动Next.js开发服务器
cd ..
npm run dev

# 当Next.js停止时，也停止API服务
kill $API_PID