// filter chaging function.

function handleFilterChange() {
    console.log("siyad")
    const filter = document.getElementById('filter').value;
    const customDateFields = document.getElementById('customDateFields');
    if (filter === 'custom') {
        customDateFields.style.display = 'block';
    } else {
        customDateFields.style.display = 'none';
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
    }
    if (filter === 'custom') {
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        // Reset previous error message
        const errorMessage = document.getElementById('dateErrorMessage');
        if (errorMessage) {
            errorMessage.textContent = '';
        }
        if (startDateInput.value && endDateInput.value) {
            if (startDate > endDate) {
                // Show error message if start date is later than end date
                if (!errorMessage) {
                    const errorDiv = document.createElement('div');
                    errorDiv.id = 'dateErrorMessage';
                    errorDiv.style.color = 'red'; // Set error message color
                    errorDiv.textContent = 'Start date must be earlier than or equal to the end date.';
                    customDateFields.appendChild(errorDiv);
                }
                document.querySelector('button[type="submit"]').disabled = true;
            } else if (startDate > today || endDate > today) {
                // Show error message if dates are in the future
                if (!errorMessage) {
                    const errorDiv = document.createElement('div');
                    errorDiv.id = 'dateErrorMessage';
                    errorDiv.style.color = 'red'; // Set error message color
                    errorDiv.textContent = 'Dates cannot be in the future.';
                    customDateFields.appendChild(errorDiv);
                }
                // Disable the submit button if there is an error
                document.querySelector('button[type="submit"]').disabled = true;
            } else {
                // Remove error message if validation passes
                if (errorMessage) {
                    errorMessage.textContent = '';
                    errorMessage.remove();
                }
                // Enable the submit button
                document.querySelector('button[type="submit"]').disabled = false;
            }
        }
    }
}

// Pdf Download Function

document.getElementById('downloadPDF').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;

    // Set custom page size (420mm x 297mm, larger than A3 size)
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [420, 297]
    });

    // Define colors
    const colors = {
        primary: [41, 128, 185],    // Blue
        secondary: [46, 204, 113],  // Green
        accent: [155, 89, 182],     // Purple
        warning: [243, 156, 18],    // Orange
        header: [52, 73, 94],       // Dark Blue Gray
        border: [189, 195, 199]     // Light Gray
    };

    // Add company logo placeholder
    doc.setDrawColor(...colors.primary);
    doc.setFillColor(...colors.primary);
    doc.rect(20, 10, 50, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('Fruitables', 28, 23);

    // Add Title with styling, shifted right
    const reportFilter = "<%= reportFilter === 'all' ? 'Total Sales Report' : reportFilter + ' Sales Report' %>";
    doc.setFontSize(24);
    doc.setTextColor(...colors.header);
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 35, 420, 15, 'F');
    doc.text(reportFilter, 130, 45, { align: 'center' }); // Shifted right

    // Add Current Date with styling at the top right
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(12);
    doc.setTextColor(...colors.primary);
    doc.text(`Date: ${currentDate}`, 240, 10); // Top right

    // Style for table headers
    let y = 60;
    const headers = ['Order ID', 'Name', 'Date', 'Items', 'Amount', 'Offer', 'Coupon', 'Total Price', 'Payment Method'];
    const positions = [20, 60, 100, 130, 150, 170, 195, 220, 250];
    const colWidths = [40, 40, 30, 20, 20, 25, 25, 30, 30];

    // Add header background
    doc.setFillColor(...colors.header);
    doc.rect(18, y - 7, 282, 12, 'F');

    // Draw table headers with white text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    headers.forEach((header, index) => {
        doc.text(header, positions[index], y);
    });

    y += 10;

    // Fetch data
    const reportData = <%- JSON.stringify(reportData) %>;
    const totalSalesAmount = Number(<%= totalSalesAmount %>);
    const totalDiscountAmount = Number(<%= totalDiscountAmount %>);
    const totalOfferDiscountAmount = Number(<%= totalOfferDiscountAmount %>);

    // Alternate row colors
    let isEvenRow = false;
    reportData.forEach(order => {
        if (isEvenRow) {
            doc.setFillColor(245, 245, 245);
            doc.rect(18, y - 5, 282, 10, 'F');
        }

        doc.setTextColor(...colors.header);
        doc.setFontSize(11);

        doc.text(order.orderId.toString(), positions[0], y);
        doc.text(order.clientName, positions[1], y);
        doc.text(order.orderDate, positions[2], y);
        doc.text(order.itemsCount.toString(), positions[3], y);

        doc.setTextColor(...colors.primary);
        doc.text(Number(order.totalAmount).toFixed(), positions[4], y);
        doc.setTextColor(...colors.warning);
        doc.text(Number(order.offerPrice).toFixed(), positions[5], y);
        doc.text(Number(order.couponDiscount).toFixed(), positions[6], y);
        doc.setTextColor(...colors.secondary);
        doc.text(Number(order.finalPrice).toFixed(), positions[7], y);
        doc.setTextColor(...colors.accent);
        doc.text(order.paymentMethod || 'N/A', positions[8], y);

        y += 10;
        isEvenRow = !isEvenRow;

        if (y > 280) {
            doc.addPage();
            y = 20;
            
            doc.setFillColor(...colors.header);
            doc.rect(18, y - 7, 282, 12, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            headers.forEach((header, index) => {
                doc.text(header, positions[index], y);
            });
            y += 10;
        }
    });

    y += 10;
    
    // Add summary box
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y - 5, 150, 45, 'F');
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.rect(20, y - 5, 150, 45);

    // Add summary text
    doc.setFontSize(14);
    doc.setTextColor(...colors.primary);
    doc.text('Total Sales Amount:', 30, y);
    doc.text(`${totalSalesAmount.toFixed(2)}`, 140, y, { align: 'right' });
    
    y += 15;
    doc.setTextColor(...colors.warning);
    doc.text('Total Coupon Discount:', 30, y);
    doc.text(`${totalDiscountAmount.toFixed(2)}`, 140, y, { align: 'right' });
    
    y += 15;
    doc.setTextColor(...colors.secondary);
    doc.text('Total Offer Discount:', 30, y);
    doc.text(`${totalOfferDiscountAmount.toFixed(2)}`, 140, y, { align: 'right' });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(...colors.header);
        doc.text(`Page ${i} of ${pageCount}`, 210, 290, { align: 'center' });
    }

    // Save the PDF
    doc.save(`${reportFilter}.pdf`);
});

// Excel download function 

document.getElementById('downloadExcel').addEventListener('click', function() {
    const XLSX = window.XLSX;
    const workbook = XLSX.utils.book_new();

    // Define the sheet name and add a header row
    const sheetName = "Sales Report";
    const reportData = <%- JSON.stringify(reportData) %>;
    const totalSalesAmount = Number(<%= totalSalesAmount %>);
    const totalDiscountAmount = Number(<%= totalDiscountAmount %>);
    const totalOfferDiscountAmount = Number(<%= totalOfferDiscountAmount %>);

    // Add the current date at the top of the sheet
    const currentDate = new Date().toLocaleDateString();
    const worksheetData = [
        [`Generated on: ${currentDate}`], // Current date row
        [], // Blank row for spacing
        ["Order ID", "Name", "Date", "Items", "Amount", "Offer", "Coupon", "Total Price", "Payment Method"], // Header row
        ...reportData.map(order => [
            order.orderId,
            order.clientName,
            order.orderDate,
            order.itemsCount,
            Number(order.totalAmount).toFixed(),
            Number(order.offerPrice).toFixed(),
            Number(order.couponDiscount).toFixed(),
            Number(order.finalPrice).toFixed(),
            order.paymentMethod || 'N/A'
        ]),
        [], // Blank row for spacing
        ["", "", "", "", "", "", "", "Total Sales Amount:", totalSalesAmount.toFixed(2)],
        ["", "", "", "", "", "", "", "Total Coupon Discount:", totalDiscountAmount.toFixed(2)],
        ["", "", "", "", "", "", "", "Total Offer Discount:", totalOfferDiscountAmount.toFixed(2)]
    ];

    // Create worksheet from data array
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Optional: Set custom column widths
    worksheet['!cols'] = [
        { wch: 15 },  // Order ID width
        { wch: 20 },  // Name width
        { wch: 15 },  // Date width
        { wch: 10 },  // Items width
        { wch: 12 },  // Amount width
        { wch: 12 },  // Offer width
        { wch: 15 },  // Coupon width
        { wch: 15 },  // Total Price width
        { wch: 18 }   // Payment Method width
    ];

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Trigger download
    XLSX.writeFile(workbook, `${sheetName}.xlsx`);
});

// 

