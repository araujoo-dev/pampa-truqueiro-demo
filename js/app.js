import { startGame, stopGame } from './game-ui.js';

  const splashScreen = document.getElementById('splashScreen');
  const menuScreen = document.getElementById('menuScreen');
  const splashFrame = document.getElementById('splashFrame');
  const modalVeil = document.getElementById('modalVeil');
  const toast = document.getElementById('toast');

  function goToMenu(){
    splashScreen.classList.remove('active');
    menuScreen.classList.add('active');
  }
  splashFrame.addEventListener('click', goToMenu);
  window.addEventListener('keydown', (e)=>{
    if(splashScreen.classList.contains('active') && (e.key === 'Enter' || e.key === ' ')){
      goToMenu();
    }
  });

  let toastTimer;
  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> toast.classList.remove('show'), 2200);
  }

  const menuScreenEl = document.getElementById('menuScreen');
  const modeScreen = document.getElementById('modeScreen');

  document.getElementById('btnIniciar').addEventListener('click', ()=>{
    menuScreenEl.classList.remove('active');
    modeScreen.classList.add('active');
  });

  document.getElementById('btnBack').addEventListener('click', ()=>{
    modeScreen.classList.remove('active');
    menuScreenEl.classList.add('active');
  });

  document.getElementById('btn1v1').addEventListener('click', ()=>{
    showToast('MESA 1 v 1 LOCAL EM CONSTRUÇÃO...');
  });

  document.getElementById('btn1vUI').addEventListener('click', ()=>{
    modeScreen.classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    startGame();
  });

  document.getElementById('btnConfig').addEventListener('click', ()=>{
    modalVeil.classList.add('active');
  });
  document.getElementById('btnFechar').addEventListener('click', ()=>{
    modalVeil.classList.remove('active');
  });
  document.getElementById('btnSalvar').addEventListener('click', ()=>{
    modalVeil.classList.remove('active');
    showToast('CONFIGURAÇÕES SALVAS');
  });
  modalVeil.addEventListener('click', (e)=>{
    if(e.target === modalVeil) modalVeil.classList.remove('active');
  });

  document.getElementById('btnGameBack').addEventListener('click', ()=>{
    stopGame();
    document.getElementById('gameScreen').classList.remove('active');
    menuScreenEl.classList.add('active');
  });

  document.getElementById('btnGameConfig').addEventListener('click', ()=>{
    modalVeil.classList.add('active');
  });
