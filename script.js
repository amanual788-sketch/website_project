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
// SHOW MESSAGE FUNCTION
// ============================================
function showMessage(message, type) {
    const msgDiv = document.getElementById('message');
    if (!msgDiv) return;
    
    msgDiv.textContent = message;
    msgDiv.className = `message-toast ${type}`;
    msgDiv.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        msgDiv.style.display = 'none';
    }, 5000);
}

// ============================================
// FORM SUBMISSION - WITH SUCCESS MESSAGE
// ============================================
const form = document.getElementById('registrationForm');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;
        
        // Collect form data
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
        
        // Validate declaration
        const declaration = document.getElementById('declarationCheckbox');
        if (!declaration || !declaration.checked) {
            showMessage('⚠️ Please confirm that the information provided is true and accurate', 'error');
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            return;
        }
        
        // Validate required fields
        if (!formData.applicant.fullName) {
            showMessage('⚠️ Please enter your full name', 'error');
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            return;
        }
        
        if (!formData.applicant.phone) {
            showMessage('⚠️ Please enter your phone number', 'error');
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            return;
        }
        
        // Prepare FormData for file upload
        const submitData = new FormData();
        submitData.append('formData', JSON.stringify(formData));
        
        const photoFile = document.getElementById('photoInput')?.files[0];
        if (photoFile) {
            submitData.append('photo', photoFile);
        }
        
        try {
            // Send to server
            const response = await fetch('/api/register', {
                method: 'POST',
                body: submitData
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                // SUCCESS MESSAGE - Registration Successful!
                showMessage(`✅ REGISTRATION SUCCESSFUL! Application ID: ${result.applicationId}. We will contact you within 3-5 business days.`, 'success');
                
                // Reset form
                form.reset();
                
                // Reset photo upload
                if (photoInput) photoInput.value = '';
                if (photoPlaceholder) photoPlaceholder.style.display = 'flex';
                if (photoPreviewArea) photoPreviewArea.style.display = 'none';
                if (namePlaceholder) namePlaceholder.value = '';
                
                // Scroll to top to show message
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
            } else {
                showMessage('❌ Submission failed: ' + (result.error || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('❌ Network error. Please check your connection and try again.', 'error');
        } finally {
            // Restore button
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
            if (totalCount) totalCount.innerText = result.data.length;
        }
    } catch (error) {
        console.error('Error loading applications:', error);
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
            <td>${app.photo ? '<i class="fas fa-check-circle" style="color:#10B981"></i>' : '<i class="fas fa-times-circle" style="color:#EF4444"></i>'}</td>
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
            if (modalBody) {
                modalBody.innerHTML = `
                    <div class="detail-row"><div class="detail-label">Application ID:</div><div>${app.applicationId}</div></div>
                    <div class="detail-row"><div class="detail-label">Full Name:</div><div>${app.applicant?.fullName || '-'}</div></div>
                    <div class="detail-row"><div class="detail-label">Phone:</div><div>${app.applicant?.phone || '-'}</div></div>
                    <div class="detail-row"><div class="detail-label">Nationality:</div><div>${app.applicant?.nationality || '-'}</div></div>
                    <div class="detail-row"><div class="detail-label">Occupation:</div><div>${app.applicant?.occupation || '-'}</div></div>
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

// Load admin data if on admin page
if (document.getElementById('tableBody')) {
    loadApplications();
}