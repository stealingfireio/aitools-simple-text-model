import os
import openai
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

# 初始化Flask应用
app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)

# 配置OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")


# 主页路由
@app.route('/')
def index():
    return render_template('index.html')

# 初始化文本API调用
@app.route('/initialize', methods=['POST'])
def initialize():
    initial_text = request.form.get('initial_text')
    api_key = request.form.get('api_key')
    openai.api_key = api_key
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": f"您是一个有帮助的助手。我们将使用中文进行对话。请学习以下内容并在后续对话中参考：{initial_text}"},
                {"role": "user", "content": f"总结以下内容：{initial_text}"}
            ],
            #max_tokens=150
        )
        return jsonify({'status': 'success', 'response': response.choices[0].message['content'], 'initial_text': initial_text})
    except Exception as e:
        return jsonify({'status': 'error', 'response': str(e)})


# 与AI对话API调用
@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.form.get('user_message')
    conversation_history = request.form.get('conversation_history')
    initial_text = request.form.get('initial_text')
    api_key = request.form.get('api_key')
    openai.api_key = api_key

    messages = [
        {"role": "system", "content": f"您是一个有帮助的助手。我们将使用中文进行对话。请始终围绕训练文本的内容展开对话。训练文本：{initial_text}"},
    ]

    for message in conversation_history.split('\n'):
        if message.startswith('User: '):
            messages.append({"role": "user", "content": message[6:]})
        elif message.startswith('AI: '):
            messages.append({"role": "assistant", "content": message[4:]})

    messages.append({"role": "user", "content": user_message})

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            #max_tokens=150
        )
        return jsonify({'status': 'success', 'response': response.choices[0].message['content']})
    except Exception as e:
        return jsonify({'status': 'error', 'response': str(e)})



# 运行Flask应用
if __name__ == '__main__':
    app.run(debug=True)
