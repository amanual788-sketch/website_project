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
// MODERN NOTIFICATION FUNCTION (BOTTOM RIGHT)
// ============================================
function showNotification(title, message, type) {
    // Create container if not exists
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <div class="notification-close">
            <i class="fas fa-times"></i>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification) {
            notification.style.animation = 'fadeOutRight 0.3s ease';
            setTimeout(() => {
                if (notification && notification.remove) notification.remove();
            }, 300);
        }
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'fadeOutRight 0.3s ease';
            setTimeout(() => {
                if (notification && notification.remove) notification.remove();
            }, 300);
        });
    }
}

// ============================================
// FORM SUBMISSION - UPDATED WITH MODERN NOTIFICATION
// ============================================
const form = document.getElementById('registrationForm');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
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
            showNotification('⚠️ Declaration Required', 'Please confirm the information is true and accurate', 'error');
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            return;
        }
        
        if (!formData.applicant.fullName) {
            showNotification('⚠️ Missing Information', 'Please enter your full name', 'error');
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            return;
        }
        
        if (!formData.applicant.phone) {
            showNotification('⚠️ Missing Information', 'Please enter your phone number', 'error');
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
                // MODERN SUCCESS NOTIFICATION AT BOTTOM
                showNotification(
                    '✅ Registration Successful!', 
                    `Application ID: ${result.applicationId}`, 
                    'success'
                );
                
                form.reset();
                if (photoInput) photoInput.value = '';
                if (photoPlaceholder) photoPlaceholder.style.display = 'flex';
                if (photoPreviewArea) photoPreviewArea.style.display = 'none';
                if (namePlaceholder) namePlaceholder.value = '';
                
            } else {
                showNotification('❌ Submission Failed', result.error || 'Unknown error occurred', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('❌ Network Error', 'Please check your connection and try again', 'error');
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
        tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">No applications found</td><tr';
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
                showNotification('✅ Deleted Successfully', 'Application has been removed', 'success');
                loadApplications();
            } else {
                showNotification('❌ Delete Failed', result.message || 'Unknown error', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showNotification('❌ Network Error', 'Please try again', 'error');
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