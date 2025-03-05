import '../new-style.css';

// Web Component untuk Note Card
class NoteCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          transition: opacity 0.3s ease;
        }
        .note-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .actions {
          margin-top: auto;
          display: flex;
          gap: 0.5rem;
        }
        ::slotted(h3) {
          margin: 0;
          color: var(--primary-color);
        }
        ::slotted(p) {
          margin: 0;
          color: #666;
        }
      </style>
      <div class="note-content">
        <slot name="title"></slot>
        <slot name="body"></slot>
        <slot name="date"></slot>
        <div class="actions">
          <slot name="actions"></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('note-card', NoteCard);

// Main App Logic
document.addEventListener('DOMContentLoaded', () => {
  const notesGrid = document.getElementById('notesGrid');
  const addNoteForm = document.getElementById('addNoteForm');

  function showLoading() {
    notesGrid.innerHTML = '<p>Loading...</p>';
  }

  function fetchNotes() {
    showLoading();
    fetch('https://notes-api.dicoding.dev/v2/notes')
      .then(response => response.json())
      .then(data => {
        renderNotes(data.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  function renderNotes(notes) {
    notesGrid.innerHTML = '';
    const template = document.getElementById('note-template');

    notes.forEach(note => {
      const clone = template.content.cloneNode(true);
      const noteCard = clone.querySelector('note-card');

      noteCard.setAttribute('note-id', note.id);

      noteCard.querySelector('[slot="title"]').textContent = note.title;
      noteCard.querySelector('[slot="body"]').textContent = note.body;

      // Tampilkan timestamp pembuatan
      const createdAtElement = noteCard.querySelector('.created-at');
      createdAtElement.textContent = new Date(note.createdAt).toLocaleString();

      const deleteBtn = noteCard.querySelector('.delete-btn');
      const archiveBtn = noteCard.querySelector('.archive-btn');

      deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this note?')) {
          deleteNote(note.id);
        }
      });

      archiveBtn.addEventListener('click', () => {
        toggleArchive(note.id);
        renderNotes(); // Render ulang catatan setelah di-archive/unarchive
      });

      archiveBtn.textContent = note.archived ? 'Unarchive' : 'Archive';
      notesGrid.appendChild(clone);
    });

    // Tampilkan pesan jika tidak ada catatan
    if (notes.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.textContent = 'No notes yet. Create your first note!';
      emptyMessage.style.textAlign = 'center';
      emptyMessage.style.gridColumn = '1 / -1';
      notesGrid.appendChild(emptyMessage);
    }
  }

  function deleteNote(id) {
    fetch(`https://notes-api.dicoding.dev/v2/notes/${id}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (response.ok) {
        fetchNotes();
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  function toggleArchive(id) {
    fetch(`https://notes-api.dicoding.dev/v2/notes/${id}/archive`, {
      method: 'POST',
    })
    .then(response => {
      if (response.ok) {
        fetchNotes();
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  function validateForm(form) {
    const titleInput = form.querySelector('#title');
    const bodyInput = form.querySelector('#body');
    let isValid = true;

    // Validasi judul
    if (titleInput.value.trim().length < 3 || titleInput.value.trim().length > 50) {
      isValid = false;
      titleInput.nextElementSibling.textContent = 'Title must be between 3 and 50 characters.';
    } else {
      titleInput.nextElementSibling.textContent = '';
    }

    // Validasi konten
    if (bodyInput.value.trim().length < 10 || bodyInput.value.trim().length > 500) {
      isValid = false;
      bodyInput.nextElementSibling.textContent = 'Content must be between 10 and 500 characters.';
    } else {
      bodyInput.nextElementSibling.textContent = '';
    }

    return isValid;
  }

  addNoteForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm(addNoteForm)) {
      return; // Hentikan pengiriman jika form tidak valid
    }

    const title = document.getElementById('title').value.trim();
    const body = document.getElementById('body').value.trim();

    const newNote = {
      title,
      body,
    };

    console.log('Data yang dikirim:', newNote); // Debugging

    fetch('https://notes-api.dicoding.dev/v2/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newNote),
    })
    .then(response => {
      console.log('Response:', response); // Debugging
      return response.json();
    })
    .then(data => {
      console.log('Data dari server:', data); // Debugging
      fetchNotes();
      addNoteForm.reset();
    })
    .catch(error => {
      console.error('Error:', error); // Debugging
    });
  });

  fetchNotes();
});