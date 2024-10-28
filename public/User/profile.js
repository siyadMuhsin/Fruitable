function toggleEditForm() {
    var detailsView = document.getElementById('details-view');
    var detailsEdit = document.getElementById('details-edit');
    console.log(detailsEdit)
    
    // Toggle visibility between view and edit mode
    if (detailsView.style.display === "none") {
        detailsView.style.display = "block";
        detailsEdit.style.display = "none";
    } else {
        detailsView.style.display = "none";
        detailsEdit.style.display = "block";
    }
}

function editDetails(event) {
event.preventDefault();
document.querySelectorAll('.error-message').forEach(function(el) {
    el.textContent = '';
});
const username = document.getElementById('username').value.trim();
const phoneInput = document.getElementById('phone');
const phone = phoneInput.value.trim();


const phoneRegex = /^\d{10}$/; 

let isValid=true

if(!username){
   
    document.getElementById('detailsName').textContent='name required'
    isValid=false
}
if (!phoneRegex.test(phone)) {
    
    phoneInput.style.borderColor = 'red'; // Change border color to red
    document.getElementById('detailsPhone').textContent='Please enter a valid 10-digit phone number.'   
   isValid=false
} else {
    phoneInput.style.borderColor = 'green';
}

if(!isValid){
    return false
}
const data = {
    username: username,
    phone: phone
};

// SweetAlert2 confirmation dialog
Swal.fire({
    title: 'Are you sure?',
    text: "You want to update your details!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, update it!',
    
}).then((result) => {
    if (result.isConfirmed) {
        // If confirmed, send the Axios request
        axios.patch('/profile/edit', data)
            .then((response) => {
                // Show a success notification
                Swal.fire({
                    title: 'Success!',
                    text: 'Details updated successfully!',
                    icon: 'success',
                    timer: 1500, // Automatically close after 1.5 seconds
                    showConfirmButton: false,
                });
                setTimeout(() => {
                    window.location.reload(); // Reload to show updated details
                }, 1500);
            })
            .catch((error) => {
                // Show an error notification
                Swal.fire({
                    title: 'Error!',
                    text: 'There was an error updating your details. Please try again.',
                    icon: 'error',
                    timer: 1500, // Automatically close after 1.5 seconds
                    showConfirmButton: false,
                });
                console.error('Error updating details:', error);
            });
    }
});
}


//address submission

function submitAddressForm(event) {
    event.preventDefault();

    document.querySelectorAll('.error-message').forEach(function(el) {
        el.textContent = '';
    });

    // Get form field values
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('addressphone').value.trim();
    const pincode = document.getElementById('pincode').value.trim();
    const locality = document.getElementById('locality').value.trim();
    const district = document.getElementById('district').value.trim();
    const state = document.getElementById('state').value.trim();
    const country = document.getElementById('country').value.trim();
    const address = document.getElementById('addressInput').value.trim();
    const addressType = document.querySelector('input[name="addressType"]:checked');

    console.log(phone)
    // Regex patterns for validation
    const namePattern = /^[A-Za-z]+$/;
    const phonePattern = /^\d{10}$/;
    const pincodePattern = /^\d{6}$/;

    let isValid = true;

    if (!namePattern.test(name)) {
        document.getElementById('nameError').textContent = "Name should contain only characters with no spaces.";
        isValid = false;
    }

    // Validate phone number
    const sameDigitPattern = /^(\d)\1{9}$/; // Pattern to check if all digits are the same
    if (!phonePattern.test(phone) || phone === "0000000000" || sameDigitPattern.test(phone)) {
        document.getElementById('phoneError').textContent = "Phone number must be exactly 10 digits, cannot be all zeros, and cannot consist of the same digit.";
        isValid = false;
    }

    if (!pincodePattern.test(pincode)) {
        document.getElementById('pincodeError').textContent = "PIN code must be exactly 6 digits.";
        isValid = false;
    }
    if (!locality) {
        document.getElementById('localityError').textContent = "Locality is required.";
        isValid = false;
    }
    if (!district) {
        document.getElementById('districtError').textContent = "District is required.";
        isValid = false;
    }
    if (!state) {
        document.getElementById('stateError').textContent = "State is required.";
        isValid = false;
    }
    if (!country) {
        document.getElementById('countryError').textContent = "Country is required.";
        isValid = false;
    }
    if (!address) {
        document.getElementById('addressError').textContent = "Address is required.";
        isValid = false;
    }
    if (!addressType) {
        document.getElementById('addressTypeError').innerText = "Please select an address type.";
        return false;
    } else {
        document.getElementById('addressTypeError').innerText = ""; // Clear the error message if valid
    }

    if (!isValid) {
        return false;
    }
    
    const addAddressForm = document.getElementById('addAddressForm');
    const formData = new FormData(addAddressForm);

    const addressData = {};
    formData.forEach((value, key) => {
        addressData[key] = value;
    });

    Swal.fire({
        title: 'Confirm Submission',
        text: 'Are you sure you want to add this address?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, add it!',
        cancelButtonText: 'No, cancel!',
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            axios.post('/address/add_addresses', addressData)
                .then(response => {
                    if (response.data.success) {
                        Swal.fire({
                            title: 'Success!',
                            text: 'Address added successfully!',
                            icon: 'success',
                            confirmButtonText: 'OK',
                            customClass: {
                                confirmButton: 'btn btn-success'
                            }
                        }).then(() => {
                            document.querySelector('#addAddressModal .btn-close').click(); // Close the modal
                            location.reload();
                        });
                    } else {
                        Swal.fire({
                            title: 'Error!',
                            text: 'Failed to add address. Please try again.',
                            icon: 'error',
                            showConfirmButton: false,
                            timer: 1500
                        });
                    }
                })
                .catch(error => {
                    Swal.fire({
                        title: 'Server Error!',
                        text: 'Please try again later.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'btn btn-danger'
                        }
                    });
                });
        }
    });
}


  // JavaScript to open the modal when the "Edit" button is clicked
  document.getElementById('editAddressBtn').addEventListener('click', () => {
    $('#editAddressModal').modal('show');
});
    
    // Form validation function
  async function submitEditAddressForm(event) {
        event.preventDefault();

        const editAddressForm = document.getElementById('editAddressForm');
        document.querySelectorAll('.error-message').forEach(function(el) {
            el.textContent = '';
        });

        const name = document.getElementById('editName').value.trim();
        const phone = document.getElementById('editPhone').value.trim();
        const pincode = document.getElementById('editPincode').value.trim();
        const locality = document.getElementById('editLocality').value.trim();
        const district = document.getElementById('editDistrict').value.trim();
        const state = document.getElementById('editState').value.trim();
        const country = document.getElementById('editCountry').value.trim();
        const address = document.getElementById('editAddress').value.trim();
        const addressType = document.querySelector('input[name="addressType"]:checked');

     
    const phonePattern = /^\d{10}$/;
    const pincodePattern = /^\d{6}$/;
    let isValid = true; // Flag to track form validity
    if (!name) {
        document.getElementById('editNameError').textContent = "Name should be required.";
        isValid = false;
    }
    if (!phonePattern.test(phone)) {
        document.getElementById('editPhoneError').textContent = "Phone number must be exactly 10 digits.";
        isValid = false;
    }
    if (!pincodePattern.test(pincode)) {
        document.getElementById('editPincodeError').textContent = "PIN code must be exactly 6 digits.";
        isValid = false;
    }
    if (!locality) {
        document.getElementById('editLocalityError').textContent = "Locality is required.";
        isValid = false;
    }
    if (!district) {
        document.getElementById('editDistrictError').textContent = "District is required.";
        isValid = false;
    }
    if (!state) {
        document.getElementById('editStateError').textContent = "State is required.";
        isValid = false;
    }
    if (!country) {
        document.getElementById('editCountryError').textContent = "Country is required.";
        isValid = false;
    }
    if (!address) {
        document.getElementById('editAddressError').textContent = "Address is required.";
        isValid = false;
    }
    if (!isValid) {
        return false;
    }
const formData = new FormData(editAddressForm);
console.log(formData)
const addressData = {};
formData.forEach((value, key) => {
    addressData[key] = value;
});
        console.log("edit address" ,addressData)
        

         // SweetAlert confirmation before submission
    await Swal.fire({
        title: 'Confirm Submission',
        text: 'Are you sure you want to edit this address?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, add it!',
        cancelButtonText: 'No, cancel!',
        customClass: {
            confirmButton: 'btn btn-success', // Success button styling
            cancelButton: 'btn btn-danger' // Cancel button styling
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // If confirmed, make the Axios POST request
            axios.put('/address/edit_address', addressData)
                .then(response => {
                    if (response.data.success) {
                        // SweetAlert success notification
                        Swal.fire({
                            title: 'Success!',
                            text: 'Address editted  successfully!',
                            icon: 'success',
                            showConfirmButton: false,
                            timer: 1500
                            
                        }).then(() => {
                            document.querySelector('#addAddressModal .btn-close').click(); // Close the modal
                            // Optionally, refresh the address list or update UI
                            $('#editAddressModal').modal('hide');
                            location.reload()
                        });
                    } else {
                        // SweetAlert error notification
                        Swal.fire({
                            title: 'Error!',
                            text: 'Failed to edit address. Please try again.',
                            icon: 'error',
                            confirmButtonText: 'OK',
                            customClass: {
                                confirmButton: 'btn btn-danger' // Add your custom button class
                            }
                        });
                    }
                })
                .catch(error => {
                    console.error('Error adding address:', error);
                    // SweetAlert server error notification
                    Swal.fire({
                        title: 'Server Error!',
                        text: 'Please try again later.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'btn btn-danger' // Add your custom button class
                        }
                    });
                });
        }
    });
        
    }




    // delete Addresses
    async function deleteAddress(addressId){

        // Confirm before deletion using SweetAlert
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You won’t be able to recover this address!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            customClass: {
                confirmButton: 'btn btn-danger',
                cancelButton: 'btn btn-secondary'
            }
        });
        if(result.isConfirmed){
            axios.delete(`/address/delete/${addressId}`)
            .then((response)=>{
                if(response.data.success){
                    Swal.fire({
                            title: 'Deleted!',
                            text: 'Address has been deleted.',
                            icon: 'success',
                            confirmButtonText: 'OK',
                            customClass: {
                                confirmButton: 'btn btn-success'
                            }
                        }).then(()=>{
                            location.reload()
                        })
                    
                }else{
                    // Show error message
            Swal.fire({
                title: 'Error!',
                text: 'Failed to delete address.',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton: 'btn btn-danger'
                }
            });

                }
            })
      
        .catch(error => {
                    console.error('Error deleting address:', error);
                    Swal.fire({
                        title: 'Server Error!',
                        text: 'Please try again later.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'btn btn-danger'
                        }
                    });
                });
        
            }
    }



    