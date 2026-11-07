// ==========================================================
// APARTMENT MANAGEMENT CLIENT SCRIPT
// Developer: S. Sai Chandrika (Roll No: 25ATA05L40)
// ==========================================================

let allApartments = [];
let currentViewMode = 'table';

document.addEventListener('DOMContentLoaded', () => {
    checkDbStatus();
    if (document.getElementById('apartmentsTableBody')) {
        loadApartments();
    }
});

// 1. Check MySQL connection status
async function checkDbStatus() {
    const badge = document.getElementById('dbStatusBadge');
    if (!badge) return;

    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        if (data.connected) {
            badge.className = 'db-badge connected';
            badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> MySQL Workbench Connected';
        } else {
            badge.className = 'db-badge offline';
            badge.innerHTML = '<i class="fa-solid fa-circle-info"></i> Running in Demo Mode (Ready for Viva)';
        }
    } catch (e) {
        badge.className = 'db-badge offline';
        badge.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Server Offline';
    }
}

// 2. Load all apartments from backend
async function loadApartments() {
    const tbody = document.getElementById('apartmentsTableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="loading-td">
                    <i class="fa-solid fa-spinner fa-spin"></i> Fetching apartment records from MySQL database...
                </td>
            </tr>
        `;
    }

    try {
        const res = await fetch('/api/apartments');
        if (!res.ok) throw new Error('Failed to fetch apartments');
        allApartments = await res.json();
        updateStats(allApartments);
        populateLocationFilter(allApartments);
        renderApartments(allApartments);
    } catch (err) {
        console.error(err);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-td">
                        <i class="fa-solid fa-triangle-exclamation"></i> Unable to load apartment records. Make sure the Node server is running.
                    </td>
                </tr>
            `;
        }
    }
}

// 3. Render Table View & Card View
function renderApartments(apartments) {
    renderTable(apartments);
    renderCards(apartments);
}

// Render Table View with headings:
// Apartment ID, Flat No, Apartment Name, BHK Type, Rent / Price, Location, Status, Actions
function renderTable(apts) {
    const tbody = document.getElementById('apartmentsTableBody');
    if (!tbody) return;

    if (apts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-td">
                    <i class="fa-solid fa-building-circle-xmark"></i> No apartment listings found matching your criteria.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = apts.map(apt => {
        let statusClass = 'status-available';
        let statusIcon = 'fa-check';
        if (apt.status === 'Occupied') {
            statusClass = 'status-occupied';
            statusIcon = 'fa-user-check';
        } else if (apt.status === 'Maintenance') {
            statusClass = 'status-maintenance';
            statusIcon = 'fa-screwdriver-wrench';
        }

        return `
            <tr>
                <td><span class="apt-id-cell">#${apt.apartment_id}</span></td>
                <td><span class="flat-no-cell"><i class="fa-solid fa-door-open text-primary"></i> ${escapeHtml(apt.flat_no)}</span></td>
                <td><span class="apt-name-cell">${escapeHtml(apt.apartment_name)}</span></td>
                <td><span class="bhk-tag"><i class="fa-solid fa-bed"></i> ${escapeHtml(apt.bhk_type)}</span></td>
                <td><span class="price-tag">${formatRent(apt.rent_price)}</span></td>
                <td><span style="color:var(--muted); font-size:0.86rem;"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(apt.location)}</span></td>
                <td><span class="status-badge ${statusClass}"><i class="fa-solid ${statusIcon}"></i> ${escapeHtml(apt.status)}</span></td>
                <td>
                    <div class="action-buttons-group">
                        <a href="update-apartment.html?id=${apt.apartment_id}" class="btn-sm-edit" title="Update Details">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </a>
                        <button onclick="deleteApartmentDirect(${apt.apartment_id}, '${escapeHtml(apt.flat_no)}')" class="btn-sm-delete" title="Delete Apartment">
                            <i class="fa-solid fa-trash-can"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Render Card View
function renderCards(apts) {
    const grid = document.getElementById('apartmentsCardsGrid');
    if (!grid) return;

    if (apts.length === 0) {
        grid.innerHTML = `<div class="empty-td" style="grid-column: 1 / -1;"><i class="fa-solid fa-building-circle-xmark"></i> No apartments matching filter.</div>`;
        return;
    }

    grid.innerHTML = apts.map(apt => {
        let statusClass = apt.status === 'Available' ? 'status-available' : (apt.status === 'Occupied' ? 'status-occupied' : 'status-maintenance');
        return `
            <div class="apt-card">
                <div>
                    <div class="apt-card-top">
                        <span class="apt-id-cell">#${apt.apartment_id}</span>
                        <span class="status-badge ${statusClass}">${escapeHtml(apt.status)}</span>
                    </div>
                    <h4 class="card-title">${escapeHtml(apt.flat_no)}</h4>
                    <div class="card-subtitle"><i class="fa-solid fa-building"></i> ${escapeHtml(apt.apartment_name)}</div>
                    <div class="card-details-row">
                        <span class="bhk-tag"><i class="fa-solid fa-bed"></i> ${escapeHtml(apt.bhk_type)}</span>
                        <span style="color:var(--muted); font-size:0.84rem;"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(apt.location)}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <span class="price-tag">${formatRent(apt.rent_price)}</span>
                    <div class="action-buttons-group">
                        <a href="update-apartment.html?id=${apt.apartment_id}" class="btn-sm-edit"><i class="fa-solid fa-pen"></i></a>
                        <button onclick="deleteApartmentDirect(${apt.apartment_id}, '${escapeHtml(apt.flat_no)}')" class="btn-sm-delete"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 4. Update KPI Counters
function updateStats(apts) {
    const totalElem = document.getElementById('totalAptsCount');
    const availElem = document.getElementById('availAptsCount');
    const occElem = document.getElementById('occAptsCount');
    const avgElem = document.getElementById('avgRentBadge');

    if (totalElem) totalElem.innerText = apts.length;

    const availableCount = apts.filter(a => a.status === 'Available').length;
    const occupiedCount = apts.filter(a => a.status === 'Occupied').length;

    if (availElem) availElem.innerText = availableCount;
    if (occElem) occElem.innerText = occupiedCount;

    if (apts.length > 0) {
        const totalRent = apts.reduce((sum, a) => sum + parseFloat(a.rent_price || 0), 0);
        const avg = totalRent / apts.length;
        if (avgElem) avgElem.innerText = formatRent(avg);
    }
}

// 5. Populate Dynamic Location Filter Dropdown
function populateLocationFilter(apts) {
    const locSelect = document.getElementById('locationFilter');
    if (!locSelect) return;

    const current = locSelect.value;
    const locations = Array.from(new Set(apts.map(a => a.location.trim()))).sort();

    locSelect.innerHTML = '<option value="">All Locations</option>';
    locations.forEach(loc => {
        const opt = document.createElement('option');
        opt.value = loc;
        opt.textContent = loc;
        if (loc === current) opt.selected = true;
        locSelect.appendChild(opt);
    });
}

// 6. Filter and Search Handler
function filterApartments() {
    const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
    const locVal = (document.getElementById('locationFilter')?.value || '').toLowerCase().trim();
    const bhkVal = (document.getElementById('bhkFilter')?.value || '').trim();
    const statusVal = (document.getElementById('statusFilter')?.value || '').trim();

    const filtered = allApartments.filter(a => {
        const matchSearch =
            a.flat_no.toLowerCase().includes(searchVal) ||
            a.apartment_name.toLowerCase().includes(searchVal) ||
            a.location.toLowerCase().includes(searchVal) ||
            String(a.apartment_id).includes(searchVal);

        const matchLoc = locVal === '' || a.location.toLowerCase().includes(locVal);
        const matchBhk = bhkVal === '' || a.bhk_type === bhkVal;
        const matchStatus = statusVal === '' || a.status === statusVal;

        return matchSearch && matchLoc && matchBhk && matchStatus;
    });

    renderApartments(filtered);
}

// 7. Toggle View Mode (Table / Cards)
function setViewMode(mode) {
    currentViewMode = mode;
    const tableCont = document.getElementById('tableViewContainer');
    const cardCont = document.getElementById('cardViewContainer');
    const tableBtn = document.getElementById('tableViewBtn');
    const cardBtn = document.getElementById('cardViewBtn');

    if (mode === 'table') {
        tableCont.classList.remove('hidden');
        cardCont.classList.add('hidden');
        tableBtn?.classList.add('active');
        cardBtn?.classList.remove('active');
    } else {
        tableCont.classList.add('hidden');
        cardCont.classList.remove('hidden');
        tableBtn?.classList.remove('active');
        cardBtn?.classList.add('active');
    }
}

// 8. Direct Delete with Confirmation
async function deleteApartmentDirect(id, flatNo) {
    const confirmed = confirm(`Are you sure you want to delete Apartment #${id} ("${flatNo}") from MySQL database?`);
    if (!confirmed) return;

    try {
        const res = await fetch(`/api/apartments/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Delete failed');

        showToast(`🗑️ Apartment #${id} deleted from database!`);
        await loadApartments();
    } catch (err) {
        showToast('Error: ' + err.message, true);
    }
}

// Helpers
function formatRent(num) {
    const val = parseFloat(num);
    if (isNaN(val)) return '₹0 / mo';
    return '₹' + Math.round(val).toLocaleString('en-IN') + ' / mo';
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showToast(message, isError = false) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = `<i id="toastIcon"></i> <span id="toastMsg"></span>`;
        document.body.appendChild(toast);
    }
    const toastMsg = document.getElementById('toastMsg');
    const toastIcon = document.getElementById('toastIcon');

    toastMsg.innerText = message;
    if (isError) {
        toast.className = 'toast show error';
        toastIcon.className = 'fa-solid fa-triangle-exclamation';
    } else {
        toast.className = 'toast show';
        toastIcon.className = 'fa-solid fa-circle-check';
    }

    setTimeout(() => {
        toast.className = 'toast';
    }, 3500);
}
