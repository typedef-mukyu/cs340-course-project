function newDropdown(data, name, pk, nullable){
    let dropdown = document.createElement("select");
    if(nullable) {
        let nullSelector = document.createElement("option");
        nullSelector.value = "";
        nullSelector.text = "(None)";
        dropdown.append(nullSelector);
    }
    data.forEach(record => {
        let option = document.createElement("option");
        option.value = record[pk];
        option.text = record[name];
        dropdown.append(option);
    });
    return dropdown;
}
function getData(endpoint){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", endpoint, false);
    xhr.send();
    return JSON.parse(xhr.response);
}

/*  dataTypes[] is an array of:
 *  {
 *      attribName: name of attribute
 *      type: ("")
 *      fkInfo: {attribName, fkName, pkName, data}
 *      nullable: boolean
 *  }
 */
function newTableFromData(data, dataTypes, tableToReplace){
    let table;
    if(tableToReplace === undefined) table = document.createElement("table");
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
    })
    headRow.append(document.createElement("th")); // empty cells to fix CSS
    headRow.append(document.createElement("th"));
    table.append(header);
    let body = document.createElement("tbody");
    if(data.length === 0) body.insertRow(); // add a blank row, CSS breaks without it
    data.forEach(record => {
        let row = body.insertRow();
        row.dataset.primaryKey = record[dataTypes[0].attribName]
        dataTypes.forEach(attrib => {
            let cell = row.insertCell();
            cell.dataset.attribName = attrib.attribName;
            let dataCell = document.createElement("div");
            dataCell.classList.add("data-view-cell");
            dataCell.classList.add("edit-mode-hidden");
            if(record[attrib.attribName] && attrib.type === "date") dataCell.innerText = record[attrib.attribName].slice(0, 10);
            else dataCell.innerText = record[attrib.attribName];
            let editCell = document.createElement("div");
            editCell.classList.add("data-edit-cell");
            editCell.classList.add("edit-mode-visible");
            editCell.hidden = true;
            
            if(attrib.fkinfo){
                let dropDown = newDropdown(attrib.fkinfo.data, attrib.fkinfo.attribName, attrib.fkinfo.pkName, attrib.nullable);
                dropDown.value = record[attrib.fkinfo.fkName];
                dropDown.id = ("edit-cell-" + record[dataTypes[0].attribName] + "-" + attrib.attribName)
                editCell.append(dropDown);
            }
            else{
                let valueInput = document.createElement("input");
                if(attrib.autoinc) valueInput.disabled = true;
                else if (!attrib.nullable) valueInput.required = true;
                if(attrib.type === "str"){
                    valueInput.type = "text";
                }
                else if(attrib.type.slice(0, 2) === "num"){
                    valueInput.type = "number";
                    valueInput.step = String(10 ** (- attrib.type.slice(3)))
                }
                else if(attrib.type === "date"){
                    valueInput.type = "date";
                }
                valueInput.value = record[attrib.attribName];
                // console.log(dataTypes[0])
                valueInput.id = ("edit-cell-" + record[dataTypes[0].attribName] + "-" + attrib.attribName)
                editCell.append(valueInput);
            }
            cell.append(dataCell, editCell);
        })
        let editButtonCell = row.insertCell();
        let editButton = document.createElement("button");
        editButton.classList.add("edit-button", "edit-mode-hidden");
        editButton.innerText = "Edit"
        editButton.addEventListener("click", enterEditMode);
        let saveButton = document.createElement("button");
        saveButton.classList.add("save-button", "edit-mode-visible");
        saveButton.innerText = "Save"
        saveButton.hidden = true;
        saveButton.addEventListener("click", commitChanges);

        editButtonCell.append(editButton, saveButton);

        let delButtonCell = row.insertCell();
        let delButton = document.createElement("button");
        delButton.classList.add("delete-button", "edit-mode-hidden");
        delButton.innerText = "Delete"
        delButton.addEventListener("click", deleteRecord);
        let cancelButton = document.createElement("button");
        cancelButton.classList.add("cancel-button", "edit-mode-visible");
        cancelButton.innerText = "Cancel"
        cancelButton.hidden = true;
        cancelButton.addEventListener("click", discardChanges);

        delButtonCell.append(delButton, cancelButton);
    })
    
    table.append(body);
    let footer = document.createElement("tfoot");
    let footerRow = footer.insertRow();
    dataTypes.forEach(attrib => {
        let cell = footerRow.insertCell();
        cell.dataset.attribName = attrib.attribName;
        let editCell = document.createElement("div");
        editCell.classList.add("data-add-cell");
        if(attrib.fkinfo){
            let dropDown = newDropdown(attrib.fkinfo.data, attrib.fkinfo.attribName, attrib.fkinfo.pkName, attrib.nullable);
            dropDown.id = ("add-cell-" + attrib.attribName)
            editCell.append(dropDown);
        }
        else{
            let valueInput = document.createElement("input");
            valueInput.placeholder = (attrib.nullable? "(NULL)": (attrib.autoinc? "(Automatic)" : "Required"));
            if(attrib.autoinc) valueInput.disabled = true;
            else if (!attrib.nullable) valueInput.required = true;
            if(attrib.type === "str"){
                valueInput.type = "text";
            }
            else if(attrib.type.slice(0, 2) === "num"){
                valueInput.type = "number";
                valueInput.step = String(10 ** (- attrib.type.slice(3)))
            }
            else if(attrib.type === "date"){
                valueInput.type = "date";
            }
            
            // console.log(dataTypes[0])
            valueInput.id = ("add-cell-" + attrib.attribName)
            editCell.append(valueInput);
        }
        
        cell.append(editCell);
    })
    let addCell = footerRow.insertCell();
    let addButton = document.createElement("button");
    addButton.classList.add("add-button");
    addButton.innerText = "Add"
    addButton.addEventListener("click", button => (addRow(button.target, dataTypes)));
    addCell.append(addButton);
    footerRow.insertCell(); // blank cell for CSS
    table.append(footer);
    return table;
}
function addFKFilterToTable(table, data, pk, name, nullable, dataTypes, endpoint){
    let dropDown = newDropdown(data, pk, name, nullable);
    let anySelector = document.createElement("option");
    anySelector.value = "-1";
    anySelector.text = "(Any)";
    dropDown.prepend(anySelector);
    dropDown.value = "-1";
    dropDown.addEventListener("change", dropDown => {
        refreshFilter(dropDown.target, table, endpoint, dataTypes);
    })
    return dropDown;
}
function refreshFilter(dropDown, table, endpoint, dataTypes){
    
    let url;
    if(dropDown.value == "-1") url = endpoint + ".."
    else url = endpoint + dropDown.value;
    let data = getData(url);
    newTableFromData(data, dataTypes, table);
}
function enterEditMode(){
    let row = this.closest("tr");
    let itemsToHide = row.querySelectorAll(".edit-mode-hidden");
    itemsToHide.forEach(item => {
        item.hidden = true;
    })
    let itemsToShow = row.querySelectorAll(".edit-mode-visible");
    itemsToShow.forEach(item => {
        item.hidden = false;
    })
}
function commitChanges(){
    // todo: commit changes to the database
    
}
function discardChanges(){
    let row = this.closest("tr");
    let cells = row.querySelectorAll("td");
    cells.forEach(cell => {
        
        let oldData = cell.querySelector("data-view-cell");
        let newData = cell.querySelector("data-edit-cell");
        
        if(oldData && newData){
            newData.innerText = oldData.innerText;
        }
    })
    let itemsToHide = row.querySelectorAll(".edit-mode-visible");
    itemsToHide.forEach(item => {
        item.hidden = true;
    })
    let itemsToShow = row.querySelectorAll(".edit-mode-hidden");
    itemsToShow.forEach(item => {
        item.hidden = false;
    })
}
function deleteRecord(){
    if(confirm("Really delete this record?")){
        let row = this.closest("tr");
        row.remove();
    }
}
function addRow(button, dataTypes){
    let row = button.closest("tr");
    let data = createObjFromRow(row);
    if(!validateData(data, dataTypes)) alert("One or more entry fields are invalid.");
    // todo: send row to DB
}

function createObjFromRow(row){
    let cells = row.querySelectorAll("td");
    let output = {};
    cells.forEach(cell => {
        if(cell.dataset.attribName){
            output[cell.dataset.attribName] = cell.querySelector("select, input").value
        }
    })
    return output;
}

function validateData(entity, dataTypes){
    let attributes = Object.entries(entity);
    let result = attributes.every(record => {
        let dataType = dataTypes.find(currentType => {
            return (currentType.attribName === record[0])
        })
        return validateAttribute(record[1], dataType);
    })
    return result;
}
function validateAttribute(data, dataType){
    if (data == ""){
        if (dataType.nullable || dataType.autoinc) return true;
        else return false;
    }
    else if(dataType.type.slice(0, 3) === "num") return (!isNaN(Number(data)));
    else if(dataType.type === "date") return !isNaN(Date.parse(data));
    else return true;
}
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('toggleButton');

    toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
});