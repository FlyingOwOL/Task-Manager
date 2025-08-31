function assignTask() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const assignTask = ss.getSheetByName("Assign Task");
  const tasks = ss.getSheetByName("Tasks");


  const docType = assignTask.getRange("C7").getValue();
  const title = assignTask.getRange("C10").getValue();
  const priority = assignTask.getRange("C13").getValue();
  const dateTime = new Date();

  const statusDropdown = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Done", "Pending"])
    .build();
  
  let file = null;
  switch (docType){ //no need for default
    case "SpreadSheet":
      file = SpreadsheetApp.create(title);
      break;
    case "Google Docs":
      file = DocumentApp.create(title);
      break;
  }
  const url = sendToDrive(file);

  
  tasks.appendRow([dateTime, title, `=HYPERLINK("${url}", "Task")`, priority, "Pending"]); 
  tasks.getRange(tasks.getLastRow(), 5).setDataValidation(statusDropdown);

  SpreadsheetApp.getUi().alert("Open: " + url);

  notifyTaskCreated(title, url, priority);
}

function sendToDrive(file){
  //Select Folder ID to save the files
  const folderID = "add folderID here";
  const folder = DriveApp.getFolderById(folderID);

  // Get the file from Drive
  const fileInDrive = DriveApp.getFileById(file.getId());

  // Place in the folder
  folder.addFile(fileInDrive);

  // Optional: remove from root so it's ONLY in that folder
  DriveApp.getRootFolder().removeFile(fileInDrive);

  fileInDrive.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);

  return fileInDrive.getUrl();
}

function notifyTaskCreated(title, url, priority) {
  //TODO add your email here
  const recipient = "put your email here";
  const subject = "New Task Created: " + title;
  const body = `
  A new task has been created.

  Title: ${title}
  Priority: ${priority}
  Link: ${url}
    `;
  
  GmailApp.sendEmail(recipient, subject, body);
}


