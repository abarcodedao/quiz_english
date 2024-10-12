// Ngân hàng câu hỏi
const questions = {
    communicating: [
        "How do you keep in touch with your friends?",
        "How do you start a conversation when you meet someone for the first time?",
        "Where do you usually meet new people?",
        "How often do you video call friends and relatives?"
    ],
    travel: [
        "Where did you go on your last holiday?",
        "Where do you like to go on holiday?",
        "Do you like to try new things on holidays?",
        "What’s your favorite way of travelling?"
    ],
    money: [
        "Do you enjoy going shopping?",
        "Which shops do you like going to?",
        "Have you ever bought anything unusual in an online sale?",
        "How often do you go to a supermarket?"
    ],
    celebrations: [
        "How often do you go to a party?",
        "What’s the biggest party you’ve ever been to?",
        "Do you celebrate your birthday? What do you do?",
        "What celebrations are important in your country?"
    ],
    jobs: [
        "What can you do if you need a job?",
        "Have you ever had a summer job or a part-time job? What was it?",
        "Which job would you most like to do?",
        "Is it easy to find work where you live?"
    ],
    question: [
        "Have you been on a really long journey? (Where did you go?)",
        "Which do you prefer, travelling by car or travelling by bus? (Why?)",
        "Have you ever been on an airplane? (Did you enjoy it?)",
        "Is it important for people to think about the environment when they choose how to travel? (Why?/Why not?)"
    ],
    question1: [
        "What was the last present you bought for someone?",
        "What would you most like to buy if you had enough money? (Why?) ",
        "What habits can you do to spend less money?",
        "Can having a lot of money be a problem for some people? (How?) "
    ],
    question2: [
        "Do you enjoy city life or would you rather live in the countryside? (Why?)",
        "When you visit a place do you go sightseeing? (Why/Why not?)",
        "What kind of entertainment can you enjoy in a city?",
        "Which city would you like to visit if you could? (Why?)"
    ],
    question3: [
        "Which jobs are the most dangerous ones? (Why?)",
        "Are there jobs that are only for women or only for men?",
        "What should someone look for in a job?",
        "If money weren't a problem for you, which job would you prefer to have? (Why?)"
    ]
};

// Lấy tất cả các chủ đề
const allTopics = Object.keys(questions);

// Lấy các phần tử HTML
const questionContainer = document.getElementById('questions');
const submitBtn = document.getElementById('submit-btn');
const recordBtn = document.getElementById('record-btn');
const playBtn = document.getElementById('play-btn');

let mediaRecorder;
let audioChunks = [];
let audioBlob;
let isRecording = false; // Biến trạng thái ghi âm
let voices = []; // Biến để lưu danh sách giọng nói
let isVoicesLoaded = false; // Biến kiểm tra nếu giọng nói đã được tải
let isFirstQuestionDisplayed = false; // Biến kiểm tra nếu câu hỏi đầu tiên đã được hiển thị

// Hàm để lấy một câu hỏi ngẫu nhiên từ bất kỳ chủ đề nào
function getRandomQuestionFromAllTopics() {
    const randomTopic = allTopics[Math.floor(Math.random() * allTopics.length)];
    const topicQuestions = questions[randomTopic];
    const randomIndex = Math.floor(Math.random() * topicQuestions.length);
    
    return {
        topic: randomTopic,
        question: topicQuestions[randomIndex]
    };
}

// Hàm để phát âm câu hỏi
function speakQuestion(question) {
    if (!isVoicesLoaded) {
        return; // Không phát âm nếu giọng nói chưa được tải
    }
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.lang = 'en-US'; // Thiết lập ngôn ngữ

    // Tìm giọng đọc Google
    const googleVoice = voices.find(voice => voice.name.includes('Google'));
    if (googleVoice) {
        utterance.voice = googleVoice; // Sử dụng giọng đọc của Google
    }

    speechSynthesis.speak(utterance);
}

// Hàm hiển thị câu hỏi ngẫu nhiên
function displayRandomQuestion() {
    const randomQuestionData = getRandomQuestionFromAllTopics();
    questionContainer.innerHTML = ''; // Xóa câu hỏi trước đó

    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';

    const questionText = `<strong>Chủ đề (${randomQuestionData.topic}):</strong> ${randomQuestionData.question}`;
    questionDiv.innerHTML = questionText;
    questionContainer.appendChild(questionDiv);

    // Đánh dấu câu hỏi đầu tiên đã được hiển thị
    isFirstQuestionDisplayed = true;

    // Phát âm câu hỏi ngay khi hiển thị nếu giọng nói đã được tải
    if (isVoicesLoaded) {
        speakQuestion(randomQuestionData.question);
    } else {
        // Trì hoãn việc phát âm nếu giọng nói chưa được tải
        const checkVoicesLoaded = setInterval(() => {
            if (isVoicesLoaded) {
                speakQuestion(randomQuestionData.question);
                clearInterval(checkVoicesLoaded); // Dừng kiểm tra khi phát âm
            }
        }, 100); // 100ms là khoảng thời gian kiểm tra
    }
}

// Hàm để kiểm tra hỗ trợ tính năng
function checkFeatureSupport() {
    if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
        alert("Trình duyệt của bạn không hỗ trợ ghi âm.");
        return false;
    }
    return true;
}

// Khi người dùng nhấn nút "Ghi âm câu trả lời"
recordBtn.addEventListener('click', async () => {
    if (!checkFeatureSupport()) return; // Kiểm tra hỗ trợ tính năng

    if (!isRecording) {
        // Yêu cầu quyền truy cập vào microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioChunks = [];
            playBtn.disabled = false; // Bật nút phát lại
        };

        mediaRecorder.start();
        isRecording = true; // Cập nhật trạng thái ghi âm
        recordBtn.textContent = "Dừng ghi âm";
    } else {
        mediaRecorder.stop();
        isRecording = false; // Cập nhật trạng thái dừng ghi âm
        recordBtn.textContent = "Ghi âm câu trả lời";
    }
});

// Khi người dùng nhấn nút "Phát lại câu trả lời"
playBtn.addEventListener('click', () => {
    if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
    }
});

// Khi người dùng nhấn nút "Gửi câu trả lời"
submitBtn.addEventListener('click', () => {
    // Ghi log câu trả lời (có thể thay đổi tùy theo yêu cầu của bạn)
    console.log('Câu trả lời của bạn đã được gửi.');

    // Hiển thị câu hỏi ngẫu nhiên tiếp theo
    displayRandomQuestion();
});

// Cập nhật danh sách giọng nói khi có sự thay đổi
speechSynthesis.onvoiceschanged = () => {
    voices = speechSynthesis.getVoices(); // Cập nhật danh sách giọng nói
    isVoicesLoaded = true; // Đánh dấu giọng nói đã được tải
    
    // Chỉ hiển thị câu hỏi đầu tiên và phát âm sau khi giọng nói đã được tải
    if (!isFirstQuestionDisplayed) {
        displayRandomQuestion();
    }
};

// Hiển thị câu hỏi ngẫu nhiên khi trang tải
displayRandomQuestion();
