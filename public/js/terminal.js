// Interactive Developer Terminal CLI
(function () {
  const terminalDrawer = document.getElementById('terminal-drawer');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalInput = document.getElementById('terminal-input');
  const btnTriggers = document.querySelectorAll('.btn-terminal-trigger');
  const closeBtn = document.querySelector('.terminal-close');

  if (!terminalDrawer || !terminalInput) return;

  const history = [];
  let historyIndex = -1;

  // Toggle terminal
  function toggleTerminal() {
    terminalDrawer.classList.toggle('active');
    if (terminalDrawer.classList.contains('active')) {
      terminalInput.focus();
    }
  }

  btnTriggers.forEach(btn => btn.addEventListener('click', toggleTerminal));
  if (closeBtn) closeBtn.addEventListener('click', toggleTerminal);

  // Global key shortcut: Press `~` or `Ctrl + \`` to toggle terminal
  window.addEventListener('keydown', (e) => {
    if (e.key === '`' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      e.preventDefault();
      toggleTerminal();
    }
  });

  // Handle command execution
  terminalInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const command = terminalInput.value.trim();
      if (!command) return;

      history.push(command);
      historyIndex = history.length;

      // Print prompt line
      printToTerminal(`shreya@portfolio:~$ ${command}`);
      terminalInput.value = '';

      if (command.toLowerCase() === 'clear') {
        terminalOutput.innerHTML = '';
        return;
      }

      if (command.toLowerCase() === 'exit') {
        terminalDrawer.classList.remove('active');
        return;
      }

      // Client-side theme switcher support
      if (command.toLowerCase().startsWith('theme ')) {
        const themeName = command.split(' ')[1];
        const validThemes = ['cyber', 'matrix', 'nebula', 'clean'];
        if (validThemes.includes(themeName)) {
          document.documentElement.setAttribute('data-theme', themeName);
          localStorage.setItem('shreya_portfolio_theme', themeName);
          printToTerminal(`[SYSTEM]: Switched theme to "${themeName}".`);
          const selector = document.getElementById('theme-select');
          if (selector) selector.value = themeName;
          return;
        } else {
          printToTerminal(`[ERROR]: Unknown theme "${themeName}". Valid themes: cyber, matrix, nebula, clean.`);
          return;
        }
      }

      // Fetch response from /api/terminal
      try {
        const res = await fetch('/api/terminal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command })
        });
        const data = await res.json();
        printToTerminal(data.output);
      } catch (err) {
        printToTerminal(`[NETWORK ERROR]: Failed to reach terminal daemon. (${err.message})`);
      }
    } else if (e.key === 'ArrowUp') {
      if (history.length > 0 && historyIndex > 0) {
        historyIndex--;
        terminalInput.value = history[historyIndex];
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (historyIndex < history.length - 1) {
        historyIndex++;
        terminalInput.value = history[historyIndex];
      } else {
        historyIndex = history.length;
        terminalInput.value = '';
      }
      e.preventDefault();
    }
  });

  function printToTerminal(text) {
    const div = document.createElement('div');
    div.className = 'terminal-entry';
    div.innerText = text;
    terminalOutput.appendChild(div);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }
})();
