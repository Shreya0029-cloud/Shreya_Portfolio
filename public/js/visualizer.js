// Interactive Algorithm Visualizer & Fraud Simulation Widget
(function () {
  // 1. Algorithm Visualizer
  const canvasArea = document.getElementById('viz-canvas-area');
  const algoSelect = document.getElementById('viz-algo-select');
  const btnRunAlgo = document.getElementById('btn-viz-run');
  const vizLog = document.getElementById('viz-status-log');

  if (canvasArea && btnRunAlgo) {
    let array = [];
    const ARRAY_SIZE = 14;

    function resetArray() {
      array = [];
      canvasArea.innerHTML = '';
      for (let i = 0; i < ARRAY_SIZE; i++) {
        const val = Math.floor(Math.random() * 80) + 20;
        array.push(val);
        const bar = document.createElement('div');
        bar.className = 'viz-bar';
        bar.style.height = `${val * 1.5}px`;
        bar.setAttribute('data-val', val);
        canvasArea.appendChild(bar);
      }
      if (vizLog) vizLog.innerText = 'Array initialized. Click "Simulate" to execute algorithm visualization.';
    }

    resetArray();

    async function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function bubbleSort() {
      const bars = canvasArea.querySelectorAll('.viz-bar');
      const n = array.length;

      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          bars[j].classList.add('active');
          bars[j + 1].classList.add('active');
          vizLog.innerText = `Step: Comparing index ${j} (${array[j]}) with index ${j + 1} (${array[j + 1]})...`;

          await sleep(150);

          if (array[j] > array[j + 1]) {
            // Swap
            let temp = array[j];
            array[j] = array[j + 1];
            array[j + 1] = temp;

            bars[j].style.height = `${array[j] * 1.5}px`;
            bars[j + 1].style.height = `${array[j + 1] * 1.5}px`;
            vizLog.innerText = `⚡ Swapped: ${array[j + 1]} > ${array[j]}`;
          }

          bars[j].classList.remove('active');
          bars[j + 1].classList.remove('active');
        }
        bars[n - i - 1].classList.add('sorted');
      }
      bars[0].classList.add('sorted');
      vizLog.innerText = '✓ Algorithm complete! All 14 elements sorted in ascending order.';
    }

    async function binarySearch() {
      // First sort array
      array.sort((a, b) => a - b);
      const bars = canvasArea.querySelectorAll('.viz-bar');
      for (let i = 0; i < array.length; i++) {
        bars[i].style.height = `${array[i] * 1.5}px`;
        bars[i].className = 'viz-bar';
      }

      const target = array[Math.floor(Math.random() * array.length)];
      vizLog.innerText = `Binary Search Target: ${target}. Initial search bounds [0, ${array.length - 1}].`;
      await sleep(400);

      let low = 0;
      let high = array.length - 1;

      while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        bars[mid].classList.add('active');
        vizLog.innerText = `Probing mid index ${mid} (val: ${array[mid]}). Target: ${target}.`;
        await sleep(400);

        if (array[mid] === target) {
          bars[mid].className = 'viz-bar sorted';
          vizLog.innerText = `✓ FOUND! Element ${target} located at index ${mid} with O(log n) efficiency.`;
          return;
        } else if (array[mid] < target) {
          for (let k = low; k <= mid; k++) {
            bars[k].style.opacity = '0.3';
          }
          low = mid + 1;
        } else {
          for (let k = mid; k <= high; k++) {
            bars[k].style.opacity = '0.3';
          }
          high = mid - 1;
        }
      }
    }

    btnRunAlgo.addEventListener('click', async () => {
      btnRunAlgo.disabled = true;
      const algo = algoSelect ? algoSelect.value : 'bubble';

      if (algo === 'bubble') {
        resetArray();
        await sleep(200);
        await bubbleSort();
      } else if (algo === 'binary') {
        await binarySearch();
      }

      btnRunAlgo.disabled = false;
    });
  }

  // 2. CipherShield Interactive Fraud Simulation Widget
  const pgForm = document.getElementById('fraud-sim-form');
  const pgResultBox = document.getElementById('pg-result-display');

  if (pgForm && pgResultBox) {
    pgForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const amount = document.getElementById('pg-amount').value;
      const location = document.getElementById('pg-location').value;
      const prevLocation = document.getElementById('pg-prev-location').value;
      const timeDeltaMinutes = document.getElementById('pg-timedelta').value;
      const isVpn = document.getElementById('pg-vpn').checked;
      const deviceChanged = document.getElementById('pg-device').checked;

      const submitBtn = pgForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Evaluating ML Risk Model...';

      try {
        const res = await fetch('/api/fraud-simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            location,
            prevLocation,
            timeDeltaMinutes,
            isVpn,
            deviceChanged
          })
        });
        const data = await res.json();

        pgResultBox.classList.add('active');
        const color = data.classification === 'CRITICAL_FRAUD' ? '#EF4444' : data.classification === 'SUSPICIOUS_REVIEW' ? '#F59E0B' : '#10B981';

        pgResultBox.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:0.75rem;">
            <div>
              <span style="font-family:'JetBrains Mono'; font-size:0.75rem; color:#88A8CC;">Transaction ID: ${data.transactionId}</span>
              <h4 style="font-size:1.2rem; font-weight:700; color:${color}; margin-top:0.2rem;">${data.classification}</h4>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.75rem; color:#88A8CC; display:block;">Calculated Risk Score</span>
              <span style="font-size:1.8rem; font-weight:800; font-family:'Space Grotesk'; color:${color};">${data.riskPercentage}</span>
            </div>
          </div>
          <div style="margin-bottom:0.75rem;">
            <strong style="font-size:0.85rem; color:#E2E8F0;">Automated SOC Action:</strong>
            <span style="display:inline-block; margin-left:0.5rem; font-family:'JetBrains Mono'; font-size:0.8rem; background:rgba(255,255,255,0.06); padding:0.2rem 0.6rem; border-radius:4px; color:${color}; font-weight:600;">${data.action}</span>
          </div>
          <div>
            <strong style="font-size:0.85rem; color:#E2E8F0; display:block; margin-bottom:0.35rem;">Model Signal &amp; Audit Flags:</strong>
            <ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:0.3rem;">
              ${data.flags.map(f => `<li style="font-family:'JetBrains Mono'; font-size:0.8rem; color:#94A3B8;">▹ ${f}</li>`).join('')}
            </ul>
          </div>
        `;
      } catch (err) {
        pgResultBox.classList.add('active');
        pgResultBox.innerHTML = `<p style="color:#EF4444;">Simulation error: ${err.message}</p>`;
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Run Fraud Detection ML Model';
      }
    });
  }
})();
