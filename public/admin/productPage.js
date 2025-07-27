// create Product section

// create Product cropper start
let cropper;  // Cropper.js instance
let selectedFiles = [];  // Array to hold selected files
let croppedImages = [];  // Array to hold cropped images (blobs)
let currentIndex = 0;    // Track which image is being cropped

// Function to handle the selection of multiple images
function startCropperForMultipleImages(event) {

    
    selectedFiles = event.target.files;  // Get selected files
    currentIndex = 0;  // Start with the first image

    if (selectedFiles && selectedFiles.length > 0) {
        
        showCropperForImage(currentIndex);  // Show the cropper for the first image
    }
}

// Function to display the cropper for a specific image
function showCropperForImage(index) {
    if (index < selectedFiles.length) {
     
        const file = selectedFiles[index];
        const reader = new FileReader();

        reader.onload = function(e) {
            const imageUrl = e.target.result;
            const imagePreview = document.getElementById('cropImagePreview');

            // Show the cropping area and load the selected image
            document.getElementById('cropContainer').style.display = 'block';
            imagePreview.src = imageUrl;
            
            // Destroy any existing cropper instance
            if (cropper) {
                cropper.destroy();
            }

            // Initialize Cropper.js
            cropper = new Cropper(imagePreview, {
                aspectRatio: 4/3,  // Set the aspect ratio (customize as needed)
                viewMode: 2,
                autoCropArea: 1,
            });
        };

        reader.readAsDataURL(file);  // Read the selected image file
    } else {
        // Hide the cropper when all images are processed
        document.getElementById('cropContainer').style.display = 'none';
    }
}

// Function to crop the current image and move to the next one
function cropNextImage() {
    cropper.getCroppedCanvas().toBlob((blob) => {
        croppedImages.push(blob);  // Add cropped image to array

        // Move to the next image
        currentIndex++;
        if (currentIndex < selectedFiles.length) {
            showCropperForImage(currentIndex);  // Show next image in the cropper
        } else {
            // All images cropped, hide the cropper
            document.getElementById('cropContainer').style.display = 'none';
            console.log('All images cropped');
        }
    });
}
// create Product cropper start



// create Products OnSubmit start
function createProduct(event) {
    event.preventDefault();

    // Clear previous error messages
    document.querySelectorAll('.invalid-feedback').forEach(el => el.style.display = 'none');

    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const description = document.getElementById('productDescription').value.trim();
    const images = document.getElementById('productImages').files;

    console.log(images)
    let isValid = true;

    // Validate product name
    if (!name) {
        document.getElementById('nameError').style.display = 'block';
        isValid = false;
    }

    // Validate category
    if (!category) {
        document.getElementById('categoryError').style.display = 'block';
        isValid = false;
    }

    // Validate price
    if (isNaN(price) || price < 0) {
        document.getElementById('priceError').style.display = 'block';
        isValid = false;
    }

    // Validate stock
    if (isNaN(stock) || stock < 0) {
        document.getElementById('stockError').style.display = 'block';
        isValid = false;
    }

    // Validate description
    if (description.length < 30) {
        document.getElementById('descriptionError').style.display = 'block';
        isValid = false;
    }

    // Validate images
    if (images.length === 0) {
        document.getElementById('imagesError').style.display = 'block';
        isValid = false;
    }

    // If validation fails, stop the process
    if (!isValid) {
        return;
    }

    // Ensure images are cropped
    if (croppedImages.length === 0 || croppedImages.length !== selectedFiles.length) {
        Swal.fire({
            icon: 'error',
            title: 'Image Cropping Incomplete',
            text: 'Please ensure all images are cropped before submitting.',
            confirmButtonText: 'OK'
        });
        return; // Stop the form submission if validation fails
    }

    // Show SweetAlert confirmation dialog
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to create this product?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            const formElement = document.getElementById("createProductForm");
            const formData = new FormData(formElement);

            // Append cropped images to FormData
            croppedImages.forEach((croppedImage, index) => {
                formData.append('croppedImages[]', croppedImage, `croppedImage_${index}.png`);
            });

            // Proceed with the Axios POST request
            axios.post('/admin/product/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true // Include cookies in the request
            })
            .then(response => {
                if (response.data.success) {
                    // Show success notification
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: response.data.message,
                    }).then(() => {
                        // Redirect after alert
                        window.location.href = response.data.red;
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: response.data.message,
                        confirmButtonText: 'OK'
                    });
                }
            })
            .catch(error => {
                if (error.response && error.response.data) {
                    // Show error notification using SweetAlert
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: error.response.data.message,
                        confirmButtonText: 'OK'
                    }).then(() => {
                        if (error.response.data.redirect) {
                            // Redirect after error alert if needed
                            window.location.href = error.response.data.red;
                        }
                    });
                } else {
                    console.error('Error:', error);
                    // Fallback error notification
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'An unexpected error occurred.',
                    });
                }
            });
        }
    });
}
// <!-- Create Product using Axios Start -->

function submitEditedProduct(e) {
    e.preventDefault(); // Prevent form submission

    // Clear previous error messages
    document.getElementById('productNameError').textContent = '';
    document.getElementById('productCategoryError').textContent = '';
    document.getElementById('productPriceError').textContent = '';
    document.getElementById('productStockError').textContent = '';
    document.getElementById('productDescriptionError').textContent = '';

    // Get the form element and its inputs
    const formElement = document.getElementById('editProductForm');
    const productId = document.getElementById('editProductId').value;
    const productName = document.getElementById('editProductName').value.trim();
    const productCategory = document.getElementById('editProductCategory').value;
    const productPrice = parseFloat(document.getElementById('editProductPrice').value);
    const productStock = parseInt(document.getElementById('editProductStock').value);
    const productDescription = document.getElementById('editProductDescription').value.trim();

    // Basic validation
    let hasError = false;

    if (!productName) {
        document.getElementById('productNameError').textContent = 'Product Name is required.';
        hasError = true;
    }

    if (!productCategory) {
        document.getElementById('productCategoryError').textContent = 'Category is required.';
        hasError = true;
    }

    if (isNaN(productPrice) || productPrice < 0) {
        document.getElementById('productPriceError').textContent = 'Price must be a positive number.';
        hasError = true;
    }

    if (isNaN(productStock) || productStock < 0) {
        document.getElementById('productStockError').textContent = 'Stock must be a positive number.';
        hasError = true;
    }

    if (!productDescription) {
        document.getElementById('productDescriptionError').textContent = 'Description is required.';
        hasError = true;
    }

    if (hasError) {
        return; // Stop the function execution if there are validation errors
    }

    // Show confirmation dialog
    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to update this product?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'No, cancel!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Get the form data
            const formData = new FormData(formElement);

            // Append the cropped image blob if available
            editCroppedImages.forEach((editCroppedImage, index) => {
                formData.append('croppedImages[]', editCroppedImage, `croppedImage_${index}.png`);
            });

            // Send the data to the server
            axios.post(`/admin/product/edit/${productId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true // Include cookies in the request
            })
            .then(response => {
                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        confirmButton: false,
                        text: response.data.message,
                    }).then(() => {
                        window.location.href = response.data.red; // Redirect after success
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Error updating product',
                    confirmButtonText: 'OK'
                });
            });
        } else {
            // If the user canceled the action
            Swal.fire({
                icon: 'info',
                title: 'Cancelled',
                text: 'Product update has been canceled.',
                confirmButtonText: 'OK'
            });
        }
    });

    return false; // Prevent the page from reloading
}



// Edit modal pre-population logic Start
document.querySelectorAll('.edit-button').forEach(button => {
button.addEventListener('click', function() {
    // Get data attributes from the clicked button
    const id = this.getAttribute('data-id');
    const name = this.getAttribute('data-name');
    const category = this.getAttribute('data-category');
    const price = this.getAttribute('data-price');
    const stock = this.getAttribute('data-stock');
    const description = this.getAttribute('data-description');
   

    // Set the modal fields with the respective data
    document.getElementById('editProductId').value = id;
    document.getElementById('editProductName').value = name;
    document.getElementById('editProductCategory').value = category;
    document.getElementById('editProductPrice').value = price;
    document.getElementById('editProductStock').value = stock;
    document.getElementById('editProductDescription').value = description;

    // If you want to handle images, load them similarly
    const images = this.getAttribute('data-images').split(',');

      const existingImagesContainer = document.getElementById('existingImages');
      existingImagesContainer.innerHTML = ''; // Clear previous images
      images.forEach((image, index) => {
          const imageWrapper = document.createElement('div');
          imageWrapper.className = 'existing-image-wrapper';
          imageWrapper.id = `image-${index}`;
          imageWrapper.innerHTML = `
              <div class="image-delete-icon">
                  <i class="fas fa-trash-alt" onclick="removeImage(${index})"></i>
              </div>
              <img src="/images/${image}" alt="Product Image" class="img-thumbnail" width="100">
              <input type="hidden" name="existingImages[]" value="${image}">
          `;
          existingImagesContainer.appendChild(imageWrapper);
      });
});
})
// Edit modal pre-population logic End



// remove images by click button start

function removeImage(index) {
const imageElement = document.getElementById(`image-${index}`);
const imageInput = imageElement.querySelector('input[name="existingImages[]"]');
const imageName = imageInput.value; // Get the image name to be deleted
const productId = document.getElementById('editProductId').value; // Get the product ID

Swal.fire({
    title: 'Are you sure?',
    text: "Do you want to delete this Image?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes'
}).then((result) => {
    if (result.isConfirmed) {
        fetch(`product/remove-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageName, productId }) // Send the image name and product ID as JSON
        })
        .then(response => response.json()) // Parse the JSON response
        .then(data => {
            if (data.success) {
                // If successful, remove the image from the DOM
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: data.msg, // Assuming the message is in data.msg
                });
                imageElement.remove(); // Remove the image element from the DOM
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: data.msg || 'Error removing image',
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'An error occurred while removing the image.',
            });
        });
    }
});
}
// remove images by click button End




// editer section section and API Start
let editCropper;  // Cropper.js instance for editing
let editSelectedFiles = [];  // Array to hold selected files for editing
let editCroppedImages = [];  // Array to hold cropped images (blobs) for editing
let editCurrentIndex = 0;    // Track which image is being cropped in edit

// Function to handle the selection of multiple images for editing
function startCropperForEditImages(event) {
    editSelectedFiles = event.target.files;  // Get selected files
    editCurrentIndex = 0;  // Start with the first image

    if (editSelectedFiles && editSelectedFiles.length > 0) {
        showEditCropperForImage(editCurrentIndex);  // Show the cropper for the first image
    }
}

// Function to display the cropper for a specific image in edit
function showEditCropperForImage(index) {
    if (index < editSelectedFiles.length) {
        const file = editSelectedFiles[index];
        const reader = new FileReader();

        reader.onload = function(e) {
            const imageUrl = e.target.result;
            const imagePreview = document.getElementById('editCropImagePreview');

            // Show the cropping area and load the selected image
            document.getElementById('editCropContainer').style.display = 'block';
            imagePreview.src = imageUrl;
            
            // Destroy any existing cropper instance
            if (editCropper) {
                editCropper.destroy();
            }

            // Initialize Cropper.js
            editCropper = new Cropper(imagePreview, {
                aspectRatio: 4 / 3,  // Set the aspect ratio (customize as needed)
                viewMode: 2,
                autoCropArea: 1,
            });
        };

        reader.readAsDataURL(file);  // Read the selected image file
    } else {
        // Hide the cropper when all images are processed
        document.getElementById('editCropContainer').style.display = 'none';
    }
}

// Function to crop the current image and move to the next one in edit
function editCropNextImage() {
    editCropper.getCroppedCanvas().toBlob((blob) => {
        editCroppedImages.push(blob);  // Add cropped image to array

        // Move to the next image
        editCurrentIndex++;
        if (editCurrentIndex < editSelectedFiles.length) {
            showEditCropperForImage(editCurrentIndex);  // Show next image in the cropper
        } else {
            // All images cropped, hide the cropper
            document.getElementById('editCropContainer').style.display = 'none';
            console.log('All images cropped');
        }
    });
}




// List and Unlist section section and API Start

async function listProduct(productId) {
    const { value: confirmation } = await Swal.fire({
        title: 'Are you sure?',
        text: "You are about to list this product!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, list it!'
    });

    if (confirmation) {
        try {
            const response = await axios.patch(`/admin/product/list/${productId}`);
            
            // Show success alert
            Swal.fire({
                title: 'Listed!',
                text: response.data.message,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            // Update button text and class to "Unlist"
            const button = document.getElementById(`list-unlist-btn-${productId}`);
            button.textContent = 'Unlist';
            button.classList.remove('btn-info');
            button.classList.add('btn-danger');
            button.setAttribute('onclick', `unlistProduct('${productId}')`);

            // Update status field to "Listed"
            const statusBadge = document.getElementById(`status-badge-${productId}`);
            statusBadge.textContent = 'Listed';
            statusBadge.classList.remove('badge-danger');  // Remove "Unlisted" class
            statusBadge.classList.add('badge-success');    // Add "Listed" class
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: error.response.data.message || 'Failed to list the product.',
                icon: 'error',
                timer: 1500,
                showConfirmButton: false
            });
        }
    }
}

async function unlistProduct(productId) {
    const { value: confirmation } = await Swal.fire({
        title: 'Are you sure?',
        text: "You are about to unlist this product!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, unlist it!'
    });

    if (confirmation) {
        try {
            const response = await axios.patch(`/admin/product/unlist/${productId}`);
            
            // Show success alert
            Swal.fire({
                title: 'Unlisted!',
                text: response.data.message,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            // Update button text and class to "List"
            const button = document.getElementById(`list-unlist-btn-${productId}`);
            button.textContent = 'List';
            button.classList.remove('btn-danger');
            button.classList.add('btn-info');
            button.setAttribute('onclick', `listProduct('${productId}')`);

            // Update status field to "Unlisted"
            const statusBadge = document.getElementById(`status-badge-${productId}`);
            statusBadge.textContent = 'Unlisted';
            statusBadge.classList.remove('badge-success');  // Remove "Listed" class
            statusBadge.classList.add('badge-danger');      // Add "Unlisted" class
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: error.response.data.message || 'Failed to unlist the product.',
                icon: 'error',
                timer: 1500,
                showConfirmButton: false
            });
        }
    }
}

// List and Unlist section section and API End




