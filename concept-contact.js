(() => {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

  const dialog = document.createElement('dialog');
  dialog.className = 'mission-dialog';
  dialog.setAttribute('aria-labelledby', 'mission-title');
  dialog.innerHTML = `
    <div class="modal-head"><span>Next · PDAC 2027</span><button class="modal-close" type="button" aria-label="Fechar">×</button></div>
    <div class="modal-body">
      <section class="modal-step" data-step="1">
        <h2 id="mission-title">O que traz você a Toronto?</h2>
        <p>Conte um pouco sobre seu objetivo para começarmos a desenhar a missão.</p>
        <fieldset class="modal-options"><legend>Seu principal interesse</legend>
          <button type="button" class="modal-choice" aria-pressed="false" data-goal="Atrair investimento">Atrair investimento</button>
          <button type="button" class="modal-choice" aria-pressed="false" data-goal="Gerar negócios">Gerar negócios</button>
          <button type="button" class="modal-choice" aria-pressed="false" data-goal="Criar parcerias">Criar parcerias</button>
          <button type="button" class="modal-choice" aria-pressed="false" data-goal="Representar uma instituição">Representar uma instituição</button>
        </fieldset>
        <button class="modal-next" type="button" disabled>Continuar <span aria-hidden="true">→</span></button>
      </section>
      <section class="modal-step" data-step="2" hidden>
        <button class="modal-back" type="button">← Alterar objetivo</button>
        <h2>Vamos fazer a conexão.</h2>
        <div class="modal-summary"><strong>Sua missão PDAC 2027</strong><span id="mission-summary"></span></div>
        <form class="modal-form">
          <div class="modal-form-grid">
            <label>Seu nome<input name="nome" autocomplete="name" required maxlength="100" placeholder="Como podemos chamar você?"></label>
            <label>Empresa ou instituição<input name="empresa" autocomplete="organization" maxlength="140" placeholder="Onde você atua? (opcional)"></label>
            <label>Formato de interesse<select name="pacote"><option value="Quero ajuda para escolher">Quero ajuda para escolher</option><option>Experiência Essencial</option><option>Agenda de Negócios</option><option>Missão Executiva</option></select></label>
          </div>
          <a class="modal-send" target="_blank" rel="noopener">Continuar no WhatsApp <span aria-hidden="true">↗</span></a>
          <p class="modal-note">Você revisa a mensagem no WhatsApp antes de enviar. A Next usa essas informações para conversar com você sobre a missão.</p>
        </form>
      </section>
    </div>`;
  document.body.append(dialog);
  const firstStep = dialog.querySelector('[data-step="1"]');
  const secondStep = dialog.querySelector('[data-step="2"]');
  const next = dialog.querySelector('.modal-next');
  const form = dialog.querySelector('form');
  const send = dialog.querySelector('.modal-send');
  const title = dialog.querySelector('#mission-title');
  let goal = '';
  let opener;

  function updateMessage() {
    const name = form.elements.nome.value.trim();
    const company = form.elements.empresa.value.trim();
    const message = [
      `Olá, Next! Sou ${name || 'eu'}${company ? ', da ' + company : ''}.`,
      'Tenho interesse na missão PDAC 2027, em Toronto (7 a 10 de março).',
      `Meu objetivo: ${goal}.`,
      `Formato de interesse: ${form.elements.pacote.value}.`,
      'Podemos conversar?'
    ].join('\n');
    const number = String(window.NEXT_CONFIG?.WHATSAPP_NUMBER || '').replace(/\D/g, '');
    send.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    dialog.querySelector('#mission-summary').textContent = `${goal} · 7 a 10 de março · Toronto`;
  }

  function close() {
    dialog.close();
  }
  dialog.querySelector('.modal-close').addEventListener('click', close);
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    opener?.focus();
  });
  dialog.querySelectorAll('[data-goal]').forEach(button => {
    button.addEventListener('click', () => {
      goal = button.dataset.goal;
      dialog.querySelectorAll('[data-goal]').forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
      next.disabled = false;
      updateMessage();
    });
  });
  next.addEventListener('click', () => {
    if (!goal) return;
    firstStep.hidden = true;
    secondStep.hidden = false;
    dialog.setAttribute('aria-label', 'Vamos fazer a conexão');
    dialog.removeAttribute('aria-labelledby');
    updateMessage();
    dialog.scrollTop = 0;
    form.elements.nome.focus();
  });
  dialog.querySelector('.modal-back').addEventListener('click', () => {
    firstStep.hidden = false;
    secondStep.hidden = true;
    dialog.setAttribute('aria-labelledby', title.id);
    dialog.removeAttribute('aria-label');
    dialog.querySelector('[aria-pressed="true"]')?.focus();
  });
  form.addEventListener('input', updateMessage);
  form.addEventListener('change', updateMessage);
  form.addEventListener('submit', event => event.preventDefault());
  send.addEventListener('click', event => {
    if (!form.reportValidity() || !form.elements.nome.value.trim()) {
      event.preventDefault();
      form.elements.nome.focus();
    }
  });
  document.querySelectorAll('[data-contact]').forEach(button => {
    button.addEventListener('click', () => {
      opener = button;
      firstStep.hidden = false;
      secondStep.hidden = true;
      dialog.setAttribute('aria-labelledby', title.id);
      dialog.removeAttribute('aria-label');
      form.elements.pacote.value = button.dataset.package || 'Quero ajuda para escolher';
      updateMessage();
      dialog.showModal();
      document.body.classList.add('modal-open');
    });
  });
})();
