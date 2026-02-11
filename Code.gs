function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Productivity Nexus')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('DailyLogs');
  if (!sheet) {
    sheet = ss.insertSheet('DailyLogs');
    // Create Headers
    sheet.appendRow([
      'id', 'date', 'jalaliDate', 'sleepTime', 'wakeTime', 
      'sleepHours', 'workHours', 'exerciseMinutes', 'studyMinutes', 
      'phoneMinutes', 'weight', 'notes'
    ]);
    // Freeze header row
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getData() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) return []; // Only headers or empty

  // Get all data excluding headers
  const data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();

  // Map to object structure
  return data.map(row => ({
    id: String(row[0]),
    date: String(row[1]),
    jalaliDate: String(row[2]),
    sleepTime: String(row[3]),
    wakeTime: String(row[4]),
    sleepHours: Number(row[5]),
    workHours: Number(row[6]),
    exerciseMinutes: Number(row[7]),
    studyMinutes: Number(row[8]),
    phoneMinutes: Number(row[9]),
    weight: Number(row[10]),
    notes: String(row[11])
  }));
}

function saveData(payload) {
  const sheet = getSheet();
  // Parse if string (GAS sometimes needs this safety)
  const entry = typeof payload === 'string' ? JSON.parse(payload) : payload;
  
  const lastRow = sheet.getLastRow();
  // Get existing dates (column 2 which is 'date')
  const data = lastRow > 1 ? sheet.getRange(2, 2, lastRow - 1, 1).getValues() : []; 
  
  // Prepare row data
  const rowData = [
    entry.id,
    entry.date,
    entry.jalaliDate,
    entry.sleepTime,
    entry.wakeTime,
    entry.sleepHours,
    entry.workHours,
    entry.exerciseMinutes,
    entry.studyMinutes,
    entry.phoneMinutes,
    entry.weight,
    entry.notes
  ];

  // Check if date exists to update
  let rowIndex = -1;
  for (let i = 0; i < data.length; i++) {
    // data[i][0] is the date value in the sheet
    if (String(data[i][0]) === entry.date) {
      rowIndex = i + 2; // +2 because: 0-based index + 1 for header + 1 for 1-based sheet index
      break;
    }
  }

  if (rowIndex > 0) {
    // Update existing row
    sheet.getRange(rowIndex, 1, 1, 12).setValues([rowData]);
  } else {
    // Append new row
    sheet.appendRow(rowData);
  }
  
  return { success: true };
}