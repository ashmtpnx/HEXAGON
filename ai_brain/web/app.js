// AI Brain Memory Dashboard Client Application
document.addEventListener("DOMContentLoaded", () => {
  let allMemories = [];
  let currentCategory = "all";
  let currentSearch = "";
  let currentImportance = 0;

  // DOM Elements
  const memoriesGrid = document.getElementById("memories-grid");
  const noResults = document.getElementById("no-results");
  const memoriesCountText = document.getElementById("memories-count-text");
  const searchInput = document.getElementById("search-input");
  const btnClearSearch = document.getElementById("btn-clear-search");
  const sortImportance = document.getElementById("sort-importance");
  const categoryFilters = document.getElementById("category-filters");

  // Stats Elements
  const statTotal = document.getElementById("stat-total");
  const statModel = document.getElementById("stat-model");
  const statImportance = document.getElementById("stat-importance");
  const statSyncTime = document.getElementById("stat-sync-time");

  // Working State Elements
  const stateTask = document.getElementById("state-task");
  const stateBlockers = document.getElementById("state-blockers");
  const stateGoals = document.getElementById("state-goals");
  const btnSaveState = document.getElementById("btn-save-state");

  // Modals
  const memoryModal = document.getElementById("memory-modal");
  const memoryForm = document.getElementById("memory-form");
  const modalTitle = document.getElementById("modal-title");
  const memId = document.getElementById("mem-id");
  const memTitle = document.getElementById("mem-title");
  const memCategory = document.getElementById("mem-category");
  const memImportance = document.getElementById("mem-importance");
  const memContent = document.getElementById("mem-content");
  const memTags = document.getElementById("mem-tags");
  const memModel = document.getElementById("mem-model");

  const btnAddMemory = document.getElementById("btn-add-memory");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const btnCancelModal = document.getElementById("btn-cancel-modal");

  const exportModal = document.getElementById("export-modal");
  const exportText = document.getElementById("export-text");
  const btnExportPrompt = document.getElementById("btn-export-prompt");
  const btnCloseExport = document.getElementById("btn-close-export");
  const btnCancelExport = document.getElementById("btn-cancel-export");
  const btnCopyExport = document.getElementById("btn-copy-export");
  const copyStatus = document.getElementById("copy-status");

  const btnSyncGit = document.getElementById("btn-sync-git");

  // Fetch initial data
  loadAllData();

  async function loadAllData() {
    await Promise.all([loadStats(), loadWorkingState(), loadMemories()]);
  }

  // Load Stats
  async function loadStats() {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.stats) {
        statTotal.textContent = data.stats.total || 0;
        statImportance.textContent = data.stats.avg_importance || "0.0";
        statSyncTime.textContent = "Synced";
      }
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  }

  // Load Working State
  async function loadWorkingState() {
    try {
      const res = await fetch("/api/state");
      const data = await res.json();
      if (data.state) {
        stateTask.value = data.state.active_task ? data.state.active_task.value : "";
        stateBlockers.value = data.state.blockers ? data.state.blockers.value : "";
        stateGoals.value = data.state.active_goals ? data.state.active_goals.value : "";
        if (data.state.last_model) {
          statModel.textContent = data.state.last_model.value || "Unknown";
        }
      }
    } catch (err) {
      console.error("Failed to load working state", err);
    }
  }

  // Load Memories
  async function loadMemories() {
    try {
      const res = await fetch("/api/memories?limit=100");
      const data = await res.json();
      allMemories = data.memories || [];
      renderMemories();
    } catch (err) {
      console.error("Failed to load memories", err);
      showToast("Failed to fetch memories from server", "error");
    }
  }

  // Render Memories Grid
  function renderMemories() {
    const filtered = allMemories.filter((m) => {
      // Category filter
      if (currentCategory !== "all" && m.category.toLowerCase() !== currentCategory.toLowerCase()) {
        return false;
      }
      // Importance filter
      if (currentImportance > 0 && m.importance < currentImportance) {
        return false;
      }
      // Search filter
      if (currentSearch) {
        const q = currentSearch.toLowerCase();
        const inTitle = (m.title || "").toLowerCase().includes(q);
        const inContent = (m.content || "").toLowerCase().includes(q);
        const inTags = (m.tags || "").toLowerCase().includes(q);
        if (!inTitle && !inContent && !inTags) return false;
      }
      return true;
    });

    memoriesCountText.textContent = `Showing ${filtered.length} Memories`;

    if (filtered.length === 0) {
      memoriesGrid.innerHTML = "";
      noResults.style.display = "block";
      return;
    }

    noResults.style.display = "none";
    memoriesGrid.innerHTML = filtered.map((m) => createMemoryCardHtml(m)).join("");

    // Attach card event listeners
    document.querySelectorAll(".btn-edit-memory").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        openEditModal(id);
      });
    });

    document.querySelectorAll(".btn-delete-memory").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        if (confirm(`Are you sure you want to delete memory #${id}?`)) {
          await deleteMemory(id);
        }
      });
    });
  }

  function createMemoryCardHtml(m) {
    const stars = "★".repeat(m.importance) + "☆".repeat(Math.max(0, 5 - m.importance));
    const cat = (m.category || "general").toLowerCase();
    const tagsHtml = m.tags
      ? m.tags.split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .map((t) => `<span class="tag-chip">#${escapeHtml(t)}</span>`)
          .join("")
      : "";

    return `
      <div class="memory-card">
        <div class="card-top">
          <span class="badge badge-${cat}">${cat}</span>
          <span class="importance-stars" title="Importance: ${m.importance}/5">${stars}</span>
        </div>
        <h4 class="card-title">${escapeHtml(m.title)}</h4>
        <div class="card-content">${escapeHtml(m.content)}</div>
        ${tagsHtml ? `<div class="card-tags">${tagsHtml}</div>` : ""}
        <div class="card-footer">
          <span class="card-meta">By ${escapeHtml(m.model || "System")} • ${m.updated_at ? m.updated_at.split(" ")[0] : ""}</span>
          <div class="card-actions">
            <button class="action-icon-btn btn-edit-memory" data-id="${m.id}" title="Edit Memory">✏️</button>
            <button class="action-icon-btn delete-btn btn-delete-memory" data-id="${m.id}" title="Delete Memory">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }

  // Save Working State
  btnSaveState.addEventListener("click", async () => {
    btnSaveState.textContent = "Saving...";
    btnSaveState.disabled = true;
    try {
      const payload = {
        task: stateTask.value.trim(),
        blockers: stateBlockers.value.trim(),
        goals: stateGoals.value.trim(),
        model: "Dashboard UI",
      };
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Working state updated & snapshot re-compiled!", "success");
        loadStats();
      }
    } catch (err) {
      showToast("Error updating working state", "error");
    } finally {
      btnSaveState.textContent = "Save State";
      btnSaveState.disabled = false;
    }
  });

  // Category Filter Pills
  categoryFilters.addEventListener("click", (e) => {
    const pill = e.target.closest(".pill");
    if (!pill) return;
    document.querySelectorAll(".category-pills .pill").forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    currentCategory = pill.dataset.category;
    renderMemories();
  });

  // Search input
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value.trim();
    btnClearSearch.style.display = currentSearch ? "block" : "none";
    renderMemories();
  });

  btnClearSearch.addEventListener("click", () => {
    searchInput.value = "";
    currentSearch = "";
    btnClearSearch.style.display = "none";
    renderMemories();
  });

  // Importance Filter
  sortImportance.addEventListener("change", (e) => {
    currentImportance = parseInt(e.target.value);
    renderMemories();
  });

  // Sync Git
  btnSyncGit.addEventListener("click", async () => {
    btnSyncGit.innerHTML = `<span class="btn-icon">⏳</span> Syncing...`;
    btnSyncGit.disabled = true;
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast("Git status & commits synced into Brain!", "success");
        await loadAllData();
      }
    } catch (err) {
      showToast("Git sync failed", "error");
    } finally {
      btnSyncGit.innerHTML = `<span class="btn-icon">🔄</span> Sync Git`;
      btnSyncGit.disabled = false;
    }
  });

  // Add / Edit Modal Controls
  btnAddMemory.addEventListener("click", () => {
    modalTitle.textContent = "Remember New Memory";
    memoryForm.reset();
    memId.value = "";
    memModel.value = "Lead Developer";
    memoryModal.style.display = "flex";
    memTitle.focus();
  });

  function openEditModal(id) {
    const memory = allMemories.find((m) => m.id === id);
    if (!memory) return;
    modalTitle.textContent = `Edit Memory #${id}`;
    memId.value = memory.id;
    memTitle.value = memory.title;
    memCategory.value = memory.category.toLowerCase();
    memImportance.value = memory.importance;
    memContent.value = memory.content;
    memTags.value = memory.tags || "";
    memModel.value = memory.model || "Lead Developer";
    memoryModal.style.display = "flex";
    memTitle.focus();
  }

  function closeModal() {
    memoryModal.style.display = "none";
  }

  btnCloseModal.addEventListener("click", closeModal);
  btnCancelModal.addEventListener("click", closeModal);

  // Submit Memory Form
  memoryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = memId.value;
    const payload = {
      title: memTitle.value.trim(),
      category: memCategory.value,
      importance: parseInt(memImportance.value),
      content: memContent.value.trim(),
      tags: memTags.value.trim(),
      model: memModel.value.trim() || "Dashboard UI",
    };

    try {
      let res;
      if (id) {
        // Update
        res = await fetch(`/api/memories/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create
        res = await fetch("/api/remember", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (data.success) {
        showToast(id ? "Memory updated successfully!" : "New memory recorded into Brain!", "success");
        closeModal();
        await loadAllData();
      } else {
        showToast("Error saving memory", "error");
      }
    } catch (err) {
      showToast("Request failed", "error");
    }
  });

  // Delete Memory
  async function deleteMemory(id) {
    try {
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Memory #${id} deleted`, "success");
        await loadAllData();
      }
    } catch (err) {
      showToast("Delete failed", "error");
    }
  }

  // Export Prompt Modal
  btnExportPrompt.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/export-prompt");
      const data = await res.json();
      exportText.value = data.prompt || "";
      copyStatus.textContent = "";
      exportModal.style.display = "flex";
    } catch (err) {
      showToast("Failed to fetch export prompt", "error");
    }
  });

  function closeExportModal() {
    exportModal.style.display = "none";
  }

  btnCloseExport.addEventListener("click", closeExportModal);
  btnCancelExport.addEventListener("click", closeExportModal);

  btnCopyExport.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(exportText.value);
      copyStatus.textContent = "✅ Copied to clipboard!";
      showToast("Brain Memory Prompt copied! Paste into any AI model.", "success");
      setTimeout(() => (copyStatus.textContent = ""), 3000);
    } catch (err) {
      // Fallback
      exportText.select();
      document.execCommand("copy");
      copyStatus.textContent = "✅ Copied!";
      showToast("Prompt copied!", "success");
    }
  });

  // Toast System
  function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${type === "success" ? "✅" : "⚠️"}</span> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
