// Recruiter Copilot / AI Twin Chatbot
(function () {
  const triggerBtn = document.getElementById('ai-copilot-trigger');
  const chatWindow = document.getElementById('ai-chat-window');
  const closeBtn = document.getElementById('ai-chat-close');
  const chatMessages = document.getElementById('ai-chat-messages');
  const chatInput = document.getElementById('ai-chat-input');
  const chatSendBtn = document.getElementById('ai-chat-send');
  const quickPromptsContainer = document.getElementById('ai-quick-prompts');

  if (!triggerBtn || !chatWindow) return;

  // Toggle chat window
  function toggleChat() {
    chatWindow.classList.toggle('active');
    if (chatWindow.classList.contains('active')) {
      chatInput.focus();
    }
  }

  triggerBtn.addEventListener('click', toggleChat);
  if (closeBtn) closeBtn.addEventListener('click', toggleChat);

  // Send query
  async function sendQuery(queryText) {
    const text = queryText || chatInput.value.trim();
    if (!text) return;

    // Append user message
    appendBubble(text, 'user');
    chatInput.value = '';

    // Append loading bubble
    const loadingId = 'loading-' + Date.now();
    const loadingBubble = document.createElement('div');
    loadingBubble.id = loadingId;
    loadingBubble.className = 'chat-bubble bubble-ai';
    loadingBubble.innerHTML = '<em>Analyzing profile &amp; architecture knowledge...</em>';
    chatMessages.appendChild(loadingBubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      });
      const data = await res.json();

      const el = document.getElementById(loadingId);
      if (el) el.remove();

      appendBubble(data.reply, 'ai', data.relatedLinks);

      // Update quick prompt suggestions if provided
      if (data.suggestedPrompts && data.suggestedPrompts.length > 0) {
        renderQuickPrompts(data.suggestedPrompts);
      }
    } catch (err) {
      const el = document.getElementById(loadingId);
      if (el) el.remove();
      appendBubble('Sorry, I encountered an issue connecting to the portfolio AI engine. Please try again or email Shreya directly at shreyakhadekar@gmail.com.', 'ai');
    }
  }

  function appendBubble(text, sender, links = []) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble bubble-${sender}`;

    // Convert basic markdown to safe HTML
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');

    bubble.innerHTML = formatted;

    if (links && links.length > 0) {
      const linksDiv = document.createElement('div');
      linksDiv.style.marginTop = '0.75rem';
      linksDiv.style.paddingTop = '0.5rem';
      linksDiv.style.borderTop = '1px solid rgba(255,255,255,0.1)';
      linksDiv.innerHTML = '<span style="font-size:0.75rem; color:#88A8CC; display:block; margin-bottom:0.35rem;">🔗 Verified Links:</span>';

      links.forEach(l => {
        const a = document.createElement('a');
        a.href = l.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.style.display = 'inline-block';
        a.style.fontSize = '0.78rem';
        a.style.marginRight = '0.5rem';
        a.style.marginBottom = '0.35rem';
        a.style.color = 'var(--accent-cyan)';
        a.style.textDecoration = 'underline';
        a.innerText = l.text + ' ↗';
        linksDiv.appendChild(a);
      });
      bubble.appendChild(linksDiv);
    }

    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function renderQuickPrompts(prompts) {
    if (!quickPromptsContainer) return;
    quickPromptsContainer.innerHTML = '';
    prompts.forEach(p => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'quick-prompt-chip';
      chip.innerText = p;
      chip.addEventListener('click', () => sendQuery(p));
      quickPromptsContainer.appendChild(chip);
    });
  }

  chatSendBtn.addEventListener('click', () => sendQuery());
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendQuery();
  });

  // Attach listeners to initial quick prompt chips
  const initialChips = document.querySelectorAll('.quick-prompt-chip');
  initialChips.forEach(chip => {
    chip.addEventListener('click', () => sendQuery(chip.innerText));
  });
})();
