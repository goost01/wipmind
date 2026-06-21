/**
 * Módulo Pomodoro — temporizador con ciclos y alertas.
 */

const Pomodoro = (() => {
  let workMinutes = 25;
  let breakMinutes = 5;
  let longBreakMinutes = 15;
  let cyclesBeforeLong = 4;

  let secondsLeft = 0;
  let isRunning = false;
  let isBreak = false;
  let cyclesDone = 0;
  let sessionId = null;
  let ticker = null;

  const WORK_PHASE  = 'Sesión de trabajo';
  const BREAK_PHASE = 'Descanso activo';
  const LONG_BREAK  = 'Descanso largo';

  function init(config = {}) {
    workMinutes       = config.work  ?? 25;
    breakMinutes      = config.bbreak ?? 5;
    longBreakMinutes  = config.longBreak ?? 15;
    cyclesBeforeLong  = config.cycles ?? 4;
    reset();
  }

  function reset() {
    clearInterval(ticker);
    isRunning = false;
    isBreak = false;
    secondsLeft = workMinutes * 60;
    render();
  }

  function toggle() {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }

  async function start() {
    if (!sessionId) {
      try {
        const s = await WipMindAPI.Tasks.startPomodoro({});
        sessionId = s.id;
      } catch (e) {
        sessionId = null;
      }
    }
    isRunning = true;
    ticker = setInterval(tick, 1000);
    render();
  }

  function pause() {
    isRunning = false;
    clearInterval(ticker);
    render();
  }

  function tick() {
    if (secondsLeft > 0) {
      secondsLeft--;
      render();
    } else {
      onPhaseEnd();
    }
  }

  async function onPhaseEnd() {
    clearInterval(ticker);
    isRunning = false;

    if (!isBreak) {
      cyclesDone++;
      if (sessionId) {
        await WipMindAPI.Tasks.completeCycle(sessionId, false).catch(() => {});
      }
      notifyPhaseEnd(BREAK_PHASE);
      isBreak = true;
      const isLong = cyclesDone % cyclesBeforeLong === 0;
      secondsLeft = (isLong ? longBreakMinutes : breakMinutes) * 60;
    } else {
      notifyPhaseEnd(WORK_PHASE);
      isBreak = false;
      secondsLeft = workMinutes * 60;
    }

    render();
    renderCycles();
  }

  function notifyPhaseEnd(nextPhase) {
    Toast.info(`⏱ Cambio de fase: ${nextPhase}`);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('WipMind', { body: `Hora de: ${nextPhase}` });
    }
    playBeep();
  }

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (_) {}
  }

  function render() {
    const timerEl = document.getElementById('pomodoro-timer');
    const phaseEl = document.getElementById('pomodoro-phase');
    const btnEl   = document.getElementById('pomodoro-btn');
    if (!timerEl) return;

    const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const secs = String(secondsLeft % 60).padStart(2, '0');
    timerEl.textContent = `${mins}:${secs}`;

    if (phaseEl) {
      phaseEl.textContent = isBreak
        ? (cyclesDone % cyclesBeforeLong === 0 ? LONG_BREAK : BREAK_PHASE)
        : WORK_PHASE;
    }

    if (btnEl) {
      btnEl.textContent = isRunning ? '⏸ Pausar' : '▶ Iniciar';
      btnEl.className = `btn ${isRunning ? 'btn-ghost' : 'btn-primary'}`;
    }
  }

  function renderCycles() {
    const container = document.getElementById('pomodoro-cycles');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < cyclesBeforeLong; i++) {
      const dot = document.createElement('div');
      dot.className = `cycle-dot${i < cyclesDone % cyclesBeforeLong ? ' done' : ''}`;
      container.appendChild(dot);
    }
  }

  return { init, toggle, reset };
})();

window.Pomodoro = Pomodoro;
