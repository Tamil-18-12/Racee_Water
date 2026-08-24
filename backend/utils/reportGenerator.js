import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDateTime = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

// ==================== PDF GENERATION ====================

export const generateCustomerHistoryPdfBuffer = (customer, orders, settings) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Title & Subtitle
      doc.fillColor('#0077b6').fontSize(18).text(settings.businessName || 'Racee Water', { align: 'center' });
      doc.moveDown(0.3);
      doc.fillColor('#555555').fontSize(10).text(`Customer History Report - Generated: ${formatDateTime(new Date())}`, { align: 'center' });
      doc.moveDown(1);

      // Customer Info Box
      doc.rect(40, doc.y, 515, 60).fillAndStroke('#f8f9fa', '#dee2e6');
      const boxY = doc.y + 10;
      doc.fillColor('#212529').fontSize(10);
      doc.text(`Customer Name: ${customer.name || '-'}`, 55, boxY);
      doc.text(`Mobile: ${customer.mobile || '-'}`, 320, boxY);
      doc.text(`Address: ${customer.address || '-'}`, 55, boxY + 20);
      doc.text(`Member Since: ${formatDate(customer.createdAt)}`, 320, boxY + 20);

      doc.y = boxY + 50;
      doc.moveDown(0.8);

      // Summary Section
      doc.fillColor('#023e8a').fontSize(12).text('Account Summary', { underline: true });
      doc.moveDown(0.5);

      const summaryCols = [
        { label: 'Total Orders', val: `${customer.totalOrders || 0}` },
        { label: 'Total Cans', val: `${customer.totalCans || 0}` },
        { label: 'Total Amount', val: `₹${(customer.totalAmount || 0).toFixed(2)}` },
        { label: 'Total Paid', val: `₹${(customer.totalPaid || 0).toFixed(2)}` },
        { label: 'Balance Due', val: `₹${(customer.totalPending || 0).toFixed(2)}` },
        { label: 'Empty Returned', val: `${customer.totalEmptyReturned || 0}/${customer.totalEmptyDelivered || 0}` },
      ];

      const startX = 40;
      let currX = startX;
      let currY = doc.y;
      const colWidth = 85;

      summaryCols.forEach((item, idx) => {
        if (idx === 3) {
          currX = startX;
          currY += 40;
        }
        doc.rect(currX, currY, colWidth - 5, 34).fillAndStroke('#e9ecef', '#ced4da');
        doc.fillColor('#495057').fontSize(7.5).text(item.label, currX + 4, currY + 4, { width: colWidth - 12 });
        doc.fillColor('#212529').fontSize(9.5).text(item.val, currX + 4, currY + 18, { width: colWidth - 12, bold: true });
        currX += colWidth;
      });

      doc.y = currY + 45;
      doc.moveDown(0.8);

      // Order History Table
      doc.fillColor('#023e8a').fontSize(12).text('Order History', { underline: true });
      doc.moveDown(0.5);

      const tableHeaders = ['Date', 'Order ID', 'Cans', 'Amount', 'Paid', 'Balance', 'Empty Ret.', 'Status'];
      const colWidths = [65, 85, 40, 55, 55, 55, 65, 75];

      let tableY = doc.y;
      doc.rect(40, tableY, 515, 20).fill('#004d99');
      doc.fillColor('#ffffff').fontSize(8);

      let headerX = 45;
      tableHeaders.forEach((h, i) => {
        doc.text(h, headerX, tableY + 5, { width: colWidths[i], align: 'left' });
        headerX += colWidths[i];
      });

      tableY += 22;
      doc.fillColor('#212529').fontSize(8);

      (orders || []).forEach((ord, index) => {
        if (tableY > 750) {
          doc.addPage();
          tableY = 40;
        }

        if (index % 2 === 1) {
          doc.rect(40, tableY - 2, 515, 18).fill('#f8f9fa');
        }

        let rowX = 45;
        const rowData = [
          formatDate(ord.createdAt),
          ord.orderId || '-',
          `${ord.numberOfCans || 0}`,
          `₹${Math.round(ord.totalAmount || 0)}`,
          `₹${Math.round(ord.amountPaid || 0)}`,
          `₹${Math.round(ord.balanceAmount || 0)}`,
          `${ord.emptyCansReturned || 0}/${ord.emptyCansDelivered || 0}`,
          ord.orderStatus || 'PENDING',
        ];

        doc.fillColor('#212529');
        rowData.forEach((val, i) => {
          doc.text(val, rowX, tableY + 3, { width: colWidths[i], align: 'left' });
          rowX += colWidths[i];
        });

        tableY += 20;
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export const generateDailyReportPdfBuffer = (date, orders, settings) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const totalCollected = orders.reduce((sum, o) => sum + (o.amountPaid || 0), 0);
      const totalPending = orders.reduce((sum, o) => sum + (o.balanceAmount || 0), 0);
      const totalCans = orders.reduce((sum, o) => sum + (o.numberOfCans || 0), 0);
      const emptyDelivered = orders.reduce((sum, o) => sum + (o.emptyCansDelivered || 0), 0);
      const emptyReturned = orders.reduce((sum, o) => sum + (o.emptyCansReturned || 0), 0);

      // Title & Subtitle
      doc.fillColor('#0077b6').fontSize(18).text(settings.businessName || 'Racee Water', { align: 'center' });
      doc.moveDown(0.3);
      doc.fillColor('#212529').fontSize(11).text(`Daily Report - ${formatDate(date)}`, { align: 'center', bold: true });
      doc.moveDown(0.8);

      // Summary Table
      const summaryItems = [
        { label: 'Total Orders', val: `${orders.length}` },
        { label: 'Total Cans', val: `${totalCans}` },
        { label: 'Total Sales', val: `₹${totalSales.toFixed(2)}` },
        { label: 'Total Collected', val: `₹${totalCollected.toFixed(2)}` },
        { label: 'Total Pending', val: `₹${totalPending.toFixed(2)}` },
        { label: 'Empty Cans Ret.', val: `${emptyReturned}/${emptyDelivered}` },
      ];

      const startX = 40;
      let currX = startX;
      let currY = doc.y;
      const colWidth = 85;

      summaryItems.forEach((item, idx) => {
        if (idx === 3) {
          currX = startX;
          currY += 40;
        }
        doc.rect(currX, currY, colWidth - 5, 34).fillAndStroke('#e9ecef', '#ced4da');
        doc.fillColor('#495057').fontSize(7.5).text(item.label, currX + 4, currY + 4, { width: colWidth - 12 });
        doc.fillColor('#212529').fontSize(9.5).text(item.val, currX + 4, currY + 18, { width: colWidth - 12, bold: true });
        currX += colWidth;
      });

      doc.y = currY + 48;
      doc.moveDown(0.8);

      // Orders Table
      doc.fillColor('#023e8a').fontSize(12).text('Orders Breakdown', { underline: true });
      doc.moveDown(0.5);

      const tableHeaders = ['Order ID', 'Customer', 'Mobile', 'Cans', 'Amount', 'Paid', 'Status'];
      const colWidths = [85, 95, 75, 40, 60, 60, 80];

      let tableY = doc.y;
      doc.rect(40, tableY, 515, 20).fill('#004d99');
      doc.fillColor('#ffffff').fontSize(8);

      let headerX = 45;
      tableHeaders.forEach((h, i) => {
        doc.text(h, headerX, tableY + 5, { width: colWidths[i], align: 'left' });
        headerX += colWidths[i];
      });

      tableY += 22;
      doc.fillColor('#212529').fontSize(8);

      orders.forEach((ord, index) => {
        if (tableY > 750) {
          doc.addPage();
          tableY = 40;
        }

        if (index % 2 === 1) {
          doc.rect(40, tableY - 2, 515, 18).fill('#f8f9fa');
        }

        let rowX = 45;
        const rowData = [
          ord.orderId || '-',
          ord.customerName || '-',
          ord.mobile || '-',
          `${ord.numberOfCans || 0}`,
          `₹${Math.round(ord.totalAmount || 0)}`,
          `₹${Math.round(ord.amountPaid || 0)}`,
          ord.orderStatus || 'PENDING',
        ];

        doc.fillColor('#212529');
        rowData.forEach((val, i) => {
          doc.text(val, rowX, tableY + 3, { width: colWidths[i], align: 'left' });
          rowX += colWidths[i];
        });

        tableY += 20;
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export const generateCustomersPdfBuffer = (customers, settings) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const totalCust = customers.length;
      const totalOrders = customers.reduce((s, c) => s + (c.totalOrders || 0), 0);
      const totalCans = customers.reduce((s, c) => s + (c.totalCans || 0), 0);
      const totalAmount = customers.reduce((s, c) => s + (c.totalAmount || 0), 0);
      const totalPaid = customers.reduce((s, c) => s + (c.totalPaid || 0), 0);
      const totalPending = customers.reduce((s, c) => s + (c.totalPending || 0), 0);
      const totalEmptyPending = customers.reduce((s, c) => s + (c.totalEmptyPending || 0), 0);

      // Header
      doc.fillColor('#0077b6').fontSize(18).text(settings.businessName || 'Racee Water', { align: 'center' });
      doc.moveDown(0.2);
      doc.fillColor('#555555').fontSize(10).text(`Customer Database Report - Generated: ${formatDateTime(new Date())}`, { align: 'center' });
      doc.moveDown(0.8);

      // Summary Cards
      const summaryItems = [
        { label: 'Total Customers', val: `${totalCust}` },
        { label: 'Total Orders', val: `${totalOrders}` },
        { label: 'Total Cans', val: `${totalCans}` },
        { label: 'Total Sales', val: `₹${Math.round(totalAmount)}` },
        { label: 'Total Collected', val: `₹${Math.round(totalPaid)}` },
        { label: 'Total Due', val: `₹${Math.round(totalPending)}` },
        { label: 'Empty Cans Due', val: `${totalEmptyPending}` },
      ];

      const startX = 30;
      let currX = startX;
      let currY = doc.y;
      const colWidth = 105;

      summaryItems.forEach((item) => {
        doc.rect(currX, currY, colWidth - 6, 32).fillAndStroke('#e9ecef', '#ced4da');
        doc.fillColor('#495057').fontSize(7.5).text(item.label, currX + 4, currY + 4, { width: colWidth - 14 });
        doc.fillColor('#212529').fontSize(9.5).text(item.val, currX + 4, currY + 16, { width: colWidth - 14, bold: true });
        currX += colWidth;
      });

      doc.y = currY + 42;
      doc.moveDown(0.6);

      // Customers Table
      const tableHeaders = ['#', 'Customer Name', 'Mobile', 'Address', 'Orders', 'Cans', 'Total (₹)', 'Paid (₹)', 'Pending (₹)', 'Cans Due'];
      const colWidths = [25, 120, 90, 160, 50, 50, 75, 75, 75, 60];

      let tableY = doc.y;
      doc.rect(30, tableY, 780, 20).fill('#004d99');
      doc.fillColor('#ffffff').fontSize(8.5);

      let headerX = 35;
      tableHeaders.forEach((h, i) => {
        doc.text(h, headerX, tableY + 5, { width: colWidths[i], align: i >= 4 ? 'center' : 'left' });
        headerX += colWidths[i];
      });

      tableY += 22;

      customers.forEach((c, index) => {
        if (tableY > 530) {
          doc.addPage();
          tableY = 30;
          doc.rect(30, tableY, 780, 20).fill('#004d99');
          doc.fillColor('#ffffff').fontSize(8.5);
          let hX = 35;
          tableHeaders.forEach((h, i) => {
            doc.text(h, hX, tableY + 5, { width: colWidths[i], align: i >= 4 ? 'center' : 'left' });
            hX += colWidths[i];
          });
          tableY += 22;
        }

        if (index % 2 === 1) {
          doc.rect(30, tableY - 2, 780, 18).fill('#f8f9fa');
        }

        let rowX = 35;
        const rowData = [
          `${index + 1}`,
          c.name || '-',
          c.mobile || '-',
          (c.address || '-').substring(0, 30),
          `${c.totalOrders || 0}`,
          `${c.totalCans || 0}`,
          `₹${Math.round(c.totalAmount || 0)}`,
          `₹${Math.round(c.totalPaid || 0)}`,
          `₹${Math.round(c.totalPending || 0)}`,
          `${c.totalEmptyPending || 0}`,
        ];

        doc.fillColor('#212529').fontSize(8);
        rowData.forEach((val, i) => {
          if (i === 8 && (c.totalPending || 0) > 0) doc.fillColor('#c0392b');
          else if (i === 7) doc.fillColor('#27ae60');
          else doc.fillColor('#212529');

          doc.text(val, rowX, tableY + 3, { width: colWidths[i], align: i >= 4 ? 'center' : 'left' });
          rowX += colWidths[i];
        });

        tableY += 20;
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export const generateOrdersPdfBuffer = (orders, settings) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const totalCollected = orders.reduce((sum, o) => sum + (o.amountPaid || 0), 0);
      const totalPending = orders.reduce((sum, o) => sum + (o.balanceAmount || 0), 0);
      const totalCans = orders.reduce((sum, o) => sum + (o.numberOfCans || 0), 0);
      const emptyDelivered = orders.reduce((sum, o) => sum + (o.emptyCansDelivered || 0), 0);
      const emptyReturned = orders.reduce((sum, o) => sum + (o.emptyCansReturned || 0), 0);

      // Header
      doc.fillColor('#0077b6').fontSize(18).text(settings.businessName || 'Racee Water', { align: 'center' });
      doc.moveDown(0.2);
      doc.fillColor('#555555').fontSize(10).text(`Orders Report - Generated: ${formatDateTime(new Date())}`, { align: 'center' });
      doc.moveDown(0.8);

      // Summary Cards
      const summaryItems = [
        { label: 'Total Orders', val: `${orders.length}` },
        { label: 'Total Cans', val: `${totalCans}` },
        { label: 'Total Sales', val: `₹${Math.round(totalSales)}` },
        { label: 'Total Collected', val: `₹${Math.round(totalCollected)}` },
        { label: 'Total Due', val: `₹${Math.round(totalPending)}` },
        { label: 'Empty Cans Ret.', val: `${emptyReturned}/${emptyDelivered}` },
      ];

      const startX = 30;
      let currX = startX;
      let currY = doc.y;
      const colWidth = 125;

      summaryItems.forEach((item) => {
        doc.rect(currX, currY, colWidth - 6, 32).fillAndStroke('#e9ecef', '#ced4da');
        doc.fillColor('#495057').fontSize(7.5).text(item.label, currX + 4, currY + 4, { width: colWidth - 14 });
        doc.fillColor('#212529').fontSize(9.5).text(item.val, currX + 4, currY + 16, { width: colWidth - 14, bold: true });
        currX += colWidth;
      });

      doc.y = currY + 42;
      doc.moveDown(0.6);

      // Orders Table
      const tableHeaders = ['Date', 'Order ID', 'Customer', 'Mobile', 'Cans', 'Total (₹)', 'Paid (₹)', 'Due (₹)', 'Empty Ret.', 'Status'];
      const colWidths = [65, 85, 120, 85, 45, 65, 65, 65, 75, 90];

      let tableY = doc.y;
      doc.rect(30, tableY, 780, 20).fill('#004d99');
      doc.fillColor('#ffffff').fontSize(8.5);

      let headerX = 35;
      tableHeaders.forEach((h, i) => {
        doc.text(h, headerX, tableY + 5, { width: colWidths[i], align: i >= 4 ? 'center' : 'left' });
        headerX += colWidths[i];
      });

      tableY += 22;

      orders.forEach((ord, index) => {
        if (tableY > 530) {
          doc.addPage();
          tableY = 30;
          doc.rect(30, tableY, 780, 20).fill('#004d99');
          doc.fillColor('#ffffff').fontSize(8.5);
          let hX = 35;
          tableHeaders.forEach((h, i) => {
            doc.text(h, hX, tableY + 5, { width: colWidths[i], align: i >= 4 ? 'center' : 'left' });
            hX += colWidths[i];
          });
          tableY += 22;
        }

        if (index % 2 === 1) {
          doc.rect(30, tableY - 2, 780, 18).fill('#f8f9fa');
        }

        let rowX = 35;
        const rowData = [
          formatDate(ord.createdAt),
          ord.orderId || '-',
          ord.customerName || '-',
          ord.mobile || '-',
          `${ord.numberOfCans || 0}`,
          `₹${Math.round(ord.totalAmount || 0)}`,
          `₹${Math.round(ord.amountPaid || 0)}`,
          `₹${Math.round(ord.balanceAmount || 0)}`,
          `${ord.emptyCansReturned || 0}/${ord.emptyCansDelivered || 0}`,
          ord.orderStatus || 'PENDING',
        ];

        doc.fillColor('#212529').fontSize(8);
        rowData.forEach((val, i) => {
          if (i === 7 && (ord.balanceAmount || 0) > 0) doc.fillColor('#c0392b');
          else if (i === 6) doc.fillColor('#27ae60');
          else doc.fillColor('#212529');

          doc.text(val, rowX, tableY + 3, { width: colWidths[i], align: i >= 4 ? 'center' : 'left' });
          rowX += colWidths[i];
        });

        tableY += 20;
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// ==================== EXCEL GENERATION ====================

export const generateOrdersExcelBuffer = async (orders) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Orders');

  worksheet.columns = [
    { header: 'Order ID', key: 'orderId', width: 20 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Customer Name', key: 'customerName', width: 22 },
    { header: 'Mobile', key: 'mobile', width: 16 },
    { header: 'Cans', key: 'numberOfCans', width: 10 },
    { header: 'Price/Can (₹)', key: 'pricePerCan', width: 14 },
    { header: 'Total Amount (₹)', key: 'totalAmount', width: 16 },
    { header: 'Amount Paid (₹)', key: 'amountPaid', width: 16 },
    { header: 'Balance Due (₹)', key: 'balanceAmount', width: 16 },
    { header: 'Payment Status', key: 'paymentStatus', width: 16 },
    { header: 'Payment Mode', key: 'paymentMode', width: 16 },
    { header: 'Empty Delivered', key: 'emptyCansDelivered', width: 16 },
    { header: 'Empty Returned', key: 'emptyCansReturned', width: 16 },
    { header: 'Empty Pending', key: 'emptyCansPending', width: 16 },
    { header: 'Order Source', key: 'orderSource', width: 14 },
    { header: 'Order Status', key: 'orderStatus', width: 18 },
  ];

  // Header styling
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF004D99' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  orders.forEach((ord) => {
    worksheet.addRow({
      orderId: ord.orderId || '-',
      date: formatDate(ord.createdAt),
      customerName: ord.customerName || '-',
      mobile: ord.mobile || '-',
      numberOfCans: Number(ord.numberOfCans) || 0,
      pricePerCan: Number(ord.pricePerCan) || (ord.numberOfCans > 0 ? Math.round(ord.totalAmount / ord.numberOfCans) : 0),
      totalAmount: Number(ord.totalAmount) || 0,
      amountPaid: Number(ord.amountPaid) || 0,
      balanceAmount: Number(ord.balanceAmount) || 0,
      paymentStatus: ord.paymentStatus || 'PENDING',
      paymentMode: ord.paymentMode || (ord.amountPaid > 0 ? 'CASH' : 'PENDING'),
      emptyCansDelivered: Number(ord.emptyCansDelivered) || 0,
      emptyCansReturned: Number(ord.emptyCansReturned) || 0,
      emptyCansPending: Number(ord.emptyCansPending) || 0,
      orderSource: ord.orderSource || 'ONLINE',
      orderStatus: ord.orderStatus || 'PENDING',
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

export const generateCustomersExcelBuffer = async (customers) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Customer Report');

  worksheet.columns = [
    { header: 'Name', key: 'name', width: 22 },
    { header: 'Mobile', key: 'mobile', width: 16 },
    { header: 'Address', key: 'address', width: 30 },
    { header: 'Total Orders', key: 'totalOrders', width: 14 },
    { header: 'Total Cans', key: 'totalCans', width: 12 },
    { header: 'Total Amount (₹)', key: 'totalAmount', width: 16 },
    { header: 'Amount Paid (₹)', key: 'totalPaid', width: 16 },
    { header: 'Balance Pending (₹)', key: 'totalPending', width: 18 },
    { header: 'Empty Delivered', key: 'totalEmptyDelivered', width: 16 },
    { header: 'Empty Returned', key: 'totalEmptyReturned', width: 16 },
    { header: 'Empty Pending', key: 'totalEmptyPending', width: 16 },
  ];

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF004D99' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  customers.forEach((c) => {
    worksheet.addRow({
      name: c.name || '-',
      mobile: c.mobile || '-',
      address: c.address || '-',
      totalOrders: Number(c.totalOrders) || 0,
      totalCans: Number(c.totalCans) || 0,
      totalAmount: Number(c.totalAmount) || 0,
      totalPaid: Number(c.totalPaid) || 0,
      totalPending: Number(c.totalPending) || 0,
      totalEmptyDelivered: Number(c.totalEmptyDelivered) || 0,
      totalEmptyReturned: Number(c.totalEmptyReturned) || 0,
      totalEmptyPending: Number(c.totalEmptyPending) || 0,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

