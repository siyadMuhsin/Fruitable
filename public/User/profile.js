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
const username = document.getElementById('username').value;
const phoneInput = document.getElementById('phone');
const phone = phoneInput.value;

// Validate phone number
const phoneRegex = /^\d{10}$/; // Regex for 10 digits only

if (!phoneRegex.test(phone)) {
    // Invalid phone number
    phoneInput.style.borderColor = 'red'; // Change border color to red
    alert('Please enter a valid 10-digit phone number.'); // Alert the user
    return; // Stop form submission
} else {
    // Valid phone number
    phoneInput.style.borderColor = 'green'; // Change border color to green
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

    // Get form field values
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const pincode = document.getElementById('pincode').value.trim();
    const locality = document.getElementById('locality').value.trim();
    const district = document.getElementById('district').value.trim();
    const state = document.getElementById('state').value.trim();
    const country = document.getElementById('country').value.trim();
    const address = document.getElementById('address').value.trim();
    const addressType = document.querySelector('input[name="addressType"]:checked');

    // Regex patterns for validation
    const namePattern = /^[A-Za-z]+$/;
    const phonePattern = /^\d{10}$/;
    const pincodePattern = /^\d{6}$/;

    // Validate name
    if (!namePattern.test(name)) {
        alert("Name should contain only characters with no spaces.");
        return false;
    }

    // Validate phone number
    if (!phonePattern.test(phone)) {
        alert("Phone number must be exactly 10 digits.");
        return false;
    }

    // Validate pincode
    if (!pincodePattern.test(pincode)) {
        alert("PIN code must be exactly 6 digits.");
        return false;
    }

    // Validate required fields
    if (!locality) {
        alert("Locality is required.");
        return false;
    }
    if (!district) {
        alert("District is required.");
        return false;
    }
    if (!state) {
        alert("State is required.");
        return false;
    }
    if (!country) {
        alert("Country is required.");
        return false;
    }
    if (!address) {
        alert("Address is required.");
        return false;
    }

    // Validate address type selection
    if (!addressType) {
        alert("Please select an address type.");
        return false;
    }

    // Proceed to form submission if validation is successful
    const addAddressForm = document.getElementById('addAddressForm');
    const formData = new FormData(addAddressForm);

    const addressData = {};
    formData.forEach((value, key) => {
        addressData[key] = value;
    });

    // SweetAlert confirmation before submission
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
            // If confirmed, make the Axios POST request
            axios.post('/address/add_addresses', addressData)
                .then(response => {
                    if (response.data.success) {
                        // SweetAlert success notification
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

// Create a FormData object from the form
const formData = new FormData(editAddressForm);
console.log(formData)

// Create an object to hold the form data
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
        // Additional validation logic if needed
        
        
        // $('#editAddressModal').modal('hide');
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