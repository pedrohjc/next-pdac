(() => {
  const eventStart = new Date("2027-03-07T09:00:00-05:00").getTime();
  function updateCountdown() {
    const remaining = Math.max(0, Math.floor((eventStart - Date.now()) / 1000));
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const pad = (value) => String(value).padStart(2, "0");
    document.getElementById("event-countdown").textContent = remaining
      ? `Faltam ${days} dias · ${pad(hours)}h ${pad(minutes)}min`
      : "Missão PDAC 2027 · Toronto";
  }
  updateCountdown();
  setInterval(updateCountdown, 60000);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((element) => observer.observe(element));

  const menu = document.querySelector(".mobile-menu");
  menu.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      menu.open = false;
    }),
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") menu.open = false;
  });
  document.addEventListener("click", (event) => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });

  const profiles = {
    min: {
      value: "Mineradora",
      label: "Para mineradoras",
      title: "Seu projeto.<br>No radar certo.",
      copy: "Aproximar projetos, capital e parceiros técnicos, com uma agenda alinhada ao estágio da sua operação.",
      points: [
        "Apresentação de projetos e oportunidades",
        "Conexões com investidores e empresas",
        "Relacionamento com o ecossistema mineral",
      ],
    },
    emp: {
      value: "Empresa do setor",
      label: "Para empresas do setor",
      title: "Sua solução.<br>Na conversa certa.",
      copy: "Explorar conexões comerciais e tecnológicas com as empresas que fazem parte do mercado mineral.",
      points: [
        "Tecnologia, equipamentos e serviços",
        "Prospecção de parceiros comerciais",
        "Leitura de oportunidades nos pavilhões",
      ],
    },
    inv: {
      value: "Investidor",
      label: "Para investidores",
      title: "Novas perspectivas.<br>Decisões com contexto.",
      copy: "Conhecer projetos, pessoas e temas do setor para ampliar sua visão sobre o mercado de mineração.",
      points: [
        "Contato com projetos e empreendedores",
        "Conexões com o ecossistema mineral",
        "Agenda alinhada à sua tese de interesse",
      ],
    },
    gov: {
      value: "Governo ou instituição",
      label: "Para governos e instituições",
      title: "Seu território.<br>No mapa das conexões.",
      copy: "Uma missão voltada à representação institucional, ao relacionamento e à apresentação de oportunidades.",
      points: [
        "Planejamento para delegações",
        "Agenda institucional e networking",
        "Presença coordenada no Canadá",
      ],
    },
  };
  const tabs = [...document.querySelectorAll("[data-profile]")];
  function selectProfile(tab) {
    const profile = profiles[tab.dataset.profile];
    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });
    document
      .getElementById("profile-panel")
      .setAttribute("aria-labelledby", tab.id);
    document.getElementById("profile-label").textContent = profile.label;
    document.getElementById("profile-title").innerHTML = profile.title;
    document.getElementById("profile-copy").textContent = profile.copy;
    document.getElementById("profile-list").replaceChildren(
      ...profile.points.map((text) => {
        const item = document.createElement("li");
        item.textContent = text;
        return item;
      }),
    );
    document.getElementById("profile-start").dataset.startProfile =
      tab.dataset.profile;
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectProfile(tab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
        return;
      event.preventDefault();
      let next = index;
      if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else
        next =
          (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
          tabs.length;
      tabs[next].focus();
      selectProfile(tabs[next]);
    });
  });

  const form = document.getElementById("briefing");
  const steps = [...form.querySelectorAll(".brief-step")];
  const indicators = [...form.querySelectorAll("[data-indicator]")];
  const error = document.getElementById("brief-error");
  const nextButton = document.getElementById("brief-next");
  const backButton = document.getElementById("brief-back");
  const send = document.getElementById("brief-send");
  let currentStep = 0;

  function values() {
    const data = new FormData(form);
    return {
      perfil: data.get("perfil") || "",
      objetivo: data.getAll("objetivo"),
      pessoas: data.get("pessoas") || "",
      pacote: data.get("pacote"),
      temas: String(data.get("temas") || "").trim(),
      nome: String(data.get("nome") || "").trim(),
      empresa: String(data.get("empresa") || "").trim(),
    };
  }

  function updateBriefing() {
    const data = values();
    document.querySelector('[data-summary="perfil"]').textContent =
      data.perfil || "Vamos descobrir juntos.";
    document.querySelector('[data-summary="objetivo"]').textContent = data
      .objetivo.length
      ? data.objetivo.join(" · ")
      : "O que você quer construir?";
    document.querySelector('[data-summary="missao"]').textContent =
      [
        data.pessoas,
        data.pacote === "Quero ajuda para escolher" ? "" : data.pacote,
      ]
        .filter(Boolean)
        .join(" · ") || "Feita para o seu momento.";
    const message = [
      `Olá, Next! Sou ${data.nome || "eu"}${data.empresa ? ", da " + data.empresa : ""}.`,
      "Tenho interesse na Missão PDAC 2027, em Toronto (7 a 10 de março).",
      "",
      `Perfil: ${data.perfil}`,
      `Objetivo: ${data.objetivo.join(", ")}`,
      `Grupo: ${data.pessoas}`,
      `Formato: ${data.pacote}`,
    ];
    if (data.temas) message.push(`Temas prioritários: ${data.temas}`);
    message.push("", "Podemos planejar minha missão?");
    const number = String(window.NEXT_CONFIG?.WHATSAPP_NUMBER || "").replace(
      /\D/g,
      "",
    );
    send.href = `https://wa.me/${number}?text=${encodeURIComponent(message.join("\n"))}`;
  }

  function showStep(index, focus = false) {
    currentStep = index;
    steps.forEach((step, stepIndex) => {
      step.hidden = stepIndex !== index;
    });
    indicators.forEach((indicator, stepIndex) => {
      indicator.classList.toggle("active", stepIndex === index);
      indicator.classList.toggle("complete", stepIndex < index);
      if (stepIndex === index) indicator.setAttribute("aria-current", "step");
      else indicator.removeAttribute("aria-current");
    });
    backButton.hidden = index === 0;
    nextButton.hidden = index === steps.length - 1;
    send.hidden = index !== steps.length - 1;
    error.textContent = "";
    if (focus)
      steps[index]
        .querySelector("input, select")
        ?.focus({ preventScroll: true });
  }

  function validateStep(index) {
    const data = values();
    if (index === 0 && !data.perfil)
      return "Escolha o perfil que melhor representa você.";
    if (index === 0 && !data.objetivo.length)
      return "Escolha pelo menos um objetivo para a missão.";
    if (index === 1 && !data.pessoas)
      return "Conte quantas pessoas vão participar.";
    if (index === 2 && !data.nome)
      return "Preencha seu nome para preparar a mensagem.";
    return "";
  }

  nextButton.addEventListener("click", () => {
    const problem = validateStep(currentStep);
    if (problem) {
      error.textContent = problem;
      return;
    }
    showStep(currentStep + 1, true);
    updateBriefing();
  });
  backButton.addEventListener("click", () => showStep(currentStep - 1, true));
  form.addEventListener("input", () => {
    error.textContent = "";
    updateBriefing();
  });
  form.addEventListener("change", () => {
    error.textContent = "";
    updateBriefing();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (currentStep < steps.length - 1) nextButton.click();
    else send.click();
  });
  send.addEventListener("click", (event) => {
    for (let index = 0; index < steps.length; index++) {
      const problem = validateStep(index);
      if (!problem) continue;
      event.preventDefault();
      showStep(index, true);
      error.textContent = problem;
      return;
    }
    updateBriefing();
  });
  document.querySelectorAll("[data-start-package]").forEach((link) => {
    link.addEventListener("click", () => {
      form.elements.pacote.value = link.dataset.startPackage;
      updateBriefing();
    });
  });
  document.querySelectorAll("[data-start-profile]").forEach((link) => {
    link.addEventListener("click", () => {
      const value = profiles[link.dataset.startProfile].value;
      [...form.querySelectorAll('[name="perfil"]')].forEach((input) => {
        input.checked = input.value === value;
      });
      showStep(0);
      updateBriefing();
    });
  });
  showStep(0);
  updateBriefing();
})();
