document.addEventListener("DOMContentLoaded", async () => {
  const greetingText = document.getElementById("greetingText");

  function getOrAskName() {
    let name = localStorage.getItem("swiss-tab:name");

    if (!name) {
      name = prompt("Bitte gib deinen Namen ein:");

      if (name && name.trim() !== "") {
        localStorage.setItem("swiss-tab:name", name.trim());
      } else {
        name = "Gast";
      }
    }

    return name;
  }

  function updateGreeting() {
    const name = getOrAskName();
    greetingText.textContent = `Grüezi ${name}`;
  }

  let backgrounds = [];

  const quotes = [
    { de: "Geduld ist Gold wert.", en: "Patience is gold." },
    { de: "Schritt für Schritt zum Ziel.", en: "Step by step to the goal." },
    { de: "Wer durchhält, wird stark.", en: "The one who endures grows strong." },
    { de: "Die Wahrheit setzt sich durch.", en: "Truth prevails." },
    { de: "Arbeit baut die Zukunft.", en: "Work builds the future." }
  ];

  const timeEl = document.getElementById("time");
  const dateEl = document.getElementById("date");
  const quoteEl = document.getElementById("quote");
  const translationEl = document.getElementById("translation");
  const photoLinkEl = document.getElementById("photoLink");
  const inputEl = document.getElementById("todoInput");
  const listEl = document.getElementById("todoList");

  const storageKeys = {
    photo: "swiss-tab:last-photo",
    todos: "swiss-tab:todos"
  };

  async function fetchGitHubImages() {
    try {
      const res = await fetch("https://api.github.com/repos/omaxx101/SwitzerlandTab/contents/Swizz");
      const data = await res.json();


      backgrounds = data
        .filter(file =>
          file.type === "file" &&
          /\.(jpg|jpeg|png|webp)$/i.test(file.name)
        )
        .map(file => ({
          url: file.download_url,
          title: formatTitle(file.name),
          source: file.html_url
        }));

    } catch (err) {
      console.error("GitHub fetch failed:", err);
    }
  }

  function formatTitle(name) {
    return name
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  function selectIndex(items, key) {
    const lastIndex = Number.parseInt(localStorage.getItem(key) || "-1", 10);
    let index = Math.floor(Math.random() * items.length);

    if (items.length > 1) {
      while (index === lastIndex) {
        index = Math.floor(Math.random() * items.length);
      }
    }

    localStorage.setItem(key, String(index));
    return index;
  }

  function setBackground() {
    if (!backgrounds.length) return;

    const bg = backgrounds[selectIndex(backgrounds, storageKeys.photo)];

    document.body.style.backgroundImage = [
      "linear-gradient(120deg, rgba(8, 17, 24, 0.76), rgba(8, 17, 24, 0.26))",
      "radial-gradient(circle at top left, rgba(255, 0, 0, 0.25), transparent 30%)",
      `url("${bg.url}")`
    ].join(", ");

    if (photoLinkEl) photoLinkEl.href = bg.source;
  }

  function updateTime() {
    const now = new Date();

    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString("de-CH", {
        timeZone: "Europe/Zurich",
        hour: "2-digit",
        minute: "2-digit"
      });
    }

    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString("de-CH", {
        timeZone: "Europe/Zurich",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    }
  }

  function setQuote() {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    if (quoteEl) quoteEl.textContent = q.de;
    if (translationEl) translationEl.textContent = q.en;
  }

  function loadTodos() {
    try {
      return JSON.parse(localStorage.getItem(storageKeys.todos) || "[]");
    } catch {
      return [];
    }
  }

  let todos = loadTodos();

  function saveTodos() {
    localStorage.setItem(storageKeys.todos, JSON.stringify(todos));
  }

  function renderTodos() {
    if (!listEl) return;

    listEl.innerHTML = "";
    if (!todos.length) return;

    todos.forEach(todo => {
      const li = document.createElement("li");
      li.className = `todo-item${todo.done ? " done" : ""}`;

      const text = document.createElement("span");
      text.className = "todo-copy";
      text.textContent = todo.text;

      const actions = document.createElement("div");
      actions.className = "todo-actions";

      const toggle = document.createElement("button");
      toggle.textContent = todo.done ? "✔" : "○";

      toggle.onclick = () => {
        todos = todos.map(t => t.id === todo.id ? { ...t, done: !t.done } : t);
        saveTodos();
        renderTodos();
      };

      const del = document.createElement("button");
      del.textContent = "×";

      del.onclick = () => {
        todos = todos.filter(t => t.id !== todo.id);
        saveTodos();
        renderTodos();
      };

      actions.append(toggle, del);
      li.append(text, actions);
      listEl.appendChild(li);
    });
  }

  inputEl?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const text = inputEl.value.trim();
    if (!text) return;

    todos = [{ id: Date.now(), text, done: false }, ...todos];
    inputEl.value = "";

    saveTodos();
    renderTodos();
  });

  await fetchGitHubImages();
  setBackground();
  updateGreeting();
  setQuote();
  updateTime();
  renderTodos();
  setInterval(updateTime, 1000);
});