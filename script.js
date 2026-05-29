const API_BASE = '../backend';

async function postData(url, data){
  const res = await fetch(`${API_BASE}/${url}`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
  return res.json();
}

function formToObj(form){ return Object.fromEntries(new FormData(form).entries()); }

document.getElementById('registerForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const data = await postData('register.php', formToObj(e.target));
  document.getElementById('registerMsg').textContent = data.message;
  if(data.success) e.target.reset();
});

document.getElementById('requestForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const data = await postData('request_blood.php', formToObj(e.target));
  document.getElementById('requestMsg').textContent = data.message;
  if(data.success) e.target.reset();
});

async function searchDonors(){
  const bg = document.getElementById('searchBlood').value;
  const city = document.getElementById('searchCity').value;
  const res = await fetch(`${API_BASE}/search_donors.php?blood_group=${encodeURIComponent(bg)}&city=${encodeURIComponent(city)}`);
  const data = await res.json();
  const box = document.getElementById('donorResults');
  if(!data.donors.length){ box.innerHTML = '<p>No available donors found.</p>'; return; }
  box.innerHTML = data.donors.map(d => `<div class="donor-card"><h3>${d.name}</h3><p><b>Blood Group:</b> ${d.blood_group}</p><p><b>City:</b> ${d.city}</p><p><b>Phone:</b> ${d.phone}</p><span class="badge">${d.availability}</span></div>`).join('');
}

async function adminLogin(){
  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPass').value;
  const data = await postData('login.php', {email,password,role:'admin'});
  if(data.success){ document.getElementById('loginBox').style.display='none'; document.getElementById('dashboard').style.display='block'; loadDashboard(); }
  else document.getElementById('loginMsg').textContent = data.message;
}

async function loadDashboard(){
  const res = await fetch(`${API_BASE}/admin_dashboard.php`);
  const data = await res.json();
  document.getElementById('adminDonors').innerHTML = `<table><tr><th>Name</th><th>Blood</th><th>City</th><th>Phone</th><th>Status</th><th>Action</th></tr>${data.donors.map(d=>`<tr><td>${d.name}</td><td>${d.blood_group}</td><td>${d.city}</td><td>${d.phone}</td><td><select onchange="updateAvailability(${d.id},this.value)"><option ${d.availability==='Available'?'selected':''}>Available</option><option ${d.availability==='Unavailable'?'selected':''}>Unavailable</option></select></td><td><button onclick="deleteDonor(${d.id})">Delete</button></td></tr>`).join('')}</table>`;
  document.getElementById('adminRequests').innerHTML = `<table><tr><th>Patient</th><th>Blood</th><th>City</th><th>Hospital</th><th>Contact</th><th>Status</th></tr>${data.requests.map(r=>`<tr><td>${r.patient_name}</td><td>${r.blood_group}</td><td>${r.city}</td><td>${r.hospital}</td><td>${r.contact}</td><td><select onchange="updateRequest(${r.id},this.value)"><option ${r.status==='Pending'?'selected':''}>Pending</option><option ${r.status==='Accepted'?'selected':''}>Accepted</option><option ${r.status==='Completed'?'selected':''}>Completed</option><option ${r.status==='Rejected'?'selected':''}>Rejected</option></select></td></tr>`).join('')}</table>`;
}

async function updateAvailability(id, availability){ await postData('update_availability.php',{id,availability}); loadDashboard(); }
async function updateRequest(id, status){ await postData('update_request_status.php',{id,status}); loadDashboard(); }
async function deleteDonor(id){ if(confirm('Delete this donor?')){ await postData('delete_donor.php',{id}); loadDashboard(); } }
