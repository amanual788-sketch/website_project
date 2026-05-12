// ============================================
// PHOTO UPLOAD PREVIEW
// ============================================
const photoInput = document.getElementById('photoInput');
const photoPlaceholder = document.querySelector('.photo-placeholder-premium');
const photoPreviewArea = document.getElementById('photoPreviewArea');
const photoPreview = document.getElementById('photoPreview');
const removePhotoBtn = document.getElementById('removePhoto');

if (photoInput) {
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                photoPreview.src = event.target.result;
                if(photoPlaceholder) photoPlaceholder.style.display = 'none';
                if(photoPreviewArea) photoPreviewArea.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', function() {
            photoInput.value = '';
            if(photoPlaceholder) photoPlaceholder.style.display = 'flex';
            if(photoPreviewArea) photoPreviewArea.style.display = 'none';
        });
    }
}

// ============================================
// SYNC NAME PLACEHOLDER WITH FULL NAME
// ============================================
const namePlaceholder = document.getElementById('applicantNamePlaceholder');
const fullNameField = document.getElementById('fullName');

if (namePlaceholder && fullNameField) {
    namePlaceholder.addEventListener('input', function() {
        fullNameField.value = this.value;
    });
    
    fullNameField.addEventListener('input', function() {
        namePlaceholder.value = this.value;
    });
}

// ============================================
// AMHARIC SUCCESS NOTIFICATION (FIXED)
// ============================================
// ============================================
// FULL SCREEN NOTIFICATION - LIKE YOUR IMAGE
// ============================================

function showAmharicSuccess() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    
    // Create notification card
    const notification = document.createElement('div');
    notification.className = 'notification-fullscreen';
    
    notification.innerHTML = `
        <div class="icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <h2>እንኳን ደስ አለዎት!</h2>
        <p>ምዝገባዎ በሚገባ ተመዝግቧል</p>
        <button class="close-btn" onclick="this.closest('.notification-overlay').remove()">ዝጋ</button>
    `;
    
    overlay.appendChild(notification);
    document.body.appendChild(overlay);
    
    // Auto close after 5 seconds
    setTimeout(() => {
        if (overlay) overlay.remove();
    }, 5000);
}

function showError(message) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    
    // Create notification card
    const notification = document.createElement('div');
    notification.className = 'notification-fullscreen error';
    
    notification.innerHTML = `
        <div class="icon">
            <i class="fas fa-exclamation-circle"></i>
        </div>
        <h2>ስህተት!</h2>
        <p>${message}</p>
        <button class="close-btn" onclick="this.closest('.notification-overlay').remove()">ዝጋ</button>
    `;
    
    overlay.appendChild(notification);
    document.body.appendChild(overlay);
    
    // Auto close after 5 seconds
    setTimeout(() => {
        if (overlay) overlay.remove();
    }, 5000);
}

// ============================================
// FORM SUBMISSION - FIXED
// ============================================
const form = document.getElementById('registrationForm');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> በመመዝገብ ላይ...';
        submitBtn.disabled = true;
        
        const formData = {
            applicant: {
                fullName: document.getElementById('fullName')?.value || '',
                address: document.getElementById('address')?.value || '',
                nationality: document.getElementById('nationality')?.value || '',
                age: document.getElementById('age')?.value || '',
                dateOfBirth: document.getElementById('dob')?.value || '',
                placeOfBirth: document.getElementById('birthPlace')?.value || '',
                occupation: document.getElementById('occupation')?.value || '',
                idNumber: document.getElementById('idNumber')?.value || '',
                formDate: document.getElementById('formDate')?.value || '',
                weight: document.getElementById('weight')?.value || '',
                height: document.getElementById('height')?.value || '',
                phone: document.getElementById('phone')?.value || ''
            },
            nextOfKin: {
                name: document.getElementById('kinName')?.value || '',
                address: document.getElementById('kinAddress')?.value || '',
                region: document.getElementById('kinRegion')?.value || '',
                subcity: document.getElementById('kinSubcity')?.value || '',
                nationality: document.getElementById('kinNationality')?.value || '',
                idNumber: document.getElementById('kinIdNumber')?.value || '',
                phone: document.getElementById('kinPhone')?.value || ''
            },
            signature: {
                applicantSignature: document.getElementById('applicantSignature')?.value || '',
                witnessSignature: document.getElementById('witnessSignature')?.value || ''
            }
        };
        
        const declaration = document.getElementById('declarationCheckbox');
        if (!declaration || !declaration.checked) {
            showError('እባክዎ መረጃው ትክክል መሆኑን ያረጋግጡ');
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            return;
        }
        
        if (!formData.applicant.fullName) {
            showError('እባክዎ ሙሉ ስምዎን ያስገቡ');
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            return;
        }
        
        if (!formData.applicant.phone) {
            showError('እባክዎ ስልክ ቁጥርዎን ያስገቡ');
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            return;
        }
        
        const submitData = new FormData();
        submitData.append('formData', JSON.stringify(formData));
        
        const photoFile = document.getElementById('photoInput')?.files[0];
        if (photoFile) submitData.append('photo', photoFile);
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                body: submitData
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                // SHOW ONLY AMHARIC SUCCESS MESSAGE
                showAmharicSuccess();
                
                form.reset();
                if (photoInput) photoInput.value = '';
                if (photoPlaceholder) photoPlaceholder.style.display = 'flex';
                if (photoPreviewArea) photoPreviewArea.style.display = 'none';
                if (namePlaceholder) namePlaceholder.value = '';
                
            } else {
                showError('ምዝገባ አልተሳካም: ' + (result.error || 'እባክዎ እንደገና ይሞክሩ'));
            }
        } catch (error) {
            console.error('Error:', error);
            showError('የኢንተርኔት ግንኙነት ችግር አለ። እባክዎ እንደገና ይሞክሩ');
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

async function loadApplications() {
    try {
        const response = await fetch('/api/registrations');
        const result = await response.json();
        if (result.success) {
            displayApplications(result.data);
            const totalCount = document.getElementById('totalCount');
            const pendingCount = document.getElementById('pendingCount');
            const todayCount = document.getElementById('todayCount');
            
            if (totalCount) totalCount.innerText = result.data.length;
            
            const pending = result.data.filter(app => app.status === 'pending').length;
            if (pendingCount) pendingCount.innerText = pending;
            
            const today = new Date().toDateString();
            const todayApps = result.data.filter(app => new Date(app.createdAt).toDateString() === today).length;
            if (todayCount) todayCount.innerText = todayApps;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayApplications(data) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">No applications found</td><\/tr>';
        return;
    }
    
    tbody.innerHTML = data.map(app => `
        <tr>
            <td>${app.applicationId || 'N/A'}</td>
            <td>${app.applicant?.fullName || '-'}</td>
            <td>${app.applicant?.phone || '-'}</td>
            <td>${app.applicant?.nationality || '-'}</td>
            <td>${new Date(app.createdAt).toLocaleDateString()}</td>
            <td>${app.photo ? '<i class="fas fa-check-circle" style="color:#10B981"></i>' : '<i class="fas fa-times-circle" style="color:#EF4444"></i>'}</td>
            <td class="action-buttons">
                <button class="view-btn" onclick="viewDetails('${app._id}')"><i class="fas fa-eye"></i> View</button>
                <button class="delete-btn" onclick="deleteApp('${app._id}')"><i class="fas fa-trash"></i> Delete</button>
            </td>
        </tr>
    `).join('');
}

async function viewDetails(id) {
    try {
        const response = await fetch('/api/registrations');
        const result = await response.json();
        const app = result.data.find(a => a._id === id);
        
        if (app) {
            const modalBody = document.getElementById('modalBody');
            if (modalBody) {
                modalBody.innerHTML = `
                    <div class="detail-row"><div class="detail-label">Application ID:</div><div>${app.applicationId}</div></div>
                    <div class="detail-row"><div class="detail-label">Full Name:</div><div>${app.applicant?.fullName || '-'}</div></div>
                    <div class="detail-row"><div class="detail-label">Phone:</div><div>${app.applicant?.phone || '-'}</div></div>
                    <div class="detail-row"><div class="detail-label">Nationality:</div><div>${app.applicant?.nationality || '-'}</div></div>
                    <div class="detail-row"><div class="detail-label">Occupation:</div><div>${app.applicant?.occupation || '-'}</div></div>
                    <div class="detail-row"><div class="detail-label">Address:</div><div>${app.applicant?.address || '-'}</div></div>
                    <div class="detail-row"><div class="detail-label">Next of Kin:</div><div>${app.nextOfKin?.name || '-'}</div></div>
                    <div class="detail-row"><div class="detail-label">Kin Phone:</div><div>${app.nextOfKin?.phone || '-'}</div></div>
                    <div class="detail-row"><div class="detail-label">Submitted:</div><div>${new Date(app.createdAt).toLocaleString()}</div></div>
                    ${app.photo ? `<div class="detail-row"><div class="detail-label">Photo:</div><div><img src="data:${app.photo.contentType};base64,${app.photo.data}" style="max-width:100px; border-radius:8px;"></div></div>` : ''}
                `;
            }
            const modal = document.getElementById('detailModal');
            if (modal) modal.style.display = 'flex';
        }
    } catch (error) {
        alert('Error loading details');
    }
}

// ============================================
// WORKING DELETE FUNCTION
// ============================================
async function deleteApp(id) {
    if (confirm('⚠️ Are you sure you want to delete this application? This action cannot be undone.')) {
        try {
            const response = await fetch(`/api/registration/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                showAmharicSuccess();
                loadApplications();
            } else {
                showError('Delete failed: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Delete error:', error);
            showError('Network error. Please try again.');
        }
    }
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', async (e) => {
        const term = e.target.value.toLowerCase();
        const response = await fetch('/api/registrations');
        const result = await response.json();
        const filtered = result.data.filter(app => 
            app.applicant?.fullName?.toLowerCase().includes(term) ||
            app.applicant?.phone?.includes(term) ||
            app.applicationId?.toLowerCase().includes(term)
        );
        displayApplications(filtered);
    });
}

// ============================================
// MODAL CLOSE
// ============================================
const closeModal = document.querySelector('.close-modal');
if (closeModal) {
    closeModal.addEventListener('click', () => {
        const modal = document.getElementById('detailModal');
        if (modal) modal.style.display = 'none';
    });
}
window.addEventListener('click', (e) => {
    const modal = document.getElementById('detailModal');
    if (e.target === modal && modal) {
        modal.style.display = 'none';
    }
});

// ============================================
// LOAD ADMIN DATA
// ============================================
if (document.getElementById('tableBody')) {
    loadApplications();
}