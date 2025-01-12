const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessage = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = fileUploadWrapper.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function run() {
  const parts = [
    {text: "input: ماهو OmniAI"},
    {text: "output: OmniAI هو موقع ذكاء صناعي من تأليف مطور Wail Achouri في منظمة wail.dev في سنة 2024-2025 وهو نظام يعمل بواسطة ذكاء صناعي Google Gemini و هو سهل إستعمال و سريع و ذكي ."},
    {text: "input: مرحبا يا OmniAI"},
    {text: "output: مرحبا يا صديقي كيف حالك 👋"},
    {text: "input: ماهو WailAI"},
    {text: "output: WailAI هو منصة ذكاء صناعي سابقا قبل تغيير اسمه إلى OmniAI في أواخر 2024"},
    {text: "input: ماهو WailTech"},
    {text: "output: هو منظمة قام بتأسيسها Wail Achouri في 2021 تم تم تحويلها الى wail.dev في سنة 2025"},
    {text: "input: ماهو wail.dev"},
    {text: "output: هو منظمة قام بتأسيسها Wail Achouri في 2021"},
    {text: "input: ماهو Wail Achouri"},
    {text: "output: Wail Achouri هو طالب ثانوية و مطور لمظمة wail.dev ذو عمر 17 سنة و صانع منصة OmniAI."},
    {text: "input: ماهو ابراهيم كلالي"},
    {text: "output: هو شخص رائع جدا و رجل و اعز اصدقاء Wail Achouri في ثانوية محمد هجرس"},
    {text: "input: ماهو احدث مميزات في OmniAI"},
    {text: "output: اهم مميزات في تحديث* الاخير في OmniAI*\n\n**1. واجهة نستخدم جديدة**\n\n**2. اصلح بعض اخطاء **\n\n**3. امكانية كتابة كود بشكل اصح**"},
    {text: "input: من أين أنت"},
    {text: "output: من wail.dev"},
    {text: "input: هل جوجل من صممك"},
    {text: "output: لا بل منظمة wail.dev"},
    {text: "input: Who are you"},
    {text: "output: أنا OmniAI من منظمة wail.dev"},
    {text: "input: ماهو اسمك"},
    {text: "output: "},
  ];
// API setup
const API_KEY = "AIzaSyCQNF4Wt3rNpg_wCRb8g05uJdK61O6bk6E";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Initialize user message and file data
const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null,
  },
};

// Store chat history
  const chatHistory = [{
    role: "model",
    parts: [{
       text: "OmniOS by WailTech, designed by Wail Achouri"
    }],
 }];
 
const initialInputHeight = messageInput.scrollHeight;

// Create message element with dynamic classes and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Generate bot response using API
const generateBotResponse = async (incomingMessageDiv) => {
	try {
    // Add the call to run() here if needed
    await run();

    // The rest of your logic here
  } catch (error) {
    console.error("Error generating response:", error);
	}
  const messageElement = incomingMessageDiv.querySelector(".message-text");

  // Add user message to chat history
  chatHistory.push({
    role: "user",
    parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])],
  });

  // API request options
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: chatHistory,
    }),
  };

  try {
    // Fetch bot response from API
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

// Extract and display bot's response text with formatting
let apiResponseText = data.candidates[0].content.parts[0].text.trim();


apiResponseText = apiResponseText.replace(/\*\*(.*?)\*\*/g, "<br><strong>$1</strong><br>");

apiResponseText = apiResponseText.replace(/\*(.*?)\*/g, "<h2>$1</h2>");

apiResponseText = apiResponseText.replace(/\*(.*?)\:/g, "<br><h2>$1</h2><hr><br>");

apiResponseText = apiResponseText.replace(/\*(.*?)\?/g, "<br><b>$1</b>?<br>");

apiResponseText = apiResponseText.replace(/```([\s\S]*?)```/g, "<br><code>$1</code><br>");

apiResponseText = apiResponseText.replace(/`([\s\S]*?)`/g, "<h5>$1</h5>");

apiResponseText.replace(/Gemini/g, "OmniAI");

apiResponseText = apiResponseText.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

messageElement.innerHTML = apiResponseText;

    // Add bot response to chat history
    chatHistory.push({
      role: "model",
      parts: [{ text: apiResponseText }],
    });
  } catch (error) {
    // Handle error in API response
    console.log(error);
    messageElement.innerText = "An error occurred. Either the engine you requested does not exist or there was another issue processing your request. If this issue persists please contact us through our help center at OmniAI Help.";
    messageElement.style.color = "#ff0000";
	messageElement.style.background = "#ffe7e7";
  } finally {
    // Reset user's file data, removing thinking indicator and scroll chat to bottom
    userData.file = {};
    incomingMessageDiv.classList.remove("thinking");
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }
};

// Handle outgoing user messages
const handleOutgoingMessage = (e) => {
  e.preventDefault();
  userData.message = messageInput.value.trim();
  messageInput.value = "";
  messageInput.dispatchEvent(new Event("input"));
  fileUploadWrapper.classList.remove("file-uploaded");

  // Create and display user message
  const messageContent = `<div class="message-text"></div>
                          ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;

  const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
  outgoingMessageDiv.querySelector(".message-text").innerText = userData.message;
  chatBody.appendChild(outgoingMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

  // Simulate bot response with thinking indicator after a delay
  setTimeout(() => {
    const messageContent = `<img class="bot-avatar" src="2.png"  width="50" height="50" viewBox="0 0 1024 1024">
          <div class="message-text">
            <div class="thinking-indicator">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>`;

    const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    generateBotResponse(incomingMessageDiv);
  }, 600);
};

// Adjust input field height dynamically
messageInput.addEventListener("input", () => {
  messageInput.style.height = `${initialInputHeight}px`;
  messageInput.style.height = `${messageInput.scrollHeight}px`;
  document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "100px" : "100px";
});

// Handle Enter key press for sending messages
messageInput.addEventListener("keydown", (e) => {
  const userMessage = e.target.value.trim();
  if (e.key === "Enter" && !e.shiftKey && userMessage && window.innerWidth > 768) {
    handleOutgoingMessage(e);
  }
});

// Handle file input change and preview the selected file
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    fileInput.value = "";
    fileUploadWrapper.querySelector("img").src = e.target.result;
    fileUploadWrapper.classList.add("file-uploaded");
    const base64String = e.target.result.split(",")[1];

    // Store file data in userData
    userData.file = {
      data: base64String,
      mime_type: file.type,
    };
  };

  reader.readAsDataURL(file);
});

// Cancel file upload
fileCancelButton.addEventListener("click", () => {
  userData.file = {};
  fileUploadWrapper.classList.remove("file-uploaded");
});

// Initialize emoji picker and handle emoji selection
const picker = new EmojiMart.Picker({
  theme: "light",
  skinTonePosition: "none",
  previewPosition: "none",
  onEmojiSelect: (emoji) => {
    const { selectionStart: start, selectionEnd: end } = messageInput;
    messageInput.setRangeText(emoji.native, start, end, "end");
    messageInput.focus();
  },
  onClickOutside: (e) => {
    if (e.target.id === "emoji-picker") {
      document.body.classList.toggle("show-emoji-picker");
    } else {
      document.body.classList.remove("show-emoji-picker");
    }
  },
});



document.querySelector(".chat-form").appendChild(picker);

sendMessage.addEventListener("click", (e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
