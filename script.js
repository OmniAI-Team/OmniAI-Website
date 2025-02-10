// العناصر الأساسية في واجهة المستخدم
const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessage = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = fileUploadWrapper.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");

// إعدادات API
const API_KEY = "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"; // استبدل هذا بالمفتاح السري الفعلي
const API_URL = "https://openrouter.ai/api/v1/chat/completions"; // رابط API الصحيح

// بيانات المستخدم
const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null,
  },
};

// سجل المحادثة
const chatHistory = [
  {
    role: "assistant",
    content: "مرحبًا! أنا مساعدك الافتراضي. كيف يمكنني مساعدتك؟", // رسالة بدء المحادثة
  },
];

// ارتفاع حقل الإدخال الابتدائي
const initialInputHeight = messageInput.scrollHeight;

// إنشاء عنصر رسالة
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// توليد رد الروبوت باستخدام API
const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");

  // دمج الرسالة النصية والملف المرفق (إن وجد)
  const combinedMessage =
    userData.message + (userData.file.data ? `\n\n[ملف مرفق]: ${userData.file.data}` : "");

  // إضافة رسالة المستخدم إلى سجل المحادثة
  chatHistory.push({
    role: "user",
    content: combinedMessage, // استخدم "content" بدلًا من "parts"
  });

  // إعداد طلب API
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`, // إضافة المفتاح السري
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo", // حدد النموذج الذي تريد استخدامه
      messages: chatHistory, // أرسل سجل المحادثة كـ "messages"
    }),
  };

  try {
    // إرسال الطلب إلى API
    const response = await fetch(API_URL, requestOptions);

    // التحقق من نجاح الطلب
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Unknown error");
    }

    // تحليل الرد
    const data = await response.json();

    // استخراج النص من الرد
    let apiResponseText = data.choices[0].message.content.trim(); // استخدم "choices" بدلًا من "candidates"

    // تنسيق النص (Markdown إلى HTML)
    apiResponseText = apiResponseText
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // نص عريض
      .replace(/\*(.*?)\*/g, "<i>$1</i>") // نص مائل
      .replace(/```([\s\S]*?)```/g, "<br><code>$1</code><br>") // كود
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>'); // روابط

    // عرض النص في واجهة المستخدم
    messageElement.innerHTML = apiResponseText;

    // إضافة رد الروبوت إلى سجل المحادثة
    chatHistory.push({
      role: "assistant",
      content: apiResponseText,
    });
  } catch (error) {
    // معالجة الأخطاء
    console.error("API Error:", error);
    messageElement.innerText = `Error: ${error.message}`;
    messageElement.style.color = "#ff0000";
    messageElement.style.background = "#ffe7e7";
  } finally {
    // إعادة تعيين البيانات وإزالة مؤشر التفكير
    userData.message = null;
    userData.file = {};
    incomingMessageDiv.classList.remove("thinking");
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }
};

// معالجة إرسال الرسائل
const handleOutgoingMessage = (e) => {
  e.preventDefault();
  userData.message = messageInput.value.trim();

  // التحقق من وجود رسالة أو ملف مرفق
  if (!userData.message && !userData.file.data) {
    alert("يرجى إدخال رسالة أو تحميل ملف.");
    return;
  }

  // إعادة تعيين حقل الإدخال
  messageInput.value = "";
  messageInput.dispatchEvent(new Event("input"));
  fileUploadWrapper.classList.remove("file-uploaded");

  // إنشاء وعرض رسالة المستخدم
  const messageContent = `<div class="message-text">${userData.message}</div>
                          ${
                            userData.file.data
                              ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />`
                              : ""
                          }`;
  const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
  chatBody.appendChild(outgoingMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

  // عرض مؤشر التفكير للروبوت
  setTimeout(() => {
    const messageContent = `<img class="bot-avatar" src="icon.svg" width="50" height="50" viewBox="0 0 1024 1024">
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

// ضبط ارتفاع حقل الإدخال تلقائيًا
messageInput.addEventListener("input", () => {
  messageInput.style.height = `${initialInputHeight}px`;
  messageInput.style.height = `${messageInput.scrollHeight}px`;
  document.querySelector(".chat-form").style.borderRadius =
    messageInput.scrollHeight > initialInputHeight ? "20px" : "20px";
});

// إرسال الرسالة عند الضغط على Enter
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && messageInput.value.trim() && window.innerWidth > 768) {
    handleOutgoingMessage(e);
  }
});

// معالجة تحميل الملفات
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    fileInput.value = "";
    fileUploadWrapper.querySelector("img").src = e.target.result;
    fileUploadWrapper.classList.add("file-uploaded");
    const base64String = e.target.result.split(",")[1];

    // تخزين بيانات الملف
    userData.file = {
      data: base64String,
      mime_type: file.type,
    };
  };
  reader.readAsDataURL(file);
});

// إلغاء تحميل الملف
fileCancelButton.addEventListener("click", () => {
  userData.file = {};
  fileUploadWrapper.classList.remove("file-uploaded");
});

// إضافة منتقي الإيموجي
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

// إضافة المستمعين للأحداث
sendMessage.addEventListener("click", (e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));