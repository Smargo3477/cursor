const STORAGE_KEY = "vibe-notepad-notes";

const notesList = document.querySelector("#notes-list");
const searchInput = document.querySelector("#search-input");
const titleInput = document.querySelector("#note-title");
const contentInput = document.querySelector("#note-content");
const newNoteButton = document.querySelector("#new-note-button");
const deleteNoteButton = document.querySelector("#delete-note-button");
const saveStatus = document.querySelector("#save-status");

let notes = loadNotes();
let activeNoteId = notes[0]?.id ?? null;

function loadNotes() {
  const savedNotes = localStorage.getItem(STORAGE_KEY);

  if (!savedNotes) {
    return [
      {
        id: crypto.randomUUID(),
        title: "欢迎使用记事本",
        content: "点击左侧新建笔记，或者直接修改这条示例笔记。你的内容会自动保存在浏览器里。",
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  try {
    return JSON.parse(savedNotes);
  } catch {
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  saveStatus.textContent = `已保存：${formatDate(new Date().toISOString())}`;
}

function createNote() {
  const note = {
    id: crypto.randomUUID(),
    title: "未命名笔记",
    content: "",
    updatedAt: new Date().toISOString(),
  };

  notes = [note, ...notes];
  activeNoteId = note.id;
  saveNotes();
  render();
  titleInput.focus();
  titleInput.select();
}

function updateActiveNote() {
  notes = notes.map((note) => {
    if (note.id !== activeNoteId) {
      return note;
    }

    return {
      ...note,
      title: titleInput.value.trim() || "未命名笔记",
      content: contentInput.value,
      updatedAt: new Date().toISOString(),
    };
  });

  saveNotes();
  renderNotesList();
}

function deleteActiveNote() {
  if (!activeNoteId) {
    return;
  }

  const activeNote = getActiveNote();
  const confirmed = window.confirm(`确定要删除「${activeNote.title}」吗？`);

  if (!confirmed) {
    return;
  }

  notes = notes.filter((note) => note.id !== activeNoteId);
  activeNoteId = notes[0]?.id ?? null;
  saveNotes();
  render();
}

function getActiveNote() {
  return notes.find((note) => note.id === activeNoteId);
}

function render() {
  renderNotesList();
  renderEditor();
}

function renderNotesList() {
  const keyword = searchInput.value.trim().toLowerCase();
  const filteredNotes = notes.filter((note) => {
    const searchableText = `${note.title} ${note.content}`.toLowerCase();
    return searchableText.includes(keyword);
  });

  notesList.innerHTML = "";

  if (filteredNotes.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = keyword ? "没有找到匹配的笔记" : "还没有笔记，点击右上角新建一条吧";
    notesList.append(emptyState);
    return;
  }

  filteredNotes.forEach((note) => {
    const button = document.createElement("button");
    button.className = `note-card${note.id === activeNoteId ? " active" : ""}`;
    button.type = "button";
    button.addEventListener("click", () => {
      activeNoteId = note.id;
      render();
    });

    const title = document.createElement("span");
    title.className = "note-card-title";
    title.textContent = note.title || "未命名笔记";

    const preview = document.createElement("p");
    preview.className = "note-card-preview";
    preview.textContent = note.content || "空白笔记";

    const time = document.createElement("span");
    time.className = "note-card-time";
    time.textContent = formatDate(note.updatedAt);

    button.append(title, preview, time);
    notesList.append(button);
  });
}

function renderEditor() {
  const activeNote = getActiveNote();
  const hasActiveNote = Boolean(activeNote);

  titleInput.disabled = !hasActiveNote;
  contentInput.disabled = !hasActiveNote;
  deleteNoteButton.disabled = !hasActiveNote;

  if (!activeNote) {
    titleInput.value = "";
    contentInput.value = "";
    saveStatus.textContent = "没有可编辑的笔记";
    return;
  }

  titleInput.value = activeNote.title;
  contentInput.value = activeNote.content;
  saveStatus.textContent = `最后更新：${formatDate(activeNote.updatedAt)}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

newNoteButton.addEventListener("click", createNote);
deleteNoteButton.addEventListener("click", deleteActiveNote);
searchInput.addEventListener("input", renderNotesList);
titleInput.addEventListener("input", updateActiveNote);
contentInput.addEventListener("input", updateActiveNote);

render();
