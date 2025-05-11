document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("rows-container");
  const addButton = document.getElementById("add-row");
  const saveButton = document.getElementById("save");
  const toast = document.getElementById("toast");

  function createRow(name = "", prompt = "") {
    const row = document.createElement("div");
    row.className = "row";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Button Name";
    nameInput.value = name;

    const promptInput = document.createElement("textarea");
    promptInput.placeholder = "Prompt";
    promptInput.value = prompt;

    const clearButton = document.createElement("button");
    clearButton.className = "clear-btn";
    clearButton.textContent = "Clear";
    clearButton.onclick = () => row.remove();

    row.appendChild(nameInput);
    row.appendChild(promptInput);
    row.appendChild(clearButton);

    container.appendChild(row);
  }

  async function savePrompts() {
    const rows = container.querySelectorAll(".row");
    const prompts = [];

    rows.forEach(row => {
      const inputs = row.querySelectorAll("input, textarea");
      const name = inputs[0].value.trim();
      const prompt = inputs[1].value.trim();
      if (name || prompt) {
        prompts.push({ name, prompt });
      }
    });

    await browser.storage.local.set({ prompts });
    showToast("Data saved successfully!");
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
      toast.classList.add("hide");
    }, 3000);

    setTimeout(() => {
      toast.classList.remove("hide");
    }, 3500);
  }

  async function loadPrompts() {
    const result = await browser.storage.local.get("prompts");
    const prompts = result.prompts || [];
    prompts.forEach(p => createRow(p.name, p.prompt));
    if (prompts.length === 0) createRow();
  }

  addButton.addEventListener("click", () => createRow());
  saveButton.addEventListener("click", savePrompts);

  await loadPrompts();
});
