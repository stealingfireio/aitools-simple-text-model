function showMessage(message, isUserMessage = false) {
    const messageClass = isUserMessage ? 'user-message' : 'ai-message';
    const messageRole = isUserMessage ? 'User: ' : '';
    const timestamp = new Date().toLocaleTimeString();
    $("#conversation").append(`<div class="${messageClass}"><strong>${messageRole}</strong> ${message}<br><span class="conversation-timestamp">${timestamp}</span></div><br>`);
    $("#conversation").scrollTop($("#conversation")[0].scrollHeight);
}




function showError(message) {
    $("#conversation").append('Error: ' + message + '<br>');
}

function setLoading(button, loading) {
    if (loading) {
        button.prop('disabled', true);
        button.find('.spinner-border').removeClass('d-none');
    } else {
        button.prop('disabled', false);
        button.find('.spinner-border').addClass('d-none');
    }
}

function loadApiKey() {
    const apiKey = localStorage.getItem('apiKey');
    if (apiKey) {
        $("#apiKeyInput").val(apiKey);
    }
}


$("#initializeBtn").on('click', function () {
    setLoading($("#initializeBtn"), true);
    const initialText = $("#initialText").val();
    if (initialText) {
        $.post('/initialize', { initial_text: initialText , api_key: localStorage.getItem('apiKey')}, function (data) {
            if (data.status === 'success') {
                $("#conversation").html(''); // 清空对话内容
                showMessage(initialText, true);
                showMessage(data.response);
                localStorage.setItem('initialText', data.initial_text);
                enableChat();
            } else {
                showError(data.response);
            }
            setLoading($("#initializeBtn"), false);
            saveData();
        });
    } else {
        setLoading($("#initializeBtn"), false);
        alert('请输入初始化文本');
    }
});


$("#chatBtn").on('click', function () {
    setLoading($("#chatBtn"), true);
    const userMessage = $("#userMessage").val();
    const conversationHistory = $("#conversation").html();
    const initialText = localStorage.getItem('initialText'); // 获取 initial_text
    $.post('/chat', { user_message: userMessage, conversation_history: conversationHistory, initial_text: initialText, api_key: localStorage.getItem('apiKey')}, function (data) {
        if (data.status === 'success') {
            showMessage('User: ' + userMessage);
            showMessage('AI: ' + data.response);
            $("#userMessage").val(''); // 清除文本框中的内容
        } else {
            showError(data.response);
        }
        setLoading($("#chatBtn"), false);
        saveData();
    });
});


function saveData() {
    localStorage.setItem('initialText', $("#initialText").val());
    localStorage.setItem('conversation', $("#conversation").html());
    localStorage.setItem('userMessage', $("#userMessage").val());
}

function loadData() {
    const initialText = localStorage.getItem('initialText');
    const conversation = localStorage.getItem('conversation');
    const userMessage = localStorage.getItem('userMessage');

    if (initialText) {
        $("#initialText").val(initialText);
    }

    if (conversation) {
        $("#conversation").html(conversation);
    }

    if (userMessage) {
        $("#userMessage").val(userMessage);
    }

    $("#conversation").scrollTop($("#conversation")[0].scrollHeight);

}

function enableChat() {
    $("#chatBtn").prop("disabled", false);
  }
  

$(document).ready(function () {
    loadData();
    loadApiKey();
});

$("#saveApiKeyBtn").on('click', function () {
    const apiKey = $("#apiKeyInput").val();
    if (apiKey) {
        localStorage.setItem('apiKey', apiKey);
        alert('API Key已保存！');
    } else {
        alert('请输入API Key！');
    }
});
