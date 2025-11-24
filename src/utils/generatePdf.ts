import pdfMake from "pdfmake/build/pdfmake";

pdfMake.fonts = {
  // download default Roboto font from cdnjs.com
  Roboto: {
    normal:
      "https://cdn.jsdelivr.net/npm/al-tushar@1.0.0/fonts/poppins/Poppins-Regular.ttf",
    bold: "https://cdn.jsdelivr.net/npm/al-tushar@1.0.0/fonts/poppins/Poppins-Bold.ttf",
    italics:
      "https://cdn.jsdelivr.net/npm/al-tushar@1.0.0/fonts/poppins/Poppins-SemiBold.ttf",
    bolditalic:
      "https://cdn.jsdelivr.net/npm/al-tushar@1.0.0/fonts/poppins/Poppins-BoldItalic.ttf",
  },
};

export const generatePdf = (receipt_id,shop_name, receiptData,opt) => {
  const tableHeader = [
    { text: "S.No", fontSize: 11, margin: [2, 2, 2, 2] },
    { text: "Party", fontSize: 11, margin: [2, 2, 2, 2] },
    { text: "Station", fontSize: 11, margin: [2, 2, 2, 2] },
    { text: "Bill No.", fontSize: 11, margin: [2, 2, 2, 2] },
    { text: "Bill Date", fontSize: 11, margin: [2, 2, 2, 2] },
    { text: "LR/CN No.", fontSize: 11, margin: [2, 2, 2, 2] },
    { text: "L/R DATE", fontSize: 11, margin: [2, 2, 2, 2] },
  ];

  const tableRows = [tableHeader];
  receiptData.forEach((data, idx) => {
    tableRows.push([
      { text: (idx + 1).toString() || "", fontSize: 10, margin: [2, 2, 2, 2] },
      { text: data["customer"] ? data["customer"]["shop_name"] : data["party_name"] || "", fontSize: 10, margin: [2, 2, 2, 2] },
      { text: data["station"] || "", fontSize: 10, margin: [2, 2, 2, 2] },
      { text: data["bill_no"] || "", fontSize: 10, margin: [2, 2, 2, 2] },
      { text: data["bill_date"] || "", fontSize: 10, margin: [2, 2, 2, 2] },
      { text: data["lr_no"] || "", fontSize: 10, margin: [2, 2, 2, 2] },
      { text: data["lr_date"] || "", fontSize: 10, margin: [2, 2, 2, 2] },
    ]);
  });

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [30, 30, 30, 18],
    content: [
      {
        columns: [
          {
            image: "logo",
            width: 50,
          },
          {
            stack: [
              { text: "RAGHANI", style: "title" },
              { text: "BR/LR Receiving Book", style: "subtitle" },
            ],
            alignment: "center",
            margin: [70, 0, 0, 10],
            width: "*",
          },
          {
            stack: [
              {
                text: "Shop No. 1502/1503,Floor 15 , Surana 101,",
                style: "address",
              },
              { text: "SURAT GUJRAT 395003,", style: "address" },
              { text: "Ph.: 4897777-9, M.: 9558022777", style: "address" },
            ],
            alignment: "right",
            margin: [0, 4, 0, 0],
          },
        ],
      },

      {
        canvas: [{ type: "line", x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 1 }],
      },
      { text: "\n" },

      {
        columns: [
          {
            text: ["Receipt No.: ", { text: receipt_id || "", italics: true }],
            style: "normal",
          },
          {
            text: `Date: ${(() => { const d = new Date(); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}/${d.getFullYear()}`; })()}`,
            style: "normal",
            alignment: "right",
          },
        ],
      },

      {
        text: [
          "Received with thanks from M/s. ",
          { text: receiptData[0]["seller"] ? receiptData[0]["seller"]["shop_name"] : shop_name || "", italics: true },
        ],
        style: "normal",
      },
      { text: "\n" },

      {
        table: {
          headerRows: 1,
          widths: ["8%", "19%", "16%", "14%","13%", "16%", "14%"],
          body: tableRows,
        },
        layout: {
          fillColor: function (rowIndex) {
            return rowIndex === 0 ? "#eeeeee" : null;
          },
        },
      },
    ],
    images: {
      logo: window.location.origin + "/raghaninew.jpg",
    },
    styles: {
      title: { fontSize: 22, bold: true, alignment: "center" },
      subtitle: { fontSize: 14, alignment: "center" },
      address: {
        fontSize: 10,
        alignment: "right",
        color: "#333",
        lineHeight: 1.1,
      },
      normal: { fontSize: 11, margin: [0, 5, 0, 5] },
    },
    defaultStyle: {
      font: "Roboto",
    },
  };
  if(opt=='download'){
    pdfMake.createPdf(docDefinition).download(`Receipt_${receipt_id}.pdf`);
    return;
  }
  if(opt=='open'){
    pdfMake.createPdf(docDefinition).open();
    return;
  }
  if(opt == "print"){
    pdfMake.createPdf(docDefinition).print();
    return
  }
  if(opt=="base64"){
  return new Promise((resolve, reject) => {
    pdfMake.createPdf(docDefinition).getBase64((data) => {
      resolve(data);
    });
  });
  }

  if (opt=="url"){
  return new Promise((resolve, reject) => {
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      const url = URL.createObjectURL(blob);
      resolve(url);
    });
  });
  }

  if(opt=='blob'){
    return new Promise((resolve) => {
      pdfMake.createPdf(docDefinition).getBlob((blob) => {
        resolve(blob);
      });
    });
  }

  pdfMake.createPdf(docDefinition).getBlob(async (blob) => {
    const file = new File([blob], "document.pdf", {
      type: "application/pdf",
    });

    // 3. Use Web Share API (mobile only)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "My PDF",
          text: "Check out this PDF",
        });
      } catch (err) {
        console.error("Sharing failed:", err);
      }
    } else {
      alert("File sharing not supported on this browser.");
    }
  });
};
