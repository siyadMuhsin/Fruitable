// create Products
function createProduct(event) {
    event.preventDefault();

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
// <!-- Create Product using Axios -->

// Edit Product using Axios
// let cropper; // Cropper.js instance
// let croppedBlob; // Variable to hold cropped image blob

// function loadImageForCropping(event) {
//     const image = document.getElementById('imageToCrop');
//     const file = event.target.files[0]; // Get the first selected file
//     const reader = new FileReader();

//     reader.onload = function(e) {
//         image.src = e.target.result; // Set the image source to the uploaded file
//         document.getElementById('cropperContainer').style.display = 'block'; // Show the cropping container

//         // Destroy previous cropper if exists
//         if (cropper) {
//             cropper.destroy();
//         }

//         // Initialize Cropper.js
//         cropper = new Cropper(image, {
//             aspectRatio: 1, // Set aspect ratio (1:1 for square)
//             viewMode: 1, // Set view mode
//         });
//     };

//     reader.readAsDataURL(file); // Read the file as Data URL
// }

// function cropImage() {
//     // Get the cropped image
//     cropper.getCroppedCanvas().toBlob((blob) => {
//         croppedBlob = blob; // Store the cropped image blob

//         // Display cropped image in preview
//         const preview = document.getElementById('croppedImagePreview');
//         const url = URL.createObjectURL(croppedBlob);
//         const imgPreview = document.createElement('img');
//         imgPreview.src = url;
//         imgPreview.style.maxWidth = '200px'; // Set max width for preview
//         preview.innerHTML = ''; // Clear previous previews
//         preview.appendChild(imgPreview); // Append new preview image
//     });
// }

function submitEditedProduct(e) {
    e.preventDefault(); // Prevent form submission

    // Get the product ID
    const productId = document.getElementById('editProductId').value;

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
            const formElement = document.getElementById('editProductForm');
            const formData = new FormData(formElement);

            // Append the cropped image blob if available
            editCroppedImages.forEach((editCroppedImages, index) => {
                formData.append('croppedImages[]', editCroppedImages, `croppedImage_${index}.png`);
            });

            // Log form data for debugging
            for (var pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]); // Log key-value pairs
            }

            console.log('Product ID:', productId); // Ensure correct ID is printed

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
// Edit modal pre-population logic
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

// remove images by click button

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