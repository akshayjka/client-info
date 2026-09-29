const form = document.getElementById("clientForm");

const clientId = document.getElementById("clientId");

const nameInput = document.getElementById("name");

const phoneInput = document.getElementById("phone");

const attendanceInput =
  document.getElementById("attendance");

const interestInput =
  document.getElementById("interest");

const remarksInput =
  document.getElementById("remarks");

const tableBody =
  document.getElementById("clientTableBody");

const emptyState =
  document.getElementById("emptyState");

const recordCount =
  document.getElementById("recordCount");

const searchInput =
  document.getElementById("searchInput");

const saveBtn =
  document.getElementById("saveBtn");

const cancelEditBtn =
  document.getElementById("cancelEditBtn");

const formTitle =
  document.getElementById("formTitle");

const toast =
  document.getElementById("toast");

const dbStatus =
  document.getElementById("dbStatus");


let clients = [];

let toastTimer;


// -----------------------------------------
// INITIAL LOAD
// -----------------------------------------

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    await checkDatabase();

    await loadClients();

  }
);


// -----------------------------------------
// EVENT LISTENERS
// -----------------------------------------

form.addEventListener(
  "submit",
  saveClient
);

cancelEditBtn.addEventListener(
  "click",
  resetForm
);

searchInput.addEventListener(
  "input",
  renderTable
);


// -----------------------------------------
// CHECK DATABASE
// -----------------------------------------

async function checkDatabase() {

  try {

    const response =
      await fetch("/api/health");

    if (!response.ok) {
      throw new Error("Database unavailable");
    }

    const result =
      await response.json();

    if (result.database === "MongoDB connected") {

      dbStatus.textContent =
        "MongoDB connected";

      dbStatus.classList.add(
        "connected"
      );

    } else {

      dbStatus.textContent =
        "MongoDB disconnected";

      dbStatus.classList.remove(
        "connected"
      );

    }

  } catch (error) {

    dbStatus.textContent =
      "Database error";

    dbStatus.classList.remove(
      "connected"
    );

  }

}


// -----------------------------------------
// LOAD CLIENTS
// -----------------------------------------

async function loadClients() {

  try {

    const response =
      await fetch("/api/clients");

    const result =
      await response.json();

    if (!response.ok) {

      throw new Error(
        result.error ||
        "Failed to load clients."
      );

    }

    clients = Array.isArray(result)
      ? result
      : [];

    renderTable();

  } catch (error) {

    console.error(error);

    showToast(
      error.message ||
      "Unable to load client records."
    );

  }

}


// -----------------------------------------
// SAVE CLIENT
// ADD OR UPDATE
// -----------------------------------------

async function saveClient(event) {

  event.preventDefault();


  const payload = {

    name:
      nameInput.value.trim(),

    phone:
      phoneInput.value.trim(),

    attendance:
      attendanceInput.value,

    interest:
      interestInput.value,

    remarks:
      remarksInput.value.trim()

  };


  // Validation

  if (!payload.name) {

    showToast(
      "Please enter client name."
    );

    nameInput.focus();

    return;

  }


  if (!payload.phone) {

    showToast(
      "Please enter phone number."
    );

    phoneInput.focus();

    return;

  }


  const editingId =
    clientId.value.trim();


  const url = editingId
    ? `/api/clients/${encodeURIComponent(editingId)}`
    : "/api/clients";


  const method = editingId
    ? "PUT"
    : "POST";


  saveBtn.disabled = true;

  saveBtn.textContent =
    editingId
      ? "Updating..."
      : "Saving...";


  try {

    const response =
      await fetch(url, {

        method,

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(payload)

      });


    const result =
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.error ||
        "Unable to save client."
      );

    }


    showToast(
      editingId
        ? "Client updated successfully."
        : "Client added successfully."
    );


    resetForm();

    await loadClients();

    await checkDatabase();


  } catch (error) {

    console.error(error);

    showToast(
      error.message ||
      "Unable to save client."
    );

  } finally {

    saveBtn.disabled = false;

    saveBtn.textContent =
      "Add Client";

  }

}


// -----------------------------------------
// RENDER TABLE
// -----------------------------------------

function renderTable() {

  const search =
    searchInput.value
      .trim()
      .toLowerCase();


  const filtered =
    clients.filter(client => {

      const name =
        String(client.name || "")
          .toLowerCase();

      const phone =
        String(client.phone || "")
          .toLowerCase();

      const remarks =
        String(client.remarks || "")
          .toLowerCase();

      return (
        name.includes(search) ||
        phone.includes(search) ||
        remarks.includes(search)
      );

    });


  tableBody.innerHTML = "";


  filtered.forEach(
    (client, index) => {

      const row =
        document.createElement("tr");


      const attendanceClass =
        client.attendance === "Attended"
          ? "attended"
          : "not-attended";


      const interestClass =
        client.interest === "Interested"
          ? "interested"
          : "not-interested";


      row.innerHTML = `

        <td>
          ${index + 1}
        </td>


        <td>
          <strong>
            ${escapeHtml(client.name)}
          </strong>
        </td>


        <td>
          ${escapeHtml(client.phone)}
        </td>


        <td>

          <span
            class="badge ${attendanceClass}">

            ${escapeHtml(
              client.attendance
            )}

          </span>

        </td>


        <td>

          <span
            class="badge ${interestClass}">

            ${escapeHtml(
              client.interest
            )}

          </span>

        </td>


        <td>
          ${escapeHtml(
            client.remarks || "-"
          )}
        </td>


        <td>
          ${formatDate(
            client.createdAt
          )}
        </td>


        <td>

          <div class="action-group">

            <button
              class="action edit"
              type="button"
              data-action="edit"
              data-id="${client._id}">

              Edit

            </button>


            <button
              class="action delete"
              type="button"
              data-action="delete"
              data-id="${client._id}">

              Delete

            </button>

          </div>

        </td>

      `;


      tableBody.appendChild(row);

    }
  );


  recordCount.textContent =
    `${filtered.length} ${
      filtered.length === 1
        ? "record"
        : "records"
    }`;


  emptyState.style.display =
    filtered.length
      ? "none"
      : "block";

}


// -----------------------------------------
// TABLE BUTTON EVENTS
// -----------------------------------------

tableBody.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "button[data-action]"
      );


    if (!button) {
      return;
    }


    const id =
      button.dataset.id;


    const action =
      button.dataset.action;


    if (action === "edit") {

      editClient(id);

    }


    if (action === "delete") {

      deleteClient(id);

    }

  }
);


// -----------------------------------------
// EDIT CLIENT
// -----------------------------------------

function editClient(id) {

  const client =
    clients.find(
      item =>
        String(item._id) === String(id)
    );


  if (!client) {

    showToast(
      "Client record not found."
    );

    return;

  }


  clientId.value =
    client._id;


  nameInput.value =
    client.name || "";


  phoneInput.value =
    client.phone || "";


  attendanceInput.value =
    client.attendance ||
    "Not Attended";


  interestInput.value =
    client.interest ||
    "Not Interested";


  remarksInput.value =
    client.remarks || "";


  formTitle.textContent =
    "Edit Client";


  saveBtn.textContent =
    "Update Client";


  cancelEditBtn.classList.remove(
    "hidden"
  );


  window.scrollTo({

    top: 0,

    behavior: "smooth"

  });

}


// -----------------------------------------
// DELETE CLIENT
// -----------------------------------------

async function deleteClient(id) {

  const client =
    clients.find(
      item =>
        String(item._id) === String(id)
    );


  if (!client) {

    showToast(
      "Client record not found."
    );

    return;

  }


  const confirmed =
    window.confirm(
      `Delete ${client.name}?`
    );


  if (!confirmed) {
    return;
  }


  try {

    const response =
      await fetch(
        `/api/clients/${encodeURIComponent(id)}`,
        {
          method: "DELETE"
        }
      );


    const result =
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.error ||
        "Unable to delete client."
      );

    }


    showToast(
      "Client deleted successfully."
    );


    await loadClients();

    await checkDatabase();


  } catch (error) {

    console.error(error);

    showToast(
      error.message ||
      "Unable to delete client."
    );

  }

}


// -----------------------------------------
// RESET FORM
// -----------------------------------------

function resetForm() {

  form.reset();


  clientId.value = "";


  attendanceInput.value =
    "Not Attended";


  interestInput.value =
    "Not Interested";


  formTitle.textContent =
    "Add Client";


  saveBtn.textContent =
    "Add Client";


  cancelEditBtn.classList.add(
    "hidden"
  );

}


// -----------------------------------------
// DATE FORMAT
// -----------------------------------------

function formatDate(value) {

  if (!value) {
    return "-";
  }


  const date =
    new Date(value);


  if (Number.isNaN(date.getTime())) {
    return "-";
  }


  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  );

}


// -----------------------------------------
// HTML ESCAPE
// -----------------------------------------

function escapeHtml(value) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


// -----------------------------------------
// TOAST
// -----------------------------------------

function showToast(message) {

  clearTimeout(toastTimer);


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2500
    );

}