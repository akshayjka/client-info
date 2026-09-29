// ======================================================
// DOM ELEMENTS
// ======================================================

const clientForm =
  document.getElementById("clientForm");

const clientId =
  document.getElementById("clientId");

const nameInput =
  document.getElementById("name");

const phoneInput =
  document.getElementById("phone");

const clientCategoryInput =
  document.getElementById("clientCategory");

const gymNameInput =
  document.getElementById("gymName");

const attendanceInput =
  document.getElementById("attendance");

const interestInput =
  document.getElementById("interest");

const remarksInput =
  document.getElementById("remarks");

const saveButton =
  document.getElementById("saveButton");

const cancelButton =
  document.getElementById("cancelButton");

const formTitle =
  document.getElementById("formTitle");

const searchInput =
  document.getElementById("searchInput");

const categoryFilter =
  document.getElementById("categoryFilter");

const gymFilter =
  document.getElementById("gymFilter");

const attendanceFilter =
  document.getElementById("attendanceFilter");

const interestFilter =
  document.getElementById("interestFilter");

const clearFiltersButton =
  document.getElementById("clearFiltersButton");

const clientTableBody =
  document.getElementById("clientTableBody");

const clientCount =
  document.getElementById("clientCount");

const dbStatus =
  document.getElementById("dbStatus");

const toast =
  document.getElementById("toast");


// ======================================================
// STATE
// ======================================================

let clients = [];


// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadDatabaseStatus();

    loadClients();

    setupEvents();

  }
);


// ======================================================
// EVENTS
// ======================================================

function setupEvents() {

  clientForm.addEventListener(
    "submit",
    handleFormSubmit
  );


  cancelButton.addEventListener(
    "click",
    resetForm
  );


  searchInput.addEventListener(
    "input",
    renderClients
  );


  categoryFilter.addEventListener(
    "change",
    renderClients
  );


  gymFilter.addEventListener(
    "change",
    renderClients
  );


  attendanceFilter.addEventListener(
    "change",
    renderClients
  );


  interestFilter.addEventListener(
    "change",
    renderClients
  );


  clearFiltersButton.addEventListener(
    "click",
    clearFilters
  );


  clientTableBody.addEventListener(
    "click",
    handleTableAction
  );

}


// ======================================================
// DATABASE STATUS
// ======================================================

async function loadDatabaseStatus() {

  try {

    const response =
      await fetch("/api/health");

    const data =
      await response.json();


    if (
      response.ok &&
      data.database === "connected"
    ) {

      dbStatus.textContent =
        "MongoDB Connected";

      dbStatus.className =
        "db-status connected";

    } else {

      dbStatus.textContent =
        "Database Disconnected";

      dbStatus.className =
        "db-status disconnected";

    }

  } catch (error) {

    console.error(error);

    dbStatus.textContent =
      "Database Error";

    dbStatus.className =
      "db-status disconnected";

  }

}


// ======================================================
// LOAD CLIENTS
// ======================================================

async function loadClients() {

  try {

    const response =
      await fetch("/api/clients");


    if (!response.ok) {

      throw new Error(
        "Failed to load clients"
      );

    }


    clients =
      await response.json();


    updateGymFilter();

    renderClients();

  } catch (error) {

    console.error(
      "Load clients error:",
      error
    );


    clientTableBody.innerHTML = `
      <tr>
        <td colspan="10" class="empty-state">
          Failed to load clients.
        </td>
      </tr>
    `;

  }

}


// ======================================================
// SAVE CLIENT
// ======================================================

async function handleFormSubmit(event) {

  event.preventDefault();


  const id =
    clientId.value.trim();


  const clientData = {

    name:
      nameInput.value.trim(),

    phone:
      phoneInput.value.trim(),

    clientCategory:
      clientCategoryInput.value,

    gymName:
      gymNameInput.value.trim(),

    attendance:
      attendanceInput.value,

    interest:
      interestInput.value,

    remarks:
      remarksInput.value.trim()

  };


  if (!clientData.name) {

    showToast(
      "Please enter client name.",
      "error"
    );

    nameInput.focus();

    return;

  }


  if (!clientData.phone) {

    showToast(
      "Please enter phone number.",
      "error"
    );

    phoneInput.focus();

    return;

  }


  if (!clientData.clientCategory) {

    showToast(
      "Please select client category.",
      "error"
    );

    clientCategoryInput.focus();

    return;

  }


  try {

    saveButton.disabled = true;

    saveButton.textContent =
      id
        ? "Updating..."
        : "Adding...";


    const url =
      id
        ? `/api/clients/${id}`
        : "/api/clients";


    const method =
      id
        ? "PUT"
        : "POST";


    const response =
      await fetch(
        url,
        {
          method,

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(clientData)
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Something went wrong"
      );

    }


    if (id) {

      showToast(
        "Client updated successfully.",
        "success"
      );

    } else {

      showToast(
        "Client added successfully.",
        "success"
      );

    }


    resetForm();

    await loadClients();

  } catch (error) {

    console.error(
      "Save client error:",
      error
    );


    showToast(
      error.message ||
      "Failed to save client.",
      "error"
    );

  } finally {

    saveButton.disabled = false;

    saveButton.textContent =
      clientId.value
        ? "Update Client"
        : "Add Client";

  }

}


// ======================================================
// RENDER CLIENTS
// ======================================================

function renderClients() {

  const searchTerm =
    searchInput.value
      .trim()
      .toLowerCase();


  const selectedCategory =
    categoryFilter.value;


  const selectedGym =
    gymFilter.value;


  const selectedAttendance =
    attendanceFilter.value;


  const selectedInterest =
    interestFilter.value;


  const filteredClients =
    clients.filter(
      (client) => {

        // ----------------------------------------------
        // SEARCH
        // ----------------------------------------------

        const searchableText = [

          client.name,

          client.phone,

          client.clientCategory,

          client.gymName,

          client.attendance,

          client.interest,

          client.remarks

        ]
          .join(" ")
          .toLowerCase();


        const matchesSearch =
          !searchTerm ||
          searchableText.includes(
            searchTerm
          );


        // ----------------------------------------------
        // CATEGORY
        // ----------------------------------------------

        const matchesCategory =
          !selectedCategory ||
          client.clientCategory ===
            selectedCategory;


        // ----------------------------------------------
        // GYM
        // ----------------------------------------------

        const matchesGym =
          !selectedGym ||
          client.gymName ===
            selectedGym;


        // ----------------------------------------------
        // ATTENDANCE
        // ----------------------------------------------

        const matchesAttendance =
          !selectedAttendance ||
          client.attendance ===
            selectedAttendance;


        // ----------------------------------------------
        // INTEREST
        // ----------------------------------------------

        const matchesInterest =
          !selectedInterest ||
          client.interest ===
            selectedInterest;


        return (

          matchesSearch &&

          matchesCategory &&

          matchesGym &&

          matchesAttendance &&

          matchesInterest

        );

      }
    );


  // ====================================================
  // CLIENT COUNT
  // ====================================================

  clientCount.textContent =
    `${filteredClients.length} ${
      filteredClients.length === 1
        ? "client"
        : "clients"
    }`;


  // ====================================================
  // EMPTY STATE
  // ====================================================

  if (!filteredClients.length) {

    clientTableBody.innerHTML = `
      <tr>
        <td colspan="10" class="empty-state">
          No clients found.
        </td>
      </tr>
    `;

    return;

  }


  // ====================================================
  // TABLE
  // ====================================================

  clientTableBody.innerHTML =
    filteredClients
      .map(
        (client, index) => {

          const category =
            client.clientCategory ||
            "Gym";


          const categoryClass =
            category.toLowerCase();


          return `
            <tr>

              <td>
                ${index + 1}
              </td>


              <td>
                <strong>
                  ${escapeHtml(
                    client.name
                  )}
                </strong>
              </td>


              <td>
                ${escapeHtml(
                  client.phone
                )}
              </td>


              <td>

                <span
                  class="badge category-${categoryClass}"
                >
                  ${escapeHtml(
                    category
                  )}
                </span>

              </td>


              <td>
                ${
                  client.gymName
                    ? escapeHtml(
                        client.gymName
                      )
                    : "-"
                }
              </td>


              <td>
                ${getAttendanceBadge(
                  client.attendance
                )}
              </td>


              <td>
                ${getInterestBadge(
                  client.interest
                )}
              </td>


              <td class="remarks-cell">

                ${
                  client.remarks
                    ? escapeHtml(
                        client.remarks
                      )
                    : "-"
                }

              </td>


              <td>
                ${formatDate(
                  client.createdAt
                )}
              </td>


              <td>

                <div class="action-buttons">

                  <button
                    type="button"
                    class="btn btn-small btn-edit"
                    data-action="edit"
                    data-id="${client._id}"
                  >
                    Edit
                  </button>


                  <button
                    type="button"
                    class="btn btn-small btn-delete"
                    data-action="delete"
                    data-id="${client._id}"
                  >
                    Delete
                  </button>

                </div>

              </td>

            </tr>
          `;

        }
      )
      .join("");

}


// ======================================================
// UPDATE GYM FILTER
// ======================================================

function updateGymFilter() {

  const currentValue =
    gymFilter.value;


  const gyms = [
    ...new Set(
      clients
        .map(
          (client) =>
            client.gymName
        )
        .filter(
          (gym) =>
            gym &&
            gym.trim()
        )
    )
  ].sort(
    (a, b) =>
      a.localeCompare(b)
  );


  gymFilter.innerHTML = `
    <option value="">
      All Gyms
    </option>
  `;


  gyms.forEach(
    (gym) => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        gym;

      option.textContent =
        gym;

      gymFilter.appendChild(
        option
      );

    }
  );


  if (
    gyms.includes(
      currentValue
    )
  ) {

    gymFilter.value =
      currentValue;

  }

}


// ======================================================
// TABLE ACTIONS
// ======================================================

function handleTableAction(event) {

  const button =
    event.target.closest(
      "button[data-action]"
    );


  if (!button) {
    return;
  }


  const action =
    button.dataset.action;


  const id =
    button.dataset.id;


  if (action === "edit") {

    editClient(id);

  }


  if (action === "delete") {

    deleteClient(id);

  }

}


// ======================================================
// EDIT CLIENT
// ======================================================

function editClient(id) {

  const client =
    clients.find(
      (item) =>
        item._id === id
    );


  if (!client) {

    showToast(
      "Client not found.",
      "error"
    );

    return;

  }


  clientId.value =
    client._id;


  nameInput.value =
    client.name || "";


  phoneInput.value =
    client.phone || "";


  clientCategoryInput.value =
    client.clientCategory ||
    "Gym";


  gymNameInput.value =
    client.gymName || "";


  attendanceInput.value =
    client.attendance ||
    "None";


  interestInput.value =
    client.interest ||
    "None";


  remarksInput.value =
    client.remarks || "";


  formTitle.textContent =
    "Edit Client";


  saveButton.textContent =
    "Update Client";


  cancelButton.classList.remove(
    "hidden"
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// ======================================================
// DELETE CLIENT
// ======================================================

async function deleteClient(id) {

  const client =
    clients.find(
      (item) =>
        item._id === id
    );


  if (!client) {
    return;
  }


  const confirmed =
    confirm(
      `Are you sure you want to delete "${client.name}"?`
    );


  if (!confirmed) {
    return;
  }


  try {

    const response =
      await fetch(
        `/api/clients/${id}`,
        {
          method: "DELETE"
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Failed to delete client"
      );

    }


    showToast(
      "Client deleted successfully.",
      "success"
    );


    await loadClients();

  } catch (error) {

    console.error(
      "Delete client error:",
      error
    );


    showToast(
      error.message ||
      "Failed to delete client.",
      "error"
    );

  }

}


// ======================================================
// RESET FORM
// ======================================================

function resetForm() {

  clientId.value = "";

  clientForm.reset();


  // Set defaults after reset

  clientCategoryInput.value =
    "Gym";

  attendanceInput.value =
    "None";

  interestInput.value =
    "None";


  formTitle.textContent =
    "Add New Client";


  saveButton.textContent =
    "Add Client";


  cancelButton.classList.add(
    "hidden"
  );

}


// ======================================================
// CLEAR FILTERS
// ======================================================

function clearFilters() {

  searchInput.value =
    "";

  categoryFilter.value =
    "";

  gymFilter.value =
    "";

  attendanceFilter.value =
    "";

  interestFilter.value =
    "";


  renderClients();

}


// ======================================================
// ATTENDANCE BADGE
// ======================================================

function getAttendanceBadge(
  attendance
) {

  const value =
    attendance || "None";


  if (
    value === "Attended"
  ) {

    return `
      <span class="badge attended">
        Attended
      </span>
    `;

  }


  if (
    value === "Not Attended"
  ) {

    return `
      <span class="badge not-attended">
        Not Attended
      </span>
    `;

  }


  return `
    <span class="badge none">
      None
    </span>
  `;

}


// ======================================================
// INTEREST BADGE
// ======================================================

function getInterestBadge(
  interest
) {

  const value =
    interest || "None";


  if (
    value === "Interested"
  ) {

    return `
      <span class="badge interested">
        Interested
      </span>
    `;

  }


  if (
    value === "Not Interested"
  ) {

    return `
      <span class="badge not-interested">
        Not Interested
      </span>
    `;

  }


  return `
    <span class="badge none">
      None
    </span>
  `;

}


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(dateValue) {

  if (!dateValue) {
    return "-";
  }


  const date =
    new Date(dateValue);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "-";

  }


  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


// ======================================================
// TOAST
// ======================================================

function showToast(
  message,
  type = "success"
) {

  toast.textContent =
    message;


  toast.className =
    `toast ${type} show`;


  setTimeout(
    () => {

      toast.classList.remove(
        "show"
      );

    },
    3000
  );

}