// Photo Upload Preview
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
                photoPlaceholder.style.display = 'none';
                photoPreviewArea.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', function() {
            photoInput.value = '';
            photoPlaceholder.style.display = 'flex';
            photoPreviewArea.style.display = 'none';
        });
    }
}

// Sync name placeholder with full name field
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

// Form Submission
const form = document.getElementById('registrationForm');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            applicant: {
                fullName: document.getElementById('fullName').value,
                address: document.getElementById('address').value,
                nationality: document.getElementById('nationality').value,
                age: document.getElementById('age').value,
                dateOfBirth: document.getElementById('dob').value,
                placeOfBirth: document.getElementById('birthPlace').value,
                occupation: document.getElementById('occupation').value,
                idNumber: document.getElementById('idNumber').value,
                formDate: document.getElementById('formDate').value,
                weight: document.getElementById('weight').value,
                height: document.getElementById('height').value,
                phone: document.getElementById('phone').value
            },
            nextOfKin: {
                name: document.getElementById('kinName').value,
                address: document.getElementById('kinAddress').value,
                region: document.getElementById('kinRegion').value,
                subcity: document.getElementById('kinSubcity').value,
                nationality: document.getElementById('kinNationality').value,
                idNumber: document.getElementById('kinIdNumber').value,
                phone: document.getElementById('kinPhone').value
            },
            signature: {
                applicantSignature: document.getElementById('applicantSignature').value,
                witnessSignature: document.getElementById('witnessSignature').value
            }
        };
        
        const declaration = document.getElementById('declarationCheckbox');
        if (!declaration.checked) {
            showMessage('Please confirm the declaration', 'error');
            return;
        }
        
        const submitData = new FormData();
        submitData.append('formData', JSON.stringify(formData));
        const photoFile = document.getElementById('photoInput').files[0];
        if (photoFile) submitData.append('photo', photoFile);
        
        const submitBtn = document.querySelector('.submit-btn-glow');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/api/register', { method: 'POST', body: submitData });
            const result = await response.json();
            
            if (result.success) {
                showMessage(`✅ Registration Successful! Application ID: ${result.applicationId}`, 'success');
                form.reset();
                if (photoPreviewArea) photoPreviewArea.style.display = 'none';
                if (photoPlaceholder) photoPlaceholder.style.display = 'flex';
                if (namePlaceholder) namePlaceholder.value = '';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                showMessage('❌ Error: ' + result.error, 'error');
            }
        } catch (error) {
            showMessage('❌ Network error. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

function showMessage(msg, type) {
    const msgDiv = document.getElementById('message');
    msgDiv.className = `message-toast ${type}`;
    msgDiv.innerHTML = msg;
    msgDiv.style.display = 'block';
    setTimeout(() => {
        msgDiv.style.display = 'none';
    }, 8000);
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
            document.getElementById('totalCount').innerText = result.data.length;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayApplications(data) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">No applications found</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(app => `
        <tr>
            <td>${app.applicationId || 'N/A'}</td>
            <td>${app.applicant?.fullName || '-'}</td>
            <td>${app.applicant?.phone || '-'}</td>
            <td>${app.applicant?.nationality || '-'}</td>
            <td>${new Date(app.createdAt).toLocaleDateString()}</td>
            <td>${app.photo ? '<i class="fas fa-check-circle" style="color:#10B981"></i> Yes' : '<i class="fas fa-times-circle" style="color:#EF4444"></i> No'}</td>
            <td class="action-buttons">
                <button class="view-btn" onclick="viewDetails('${app._id}')"><i class="fas fa-eye"></i></button>
                <button class="delete-btn" onclick="deleteApp('${app._id}')"><i class="fas fa-trash"></i></button>
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
            modalBody.innerHTML = `
                <div class="detail-row"><div class="detail-label">Application ID:</div><div>${app.applicationId}</div></div>
                <div class="detail-row"><div class="detail-label">Full Name:</div><div>${app.applicant?.fullName || '-'}</div></div>
                <div class="detail-row"><div class="detail-label">Address:</div><div>${app.applicant?.address || '-'}</div></div>
                <div class="detail-row"><div class="detail-label">Nationality:</div><div>${app.applicant?.nationality || '-'}</div></div>
                <div class="detail-row"><div class="detail-label">Age:</div><div>${app.applicant?.age || '-'}</div></div>
                <div class="detail-row"><div class="detail-label">Date of Birth:</div><div>${app.applicant?.dateOfBirth || '-'}</div></div>
                <div class="detail-row"><div class="detail-label">Place of Birth:</div><div>${app.applicant?.placeOfBirth || '-'}</div></div>
                <div class="detail-row"><div class="detail-label">Occupation:</div><div>${app.applicant?.occupation || '-'}</div></div>
                <div class="detail-row"><div class="detail-label">ID Number:</div><div>${app.applicant?.idNumber || '-'}</div></div>
                <div class="detail-row"><div class="detail-label">Phone:</div><div>${app.applicant?.phone || '-'}</div></div>
                <div class="detail-row"><div class="detail-label">Weight/Height:</div><div>${app.applicant?.weight || '-'} kg / ${app.applicant?.height || '-'} cm</div></div>
                <div class="detail-row"><div class="detail-label">Next of Kin:</div><div>${app.nextOfKin?.name || '-'}</div></div>
                <div class="detail-row"><div class="detail-label">Kin Phone:</div><div>${app.nextOfKin?.phone || '-'}</div></div>
                <div class="detail-row"><div class="detail-label">Submitted:</div><div>${new Date(app.createdAt).toLocaleString()}</div></div>
                ${app.photo ? `<div class="detail-row"><div class="detail-label">Photo:</div><div><img src="data:${app.photo.contentType};base64,${app.photo.data}" style="max-width:120px; border-radius:10px;"></div></div>` : ''}
            `;
            document.getElementById('detailModal').style.display = 'flex';
        }
    } catch (error) {
        alert('Error loading details');
    }
}

async function deleteApp(id) {
    if (confirm('Are you sure you want to delete this application?')) {
        try {
            await fetch(`/api/registration/${id}`, { method: 'DELETE' });
            loadApplications();
        } catch (error) {
            alert('Error deleting');
        }
    }
}

// Search functionality
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

// Modal close
document.querySelector('.close-modal')?.addEventListener('click', () => {
    document.getElementById('detailModal').style.display = 'none';
});
window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('detailModal')) {
        document.getElementById('detailModal').style.display = 'none';
    }
});

// Load admin data
if (document.getElementById('tableBody')) {
    loadApplications();
}