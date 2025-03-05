document.addEventListener("DOMContentLoaded",(()=>{const e=document.getElementById("notesGrid"),t=document.getElementById("addNoteForm");function n(){e.innerHTML="<p>Loading...</p>",fetch("https://notes-api.dicoding.dev/v2/notes").then((e=>e.json())).then((t=>{!function(t){e.innerHTML="";const o=document.getElementById("note-template");t.forEach((t=>{const d=o.content.cloneNode(!0),r=d.querySelector("note-card");r.setAttribute("note-id",t.id),r.querySelector('[slot="title"]').textContent=t.title,r.querySelector('[slot="body"]').textContent=t.body,r.querySelector('[slot="date"]').textContent=new Date(t.createdAt).toLocaleDateString(),r.querySelector(".delete-btn").addEventListener("click",(()=>{var e;confirm("Are you sure you want to delete this note?")&&(e=t.id,fetch(`https://notes-api.dicoding.dev/v2/notes/${e}`,{method:"DELETE"}).then((e=>{e.ok&&n()})).catch((e=>{console.error("Error:",e)})))})),e.appendChild(d)}))}(t.data)})).catch((e=>{console.error("Error:",e)}))}t.addEventListener("submit",(e=>{e.preventDefault();const o=document.getElementById("title").value.trim(),d=document.getElementById("body").value.trim();fetch("https://notes-api.dicoding.dev/v2/notes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:o,body:d})}).then((e=>e.json())).then((e=>{n(),t.reset()})).catch((e=>{console.error("Error:",e)}))})),n()}));