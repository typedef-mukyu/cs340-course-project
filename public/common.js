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
 *  dataTypes[] is an array of:
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
 */
function newTableFromData(data, dataTypes, tableToReplace) {
    let table;
    if (tableToReplace === undefined) table = document.createElement("table");
    else {
        table = tableToReplace;
        table.innerHTML = ""; // clear the existing table
    }
    let header = document.createElement("thead");
    let headRow = header.insertRow();
    dataTypes.forEach(attrib => {
        let headCell = document.createElement("th");
        headCell.innerText = attrib.header;
        headRow.append(headCell);
    });
    headRow.append(document.createElement("th"));
    headRow.append(document.createElement("th"));
    table.append(header);
    let body = document.createElement("tbody");
    if (data.length === 0) body.insertRow();
    data.forEach(record => {
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
    let footer = document.createElement("tfoot");
    let footerRow = footer.insertRow();
    dataTypes.forEach(attrib => {
        let cell = footerRow.insertCell();
        cell.dataset.attribName = attrib.attribName;
        let editCell = document.createElement("div");
        editCell.classList.add("data-add-cell");
        if (attrib.fkinfo) {
            let dropDown = newDropdown(attrib.fkinfo.data, attrib.fkinfo.attribName, attrib.fkinfo.pkName, attrib.nullable);
            dropDown.id = ("add-cell-" + attrib.attribName);
            editCell.append(dropDown);
        } else {
            let valueInput = document.createElement("input");
            valueInput.placeholder = (attrib.nullable ? "(NULL)" : (attrib.autoinc ? "(Automatic)" : "Required"));
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

            valueInput.id = ("add-cell-" + attrib.attribName);
            editCell.append(valueInput);
        }

        cell.append(editCell);
    });
    let addCell = footerRow.insertCell();
    let addButton = document.createElement("button");
    addButton.classList.add("add-button");
    addButton.innerText = "Add";
    addButton.addEventListener("click", button => addRow(button.target, endpoint, dataTypes));
    addCell.append(addButton);
    footerRow.insertCell();
    table.append(footer);
    return table;
}
/*  
 *  
 *  
 *  
 */
function addFKFilterToTable(table, data, pk, name, nullable, dataTypes, endpoint) {
    let dropDown = newDropdown(data, pk, name, nullable);
    let anySelector = document.createElement("option");
    anySelector.value = "-1";
    anySelector.text = "(Any)";
    dropDown.prepend(anySelector);
    dropDown.value = "-1";
    dropDown.addEventListener("change", dropDown => {
        refreshFilter(dropDown.target, table, endpoint, dataTypes);
    });
    return dropDown;
}
/*  
 *  
 *  
 *  
 */
function refreshFilter(dropDown, table, endpoint, dataTypes) {
    let url;
    if (dropDown.value == "-1") url = endpoint + "..";
    else url = endpoint + dropDown.value;
    let data = getData(url);
    newTableFromData(data, dataTypes, table);
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


function enterEditMode(event) {
    let row = event.target.closest("tr");
    let itemsToHide = row.querySelectorAll(".edit-mode-hidden");
    itemsToHide.forEach(item => {
        item.hidden = true;
    });
    let itemsToShow = row.querySelectorAll(".edit-mode-visible");
    itemsToShow.forEach(item => {
        item.hidden = false;
    });
}

function commitChanges(event, endpoint, dataTypes) {
    let row = event.target.closest("tr");
    let primaryKey = row.dataset.primaryKey;
    let data = createObjFromRow(row);
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
    let data = createObjFromRow(row);
    let employeeIDAttribute = dataTypes.find(attribute => attribute.attribName === "employeeID");
    if (employeeIDAttribute && !data[employeeIDAttribute.attribName]) {
        data[employeeIDAttribute.attribName] = generateRandomEmployeeID();
    }

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

function createObjFromRow(row) {
    let cells = row.querySelectorAll("td");
    let output = {};
    cells.forEach(cell => {
        if (cell.dataset.attribName) {
            output[cell.dataset.attribName] = cell.querySelector("select, input").value;
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
    if (data == "") {
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
