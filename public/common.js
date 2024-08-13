/*
Citation Scope: Form submission, AJAX, Dropdown/table updating
Date: 8/1/2024
Originality: Adapted
Source: https://github.com/osu-cs340-ecampus/nodejs-starter-app/tree/main/Step%208%20-%20Dynamically%20Updating%20Data/public/js
*/

/*  
 *  This function returns a new drop-down selector that selects between records in data.
 *  data: array[object] - A list of records retreived with getData() (or elsewhere).
 *  name: string - The name of the attribute corresponding to a friendly name in the data;
 *      values of this attribute are shown to the user.
 *  pk: string - The name of the attribute corresponding to the primary key in the data; 
 *      values of this attribute decide the selector's value attribute.
 *  nullable: boolean - If true, adds an additional "None" value corresponding to an empty
 *      string HTML value (null foreign key).
 *  Returns: an HTML <select> element with one option corresponding to each entry in data,
 *      and optionally a (None) value.
 *  This function is fully original.
 */
function newDropdown(data, name, pk, nullable) {
    let dropdown = document.createElement("select"); // create a new drop down
    if (nullable) { // add the nullable selector with an empty value if needed
        let nullSelector = document.createElement("option");
        nullSelector.value = "";
        nullSelector.text = "(None)";
        dropdown.append(nullSelector);
    }
    data.forEach(record => { // for each record in the data:
        let option = document.createElement("option"); // create an option for the selector for that record
        option.value = record[pk]; // have its internal value be the primary key of that record
        option.text = record[name]; // have its user facing (text) value be the friendly name of that record
        dropdown.append(option); // and add that option to the selector
    });
    return dropdown; // return the drop-down selector once finished
}
/*  
 *  This function gets data from the server (see app.js) on the corresponding endpoint, 
 *  and returns the data received from the endpoint as an array of objects corresponding
 *  to the server's JSON response.
 *  endpoint: string - The path to the endpoint to send the request to.
 *  Returns: an Array[Object] of the data requested from the endpoint.
 */
function getData(endpoint) {
    let xhr = new XMLHttpRequest(); // set up a new XHR
    xhr.open("GET", endpoint, false); // prepare a GET request to the corresponding endpoint in synchronous mode
    xhr.send(); // and send that request
    return JSON.parse(xhr.response); // and return the data received from the server
}
/*  
 *  This function refreshes the table in the CRUD page, pulling new data from the
 *  endpoint specified.
 *  endpoint: string - The path to the endpoint to send the request to.
 *  dataTypes: array[object]: A list of entries describing each column to display (from left to right). See below.
 *  Returns: nothing.
 *  This function is fully original.
 */
function refreshTable(endpoint, dataTypes) {
    let data = getData(endpoint); // get a new data table from the server
    console.log("Data retrieved for table:", data); // Log the data retrieved
    newTableFromData(data, dataTypes, document.querySelector("table")); // replace the existing table
}

/*  
 *  This function creates a new table from the specified data, displaying columns described by dataTypes.
 *  data: array[object] - The data to show in the table, retrieved with getData().
 *  dataTypes: array[object] - A list of objects, each describing a column to display.
 *  tableToReplace: HTML element - The table to replace, or undefined to create a new table.
 *  dataTypes is an array of:
 *  {   
 *      header: string - A friendly name to describe the attribute (used in the headers of the table)
 *      attribName: string - The name of the attribute as it appears in a record
 *      type: string - The type of the data (for input fields): "text", ("num0", "num1", and so on [decimal places to display]), or "date"
 *      fkInfo: object - A set of data to describe a foreign key as shown below: {
 *          attribName: string - The target attribute name on the referenced table
 *          fkName: string - The foreign key attribute name on the referencing table
 *          pkName: string - The primary key attribute name on the referenced table
 *          data: array[object] - The data of the referenced table.
 *      }
 *      nullable: boolean - Whether or not the attribute can have a NULL value.
 *      autoinc: boolean - Whether or not the attribute is incremented automatically.
 *          Setting this disables the corresponding field.
 *  }
 *  Returns: an HTML <table> element with all of the records in data, displaying each of
 *      the columns described by dataTypes.
 *  This function is fully original.
 */
function newTableFromData(data, dataTypes, tableToReplace) {
    let table;
    if (tableToReplace === undefined) table = document.createElement("table"); // create a new table if one was not passed in
    else {
        table = tableToReplace;
        table.innerHTML = ""; // clear the existing table
    }
    let header = newHeaderFromDataTypes(dataTypes); // create a header for the table
    table.append(header); // append the new header to the table
    let body = document.createElement("tbody");
    if (data.length === 0) body.insertRow(); // placeholder row for CSS
    data.forEach(record => { // for each record in data
        let row = body.insertRow();
        row.dataset.primaryKey = record[dataTypes[0].attribName];
        dataTypes.forEach(attrib => {
            let cell = row.insertCell();
            cell.dataset.attribName = attrib.attribName;
            let dataCell = document.createElement("div");
            dataCell.classList.add("data-view-cell");
            dataCell.classList.add("edit-mode-hidden");
            if (record[attrib.attribName] && attrib.type === "date") dataCell.innerText = record[attrib.attribName].slice(0, 10);
            else dataCell.innerText = record[attrib.attribName];
            let editCell = document.createElement("div");
            editCell.classList.add("data-edit-cell");
            editCell.classList.add("edit-mode-visible");
            editCell.hidden = true;

            if (attrib.fkinfo) {
                let dropDown = newDropdown(attrib.fkinfo.data, attrib.fkinfo.attribName, attrib.fkinfo.pkName, attrib.nullable);
                dropDown.value = record[attrib.fkinfo.fkName];
                dropDown.id = ("edit-cell-" + record[dataTypes[0].attribName] + "-" + attrib.attribName);
                editCell.append(dropDown);
            } else {
                let valueInput = document.createElement("input");
                if (attrib.autoinc) valueInput.disabled = true;
                else if (!attrib.nullable) valueInput.required = true;
                if (attrib.type === "str") {
                    valueInput.type = "text";
                } else if (attrib.type.slice(0, 2) === "num") {
                    valueInput.type = "number";
                    valueInput.step = String(10 ** (-attrib.type.slice(3)));
                } else if (attrib.type === "date") {
                    valueInput.type = "date";
                }
                valueInput.value = record[attrib.attribName];
                valueInput.id = ("edit-cell-" + record[dataTypes[0].attribName] + "-" + attrib.attribName);
                editCell.append(valueInput);
            }
            cell.append(dataCell, editCell);
        });
        let editButtonCell = row.insertCell();
        let editButton = document.createElement("button");
        editButton.classList.add("edit-button", "edit-mode-hidden");
        editButton.innerText = "Edit";
        editButton.addEventListener("click", enterEditMode);
        let saveButton = document.createElement("button");
        saveButton.classList.add("save-button", "edit-mode-visible");
        saveButton.innerText = "Save";
        saveButton.hidden = true;
        saveButton.addEventListener("click", (event) => commitChanges(event, endpoint, dataTypes));

        editButtonCell.append(editButton, saveButton);

        let delButtonCell = row.insertCell();
        let delButton = document.createElement("button");
        delButton.classList.add("delete-button", "edit-mode-hidden");
        delButton.innerText = "Delete";
        delButton.addEventListener("click", (event) => deleteRecord(event, endpoint, dataTypes));
        let cancelButton = document.createElement("button");
        cancelButton.classList.add("cancel-button", "edit-mode-visible");
        cancelButton.innerText = "Cancel";
        cancelButton.hidden = true;
        cancelButton.addEventListener("click", discardChanges);

        delButtonCell.append(delButton, cancelButton);
    });

    table.append(body);
    let footer = newFooter(dataTypes);
    table.append(footer);
    return table;
}

/*
 *  This function creates a new header for the table created with newTableFromData().
 *  dataTypes: array[object] - A list of objects, each of which corespond to a header.
 *  Returns: A <thead> element containing the headers to each column of the table.
 */
function newHeaderFromDataTypes(dataTypes){
    let header = document.createElement("thead"); // create the outer header element
    let headRow = header.insertRow(); // and insert a new row into the header
    dataTypes.forEach(attrib => { // for each attribute/column to display:
        let headCell = document.createElement("th"); // create a new header cell
        headCell.innerText = attrib.header; // set its text to the corresponding header value (friendly name)
        headRow.append(headCell); // and append it to the header row
    });
    headRow.append(document.createElement("th")); // and also append two blank cells (which are above the edit/save and delete/cancel buttons)
    headRow.append(document.createElement("th"));
    return header; // return the completed header
}
/*
 *  This function creates a new footer for the table created with newTableFromData().
 *  dataTypes: array[object] - A list of objects, each of which corespond to an input field on the footer.
 *  Returns: A <tfoot> element containing the headers to each column of the table.
 */
function newFooter(dataTypes){
    let footer = document.createElement("tfoot"); // create the outer footer element
    let footerRow = footer.insertRow(); // insert a row into the outer footer
    dataTypes.forEach(attrib => { // for each attribute:
        let cell = footerRow.insertCell(); // create a new cell in the table
        cell.dataset.attribName = attrib.attribName; // set its attribute name in the HTML (for easy recall when committing to the DB)
        let editCell = document.createElement("div"); // create a new div to hold the input field
        editCell.classList.add("data-add-cell"); // and add the corresponding class to it
        if (attrib.fkinfo) { // if this cell corresponds to an FK:
            let dropDown = newDropdown(attrib.fkinfo.data, attrib.fkinfo.attribName, attrib.fkinfo.pkName, attrib.nullable); // create a dropdown corresponding to it
            dropDown.id = ("add-cell-" + attrib.attribName); // set the dropdown ID
            editCell.append(dropDown); // and add it to the div inside the cell
        } else { // otherwise
            let valueInput = document.createElement("input"); // create a new input field
            valueInput.placeholder = (attrib.nullable ? "(NULL)" : (attrib.autoinc ? "(Automatic)" : "Required")); // placeholder value: show whether required, nullable, or automatic
            if (attrib.autoinc) valueInput.disabled = true; // disable entry for auto_increment PKs
            else if (!attrib.nullable) valueInput.required = true; // set required attribute on HTML form for non-nullable attributes
            // select the type of input for the input field; this should correspond to the SQL data type in most cases
            if (attrib.type === "str") { // for varchars and text types
                valueInput.type = "text"; 
            } else if (attrib.type.slice(0, 2) === "num") { // trailing digits indicate number of places after decimal
                valueInput.type = "number"; // e.g., num0 -> int, num2 -> decimal(x, 2), etc.
                valueInput.step = String(10 ** (-attrib.type.slice(3)));
            } else if (attrib.type === "date") { // for date types
                valueInput.type = "date";
            }

            valueInput.id = ("add-cell-" + attrib.attribName); // set the input field ID
            editCell.append(valueInput); // and add it to the div inside the cell
        }
        cell.append(editCell); // add that div to the cell
    });
    let addCell = footerRow.insertCell(); // cell to hold the Add button
    let addButton = document.createElement("button"); // create an add button
    addButton.classList.add("add-button"); // set the corresponding class for CSS
    addButton.innerText = "Add";
    addButton.addEventListener("click", button => addRow(button.target, endpoint, dataTypes)); // set button to post to endpoint defined in HTML <script> section
    addCell.append(addButton); // add the button to the cell
    footerRow.insertCell(); // and add a blank cell (to stay consistent with the remainder of the table)
    return footer; // return the final footer
}
/*  
 *  This function adds a foreign-key filter to an existing table, returning a drop-down element to select a FK.
 *  table: array[object] - The data of the referencing table (called by getData() or otherwise)
 *  attrib: A single dataTypes entry (see newTableFromData()) corresponding to the FK to filter by.
 *  dataTypes: The dataTypes array of the referencing table (see newTableFromData()).
 *  endpoint: The endpoint to get filtered results from, should be a subdir of the main endpoint and slash-terminated.
 *  Returns a <select> drop-down that refreshes the filter when changed.
 */
function addFKFilterToTable(table, attrib, dataTypes, endpoint) {
    let dropDown = newDropdown(attrib.fkinfo.data, attrib.fkinfo.attribName, attrib.fkinfo.pkName, attrib.nullable); // create a new drop-down with the corresponding attribute name and FK
    let anySelector = document.createElement("option");
    anySelector.value = "-1"; // placeholder value for when the filter is inactive
    anySelector.text = "(Any)"; // placeholder text to show all records
    dropDown.prepend(anySelector); // append this show-all option to the start of the select
    dropDown.value = "-1"; // and set it as default
    dropDown.addEventListener("change", dropDown => {
        refreshFilter(dropDown.target, table, endpoint, dataTypes); // refresh the filter whenever the dropdown is changed
    });
    return dropDown;
}
/*  
 *  Refreshes the table data, getting records that match only the current filter selection.
 *  dropDown: The target drop-down to read from.
 *  table: The table to refresh.
 *  endpoint: The endpoint to get filtered results from, should be a subdir of the main endpoint and slash-terminated.
 *  dataTypes: The dataTypes array of the referencing table (see newTableFromData()).
 */
function refreshFilter(dropDown, table, endpoint, dataTypes) {
    let url;
    if (dropDown.value == "-1") url = endpoint + ".."; // get the parent dir for unfiltered results
    else url = endpoint + dropDown.value; // otherwise, append the value to the endpoint URL
    let data = getData(url); // get data from this endpoint
    newTableFromData(data, dataTypes, table); // and create a new table
}

//Display feedback after CRUD operation completes, displaying for 3 seconds
function showFeedback(message, type) {
    var feedbackElement = document.getElementById('feedback-message');
    feedbackElement.innerText = message;
    feedbackElement.style.display = 'block';

    setTimeout(function() {
        feedbackElement.style.display = 'none';
    }, 3000);
}

// This is an event listener for the Edit button, which changes the fields to input fields and shows the Save and Cancel buttons.
function enterEditMode(event) {
    let row = event.target.closest("tr"); // get the row this button was pressed in
    let itemsToHide = row.querySelectorAll(".edit-mode-hidden"); // hide all view mode buttons
    itemsToHide.forEach(item => {
        item.hidden = true;
    });
    let itemsToShow = row.querySelectorAll(".edit-mode-visible"); // show all edit mode buttons
    itemsToShow.forEach(item => {
        item.hidden = false;
    });
    // Prepopulate Date values when entering edit mode
    itemsToShow.forEach(item => {
        let input = item.querySelector("input[type='date']");
        if (input && !input.value) {
            input.value = item.closest("td").querySelector(".data-view-cell").innerText;
        }
    });
}
// This is an event listener for the Save button, which sends the PUT request for an UPDATE.
function commitChanges(event, endpoint, dataTypes) {
    let row = event.target.closest("tr");
    let primaryKey = row.dataset.primaryKey;
    let data = createObjFromRow(row, dataTypes);
    console.log("Committing changes for primaryKey:", primaryKey, "with data:", data);
    if (!validateData(data, dataTypes)) {
        alert("One or more entry fields are invalid.");
        return;
    }

    console.log("Endpoint for committing changes:", endpoint);
    let xhr = new XMLHttpRequest();
    xhr.open("PUT", `${endpoint}/${primaryKey}`, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onload = function () {
        console.log("Response from server:", xhr.status, xhr.responseText);
        if (xhr.status == 200) {
            refreshTable(endpoint, dataTypes);
            showFeedback("Record updated successfully", "success");
        } else {
            alert("Failed to update record");
            showFeedback("Error updating record", "error");
        }
    };
    xhr.send(JSON.stringify(data));
}
/*  
 *  
 *  
 *  
 */
function discardChanges(event) {
    let row = event.target.closest("tr");
    let cells = row.querySelectorAll("td");
    cells.forEach(cell => {
        let oldData = cell.querySelector(".data-view-cell");
        let newData = cell.querySelector(".data-edit-cell");

        if (oldData && newData) {
            newData.innerText = oldData.innerText;
        }
    });
    let itemsToHide = row.querySelectorAll(".edit-mode-visible");
    itemsToHide.forEach(item => {
        item.hidden = true;
    });
    let itemsToShow = row.querySelectorAll(".edit-mode-hidden");
    itemsToShow.forEach(item => {
        item.hidden = false;
    });
}
/*  
 *  
 *  
 *  
 */
function deleteRecord(event, endpoint, dataTypes) {
    if (confirm("Really delete this record?")) {
        let row = event.target.closest("tr");
        let primaryKey = row.dataset.primaryKey;
        console.log("Deleting record with primaryKey:", primaryKey);

        console.log("Endpoint for deleting record:", endpoint);
        let xhr = new XMLHttpRequest();
        xhr.open("DELETE", `${endpoint}/${primaryKey}`, true);
        xhr.onload = function () {
            console.log("Response from server:", xhr.status, xhr.responseText);
            if (xhr.status == 204) {
                refreshTable(endpoint, dataTypes);
                showFeedback("Record deleted successfully", "success");
            } else {
                alert("Failed to delete record");
                showFeedback("Error deleting record", "error");
            }
        };
        xhr.send();
    }
}

function generateRandomEmployeeID() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function addRow(button, endpoint, dataTypes) {
    let row = button.closest("tr");
    let data = createObjFromRow(row, dataTypes);
    // let employeeIDAttribute = dataTypes.find(attribute => attribute.attribName === "employeeID");
    // if (employeeIDAttribute && !data[employeeIDAttribute.attribName]) {
    //     data[employeeIDAttribute.attribName] = generateRandomEmployeeID();
    // }

    console.log("Adding row data:", data);
    if (!validateData(data, dataTypes)) {
        alert("One or more entry fields are invalid.");
        return;
    }

    let xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onload = function () {
        console.log("Response from server:", xhr.status, xhr.responseText);
        if (xhr.status == 201) {
            refreshTable(endpoint, dataTypes);
            showFeedback("Record added successfully", "success");
        } else if (xhr.status == 409) {
            alert("Error: Duplicate entry detected.");
            showFeedback("Error: Duplicate entry detected.", "error");
        } else {
            alert("Failed to add record");
            showFeedback("Error adding record", "error");
        }
    };
    xhr.send(JSON.stringify(data));
}

function createObjFromRow(row, dataTypes) {
    let cells = row.querySelectorAll("td");
    let output = {};
    cells.forEach(cell => {
        if (cell.dataset.attribName) {
            if(cell.querySelector("select, input").value === "" && dataTypes.find(dataType => {return dataType.attribName === cell.dataset.attribName}).nullable) output[cell.dataset.attribName] = null; // return null for nullable attributes
            else output[cell.dataset.attribName] = cell.querySelector("select, input").value;
        }
    });
    return output;
}

function validateData(entity, dataTypes) {
    let attributes = Object.entries(entity);
    let result = attributes.every(record => {
        let dataType = dataTypes.find(currentType => {
            return (currentType.attribName === record[0]);
        });
        return validateAttribute(record[1], dataType);
    });
    return result;
}

function validateAttribute(data, dataType) {
    if (data === "" || data === null) {
        if (dataType.nullable || dataType.autoinc) return true;
        else return false;
    } else if (dataType.type.slice(0, 3) === "num") return (!isNaN(Number(data)));
    else if (dataType.type === "date") return !isNaN(Date.parse(data));
    else return true;
}
//Source: https://www.bezkoder.com/react-node-express-mysql/#Add_Navbar_to_React_CRUD_App
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('toggleButton');

    toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
});
