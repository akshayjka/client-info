// ======================================================
// ELEMENTS
// ======================================================

const form =
  document.getElementById(
    "clientForm"
  );


const clientId =
  document.getElementById(
    "clientId"
  );


const nameInput =
  document.getElementById(
    "name"
  );


const phoneInput =
  document.getElementById(
    "phone"
  );


const gymNameInput =
  document.getElementById(
    "gymName"
  );


const attendanceInput =
  document.getElementById(
    "attendance"
  );


const interestInput =
  document.getElementById(
    "interest"
  );


const remarksInput =
  document.getElementById(
    "remarks"
  );


const tableBody =
  document.getElementById(
    "clientTableBody"
  );


const emptyState =
  document.getElementById(
    "emptyState"
  );


const recordCount =
  document.getElementById(
    "recordCount"
  );


const searchInput =
  document.getElementById(
    "searchInput"
  );


const gymFilter =
  document.getElementById(
    "gymFilter"
  );


const attendanceFilter =
  document.getElementById(
    "attendanceFilter"
  );


const interestFilter =
  document.getElementById(
    "interestFilter"
  );


const clearFiltersBtn =
  document.getElementById(
    "clearFiltersBtn"
  );


const saveBtn =
  document.getElementById(
    "saveBtn"
  );


const cancelEditBtn =
  document.getElementById(
    "cancelEditBtn"
  );


const formTitle =
  document.getElementById(
    "formTitle"
  );


const toast =
  document.getElementById(
    "toast"
  );


const dbStatus =
  document.getElementById(
    "dbStatus"
  );


// ======================================================
// STATE
// ======================================================

let clients = [];

let toastTimer;


// ======================================================
// INITIAL LOAD
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    await checkDatabase();

    await loadClients();

  }
);


// ======================================================
// EVENTS
// ======================================================

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


gymFilter.addEventListener(
  "change",
  renderTable
);


attendanceFilter.addEventListener(
  "change",
  renderTable
);


interestFilter.addEventListener(
  "change",
  renderTable
);


clearFiltersBtn.addEventListener(
  "click",
  clearFilters
);


// ======================================================
// DATABASE STATUS
// ======================================================

async function checkDatabase() {

  try {

    const response =
      await fetch(
        "/api/health"
      );


    if (!response.ok) {

      throw new Error(
        "Database unavailable"
      );

    }


    const result =
      await response.json();


    if (
      result.database ===
      "MongoDB connected"
    ) {

      dbStatus.textContent =
        "MongoDB connected";


      dbStatus.classList.add(
        "connected"
      );

    }

    else {

      dbStatus.textContent =
        "MongoDB disconnected";


      dbStatus.classList.remove(
        "connected"
      );

    }

  }

  catch (error) {

    dbStatus.textContent =
      "Database error";


    dbStatus.classList.remove(
      "connected"
    );

  }

}


// ======================================================
// LOAD CLIENTS
// ======================================================

async function loadClients() {

  try {

    const response =
      await fetch(
        "/api/clients"
      );


    const result =
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.error ||
        "Failed to load clients."
      );

    }


    clients =
      Array.isArray(result)
        ? result
        : [];


    updateGymFilter();

    renderTable();

  }

  catch (error) {

    console.error(
      error
    );


    showToast(
      error.message ||
      "Unable to load client records."
    );

  }

}


// ======================================================
// SAVE CLIENT
// ======================================================

async function saveClient(
  event
) {

  event.preventDefault();


  const payload = {

    name:
      nameInput.value.trim(),

    phone:
      phoneInput.value.trim(),

    gymName:
      gymNameInput.value.trim(),

    attendance:
      attendanceInput.value,

    interest:
      interestInput.value,

    remarks:
      remarksInput.value.trim()

  };


  // -----------------------------
  // VALIDATION
  // -----------------------------

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


  // -----------------------------
  // ADD / UPDATE
  // -----------------------------

  const editingId =
    clientId.value.trim();


  const url =
    editingId

      ? `/api/clients/${encodeURIComponent(
          editingId
        )}`

      : "/api/clients";


  const method =
    editingId
      ? "PUT"
      : "POST";


  saveBtn.disabled =
    true;


  saveBtn.textContent =
    editingId
      ? "Updating..."
      : "Saving...";


  try {

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
            JSON.stringify(
              payload
            )

        }
      );


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

  }

  catch (error) {

    console.error(
      error
    );


    showToast(
      error.message ||
      "Unable to save client."
    );

  }

  finally {

    saveBtn.disabled =
      false;


    saveBtn.textContent =
      "Add Client";

  }

}


// ======================================================
// UPDATE GYM FILTER
// ======================================================

function updateGymFilter() {

  const currentValue =
    gymFilter.value;


  const gyms =
    [
      ...new Set(

        clients

          .map(
            client =>
              String(
                client.gymName ||
                ""
              ).trim()
          )

          .filter(
            gym =>
              gym.length > 0
          )

      )
    ];


  gyms.sort(
    (a, b) =>
      a.localeCompare(b)
  );


  gymFilter.innerHTML = `

    <option value="">
      All Gyms
    </option>

  `;


  gyms.forEach(
    gym => {

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
// RENDER + FILTER TABLE
// ======================================================

function renderTable() {

  const search =
    searchInput.value
      .trim()
      .toLowerCase();


  const selectedGym =
    gymFilter.value;


  const selectedAttendance =
    attendanceFilter.value;


  const selectedInterest =
    interestFilter.value;


  const filtered =
    clients.filter(
      client => {


        // -----------------------------
        // SEARCH
        // -----------------------------

        const name =
          String(
            client.name ||
            ""
          ).toLowerCase();


        const phone =
          String(
            client.phone ||
            ""
          ).toLowerCase();


        const gymName =
          String(
            client.gymName ||
            ""
          ).toLowerCase();


        const remarks =
          String(
            client.remarks ||
            ""
          ).toLowerCase();


        const matchesSearch =
          !search ||

          name.includes(
            search
          ) ||

          phone.includes(
            search
          ) ||

          gymName.includes(
            search
          ) ||

          remarks.includes(
            search
          );


        // -----------------------------
        // GYM
        // -----------------------------

        const matchesGym =
          !selectedGym ||

          String(
            client.gymName ||
            ""
          ) ===
            selectedGym;


        // -----------------------------
        // ATTENDANCE
        // -----------------------------

        const matchesAttendance =
          !selectedAttendance ||

          String(
            client.attendance ||
            "None"
          ) ===
            selectedAttendance;


        // -----------------------------
        // INTEREST
        // -----------------------------

        const matchesInterest =
          !selectedInterest ||

          String(
            client.interest ||
            "None"
          ) ===
            selectedInterest;


        // -----------------------------
        // ALL FILTERS MUST MATCH
        // -----------------------------

        return (

          matchesSearch &&

          matchesGym &&

          matchesAttendance &&

          matchesInterest

        );

      }
    );


  // ====================================================
  // BUILD TABLE
  // ====================================================

  tableBody.innerHTML =
    "";


  filtered.forEach(
    (client, index) => {


      const row =
        document.createElement(
          "tr"
        );


      const attendance =
        client.attendance ||
        "None";


      const interest =
        client.interest ||
        "None";


      const attendanceClass =
        getStatusClass(
          attendance
        );


      const interestClass =
        getStatusClass(
          interest
        );


      row.innerHTML = `

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
          ${escapeHtml(
            client.gymName ||
            "-"
          )}
        </td>


        <td>

          <span
            class="badge ${attendanceClass}"
          >

            ${escapeHtml(
              attendance
            )}

          </span>

        </td>


        <td>

          <span
            class="badge ${interestClass}"
          >

            ${escapeHtml(
              interest
            )}

          </span>

        </td>


        <td>

          ${escapeHtml(
            client.remarks ||
            "-"
          )}

        </td>


        <td>

          ${formatDate(
            client.createdAt
          )}

        </td>


        <td>

          <div
            class="action-group"
          >


            <button

              class="action edit"

              type="button"

              data-action="edit"

              data-id="${client._id}"

            >

              Edit

            </button>



            <button

              class="action delete"

              type="button"

              data-action="delete"

              data-id="${client._id}"

            >

              Delete

            </button>


          </div>

        </td>

      `;


      tableBody.appendChild(
        row
      );

    }
  );


  // ====================================================
  // RECORD COUNT
  // ====================================================

  recordCount.textContent =

    `${filtered.length} ${
      filtered.length === 1
        ? "record"
        : "records"
    }`;


  // ====================================================
  // EMPTY STATE
  // ====================================================

  emptyState.style.display =

    filtered.length
      ? "none"
      : "block";

}


// ======================================================
// STATUS CLASS
// ======================================================

function getStatusClass(
  value
) {

  if (
    value ===
    "Attended"
  ) {

    return "attended";

  }


  if (
    value ===
    "Not Attended"
  ) {

    return "not-attended";

  }


  if (
    value ===
    "Interested"
  ) {

    return "interested";

  }


  if (
    value ===
    "Not Interested"
  ) {

    return "not-interested";

  }


  return "none-status";

}


// ======================================================
// TABLE ACTIONS
// ======================================================

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


    if (
      action ===
      "edit"
    ) {

      editClient(id);

    }


    if (
      action ===
      "delete"
    ) {

      deleteClient(id);

    }

  }
);


// ======================================================
// EDIT CLIENT
// ======================================================

function editClient(
  id
) {

  const client =
    clients.find(
      item =>
        String(
          item._id
        ) ===
        String(id)
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
    client.name ||
    "";


  phoneInput.value =
    client.phone ||
    "";


  gymNameInput.value =
    client.gymName ||
    "";


  attendanceInput.value =
    client.attendance ||
    "None";


  interestInput.value =
    client.interest ||
    "None";


  remarksInput.value =
    client.remarks ||
    "";


  formTitle.textContent =
    "Edit Client";


  saveBtn.textContent =
    "Update Client";


  cancelEditBtn.classList.remove(
    "hidden"
  );


  window.scrollTo({

    top: 0,

    behavior:
      "smooth"

  });

}


// ======================================================
// DELETE CLIENT
// ======================================================

async function deleteClient(
  id
) {

  const client =
    clients.find(
      item =>
        String(
          item._id
        ) ===
        String(id)
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

        `/api/clients/${encodeURIComponent(
          id
        )}`,

        {
          method:
            "DELETE"
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

  }

  catch (error) {

    console.error(
      error
    );


    showToast(
      error.message ||
      "Unable to delete client."
    );

  }

}


// ======================================================
// CLEAR FILTERS
// ======================================================

function clearFilters() {

  searchInput.value =
    "";

  gymFilter.value =
    "";

  attendanceFilter.value =
    "";

  interestFilter.value =
    "";


  renderTable();

}


// ======================================================
// RESET FORM
// ======================================================

function resetForm() {

  form.reset();


  clientId.value =
    "";


  attendanceInput.value =
    "None";


  interestInput.value =
    "None";


  formTitle.textContent =
    "Add Client";


  saveBtn.textContent =
    "Add Client";


  cancelEditBtn.classList.add(
    "hidden"
  );

}


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(
  value
) {

  if (!value) {

    return "-";

  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "-";

  }


  return date.toLocaleString(
    "en-IN",
    {

      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit"

    }
  );

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(
  value
) {

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


// ======================================================
// TOAST
// ======================================================

function showToast(
  message
) {

  clearTimeout(
    toastTimer
  );


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