const customerForm = document.getElementById("customerForm");
const csvForm = document.getElementById("csvForm");
const tableBody = document.querySelector(".table-body");
const userName = document.querySelector(".name");
const userEmail = document.querySelector(".email");
const userDob = document.querySelector(".dob");
const csvFile = document.querySelector(".file");
const noCustomer = document.querySelector(".no-customer");
const errorDiv = document.querySelector(".error");

const BASE_URL =
  window.env.NODE_ENV === "production"
    ? window.env.BACKEND_URL
    : "http://localhost:9000";

const showError = (message) => {
  errorDiv.classList.remove("hidden");
  errorDiv.textContent = message;
  setTimeout(() => {
    errorDiv.classList.add("hidden");
    errorDiv.textContent = "";
  }, 3000);
};

const updateTableRow = (customers) => {
  console.log("hiii");
  if (noCustomer) noCustomer.textContent = "";
  customers.forEach((c) => {
    const dob = new Date(c.dateOfBirth);
    const tableRow = document.createElement("tr");
    tableRow.classList.add("c-cntn");
    console.log(c._id);
    tableRow.dataset.id = `${c._id.toString()}`;
    tableRow.innerHTML = `
          <td>${c.name}</td>
          <td>${c.email}</td>
          <td>${dob.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
          </td>
          <td>
            <button class="delete-btn">
              x
            </button>
          </td>
        `;
    tableBody.appendChild(tableRow);
  });
};

const openOverlay = () => {
  document.getElementById("overlay").style.display = "flex";
};

const closeOverlay = () => {
  const blocks = document.querySelectorAll(".customer-block");
  blocks.forEach((block, index) => {
    if (index > 0) block.remove();
  });
  document.getElementById("overlay").style.display = "none";
  if (userName) userName.value = "";
  if (userEmail) userEmail.value = "";
  if (userDob) userDob.value = "";
  if (csvFile) csvFile.value = "";
  resetForms();
};

const addMore = () => {
  const container = document.getElementById("manualInputs");
  const block = document.createElement("div");
  block.classList.add("customer-block");
  block.innerHTML = `
        <div class="form-section">
          <input type="text" class="name" name="name" required>
        </div>
        <div class="form-section">
          <input type="email" class="email" name="email" required>
        </div>
        <div class="form-section">
          <input type="date" class="dob" name="dob" required>
        </div>
        <button type="button" onclick="this.parentElement.remove()">x</button>
      `;
  container.appendChild(block);
};

const switchToCSV = () => {
  customerForm.classList.add("hidden");
  document.getElementById("csvForm").classList.remove("hidden");
  document.getElementById("formTitle").innerText = "Upload Customers via CSV";
};

const backToForm = () => {
  document.getElementById("csvForm").classList.add("hidden");
  customerForm.classList.remove("hidden");
  document.getElementById("formTitle").innerText = "Add Customer";
};

const resetForms = () => {
  customerForm.classList.remove("hidden");
  document.getElementById("csvForm").classList.add("hidden");
  document.getElementById("formTitle").innerText = "Add Customer";
};

const validateFile = (file) => {
  const allowedType = "text/csv";
  const maxSize = 3 * 1024 * 1024;
  if (file.type !== allowedType) {
    showError("Please upload a CSV file.");
    return;
  }
  if (file.size > maxSize) {
    showError("File size exceeds 5 MB.");
    return;
  }
};

customerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const customers = [];
  const names = formData.getAll("name");
  const emails = formData.getAll("email");
  const dobs = formData.getAll("dob");
  console.log("formData", names);

  if (!names.length || !emails.length || !dobs.length) {
    showError("Please add at least one customer!");
    return;
  }

  for (let i = 0; i < names.length; i++) {
    customers.push({
      name: names[i],
      email: emails[i],
      dateOfBirth: dobs[i],
    });
  }
  console.log(customers);
  await addCustomers(customers);
  resetForms();
  closeOverlay();
});

csvForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const file = formData.get("file");
  console.log("formData", file);
  if (!file) {
    showError("Please upload a csv file!");
    return;
  }
  await uploadCSV(file);
  resetForms();
  closeOverlay();
});

const uploadCSV = async (file) => {
  try {
    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/api/v1/customer/uploadCsv`,
      data: {
        csvFile: file,
      },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response);
    const status = response.data.status;
    const addedCustomers = response.data.data.customers;

    if (status === "success" || status === "partial") {
      updateTableRow(addedCustomers);
      console.log(addedCustomers);
    }

    if (status === "partial") {
      const failedCustomers = response.data.failedCustomers;
      showError(
        `Unable to add ${failedCustomers.length} customers because they already exist.`
      );
    }
  } catch (error) {
    console.error("Error adding customer", error.response);
    showError(error.response?.data?.message);
  }
};

const addCustomers = async (customers) => {
  try {
    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/api/v1/customer/addCustomers`,
      data: {
        customers,
      },
    });
    console.log(response);
    const status = response.data.status;
    const addedCustomers = response.data.data.customers;

    if (status === "success" || status === "partial") {
      updateTableRow(addedCustomers);
      console.log(addedCustomers);
    }

    if (status === "partial") {
      const failedCustomers = response.data.failedCustomers;
      showError(
        `Unable to add ${failedCustomers.length} customers because they already exist.`
      );
    }
  } catch (error) {
    console.error("Error adding customer", error.response);
    showError(error.response?.data?.message);
  }
};

tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    console.log("I'm clicked");
    const customerCntn = e.target.closest(".c-cntn");
    const customerId = customerCntn.dataset.id;

    try {
      const response = await axios({
        method: "DELETE",
        url: `${BASE_URL}/api/v1/customer/delete/${customerId}`,
      });
      console.log(response);
      if (response.data.status === "success") {
        customerCntn.remove();
      }
    } catch (err) {
      console.error("There is an error:", err);
      showError("There was an error");
    }
  }
});
