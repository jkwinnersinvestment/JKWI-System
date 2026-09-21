const form = document.getElementById("registerForm");
const message = document.getElementById("message");
const registerButton = document.getElementById("registerButton");
const idNumberInput = document.getElementById("idNumber");
const idNumberError = document.getElementById("idNumberError");
const idDetails = document.getElementById("idDetails");

let idVerification = { value: "", valid: false, pending: false };

const requiredFields = [
    "firstName", "lastName", "idNumber", "email", "phone",
    "addressLine1", "city", "province", "postalCode",
    "password", "confirmPassword"
].map(id => document.getElementById(id));

const saPhonePattern = /^(?:0|\+27)[678]\d{8}$/;
const postalCodePattern = /^\d{4}$/;
const provinceInput = document.getElementById("province");
const cityInput = document.getElementById("city");
const postalCodeInput = document.getElementById("postalCode");
const provinceCities = {
    "Eastern Cape": [{ name: "Gqeberha", postalCode: "6001" }, { name: "East London", postalCode: "5201" }, { name: "Mthatha", postalCode: "5100" }, { name: "Bhisho", postalCode: "5605" }],
    "Free State": [{ name: "Bloemfontein", postalCode: "9301" }, { name: "Welkom", postalCode: "9460" }, { name: "Bethlehem", postalCode: "9701" }, { name: "Kroonstad", postalCode: "9500" }],
    "Gauteng": [{ name: "Johannesburg", postalCode: "2001" }, { name: "Pretoria", postalCode: "0001" }, { name: "Sandton", postalCode: "2196" }, { name: "Soweto", postalCode: "1804" }, { name: "Centurion", postalCode: "0157" }, { name: "Midrand", postalCode: "1685" }],
    "KwaZulu-Natal": [{ name: "Durban", postalCode: "4001" }, { name: "Pietermaritzburg", postalCode: "3201" }, { name: "Newcastle", postalCode: "2940" }, { name: "Richards Bay", postalCode: "3900" }],
    "Limpopo": [{ name: "Polokwane", postalCode: "0699" }, { name: "Tzaneen", postalCode: "0850" }, { name: "Thohoyandou", postalCode: "0950" }, { name: "Musina", postalCode: "0900" }],
    "Mpumalanga": [{ name: "Mbombela", postalCode: "1201" }, { name: "Emalahleni", postalCode: "1035" }, { name: "Secunda", postalCode: "2302" }, { name: "Middelburg", postalCode: "1050" }],
    "Northern Cape": [{ name: "Kimberley", postalCode: "8301" }, { name: "Upington", postalCode: "8801" }, { name: "Kuruman", postalCode: "8460" }, { name: "De Aar", postalCode: "7000" }],
    "North West": [{ name: "Mahikeng", postalCode: "2745" }, { name: "Rustenburg", postalCode: "2999" }, { name: "Klerksdorp", postalCode: "2571" }, { name: "Potchefstroom", postalCode: "2520" }],
    "Western Cape": [{ name: "Cape Town", postalCode: "8001" }, { name: "Stellenbosch", postalCode: "7600" }, { name: "George", postalCode: "6529" }, { name: "Paarl", postalCode: "7646" }]
};
const addressLine1Input = document.getElementById("addressLine1");
const addressSuggestions = document.getElementById("addressSuggestions");
let savedAddresses = [];
let googleAutocompleteService;
let googlePlacesService;
let googleDebounceTimer;

function offlineSaIdCheck(idNumber) {
    if (!/^\d{13}$/.test(idNumber)) {
        return null;
    }

    const year = Number(idNumber.slice(0, 2));
    const month = Number(idNumber.slice(2, 4));
    const day = Number(idNumber.slice(4, 6));
    const currentYear = new Date().getFullYear() % 100;
    const fullYear = year <= currentYear ? 2000 + year : 1900 + year;
    const date = new Date(fullYear, month - 1, day);
    const checksum = idNumber.slice(0, 12).split("").reduce((sum, digit, index) => {
        if (index % 2 === 0) {
            return sum + Number(digit);
        }

        const doubled = Number(digit) * 2;
        return sum + (doubled > 9 ? doubled - 9 : doubled);
    }, 0);

    const luhnValid = (checksum + Number(idNumber[12])) % 10 === 0;
    const citizenshipDigitValid = idNumber[10] === "0" || idNumber[10] === "1";
    const dateValid = date.getFullYear() === fullYear &&
        date.getMonth() === month - 1 &&
        date.getDate() === day;

    if (!dateValid || !luhnValid || !citizenshipDigitValid) {
        return null;
    }

    return {
        dateOfBirth: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${fullYear}`,
        gender: Number(idNumber.slice(6, 10)) >= 5000 ? "Male" : "Female",
        citizenship: idNumber[10] === "0" ? "South African citizen" : "Permanent resident"
    };
}

function addressValue(id) {
    return document.getElementById(id).value.trim();
}

function fillAddress(address) {
    document.getElementById("addressLine1").value = address.addressLine1 || "";
    document.getElementById("addressLine2").value = address.addressLine2 || "";
    provinceInput.value = address.province || "";
    populateCities(provinceInput.value, address.city, address.postalCode);
    postalCodeInput.value = address.postalCode || postalCodeInput.value;
    hideAddressSuggestions();
    updateSubmitState();
}

function populateCities(province, selectedCity = "", selectedPostalCode = "") {
    cityInput.innerHTML = "";
    cityInput.disabled = !province;

    if (!province) {
        cityInput.add(new Option("Select province first", ""));
        postalCodeInput.value = "";
        return;
    }

    cityInput.add(new Option("Select city / town", ""));
    (provinceCities[province] || []).forEach(city => {
        const option = new Option(city.name, city.name);
        option.dataset.postalCode = city.postalCode;
        cityInput.add(option);
    });

    if (selectedCity && ![...cityInput.options].some(option => option.value === selectedCity)) {
        cityInput.add(new Option(selectedCity, selectedCity));
    }

    cityInput.value = selectedCity || "";
    if (selectedPostalCode) {
        postalCodeInput.value = selectedPostalCode;
    }
}

function hideAddressSuggestions() {
    addressSuggestions.innerHTML = "";
    addressSuggestions.classList.remove("visible");
}

function showAddressSuggestions(items) {
    addressSuggestions.innerHTML = "";
    items.forEach(item => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "address-suggestion";
        option.textContent = item.label;
        option.addEventListener("click", item.onSelect);
        addressSuggestions.appendChild(option);
    });
    if (items.length) {
        addressSuggestions.classList.add("visible");
    }
}

function showSavedAddresses() {
    const items = savedAddresses.map(address => ({
        label: address.label || address.addressLine1,
        onSelect: () => fillAddress(address)
    }));
    items.push({
        label: "Use another address",
        onSelect: () => {
            addressLine1Input.value = "";
            hideAddressSuggestions();
            addressLine1Input.focus();
        }
    });
    showAddressSuggestions(items);
}

async function loadSavedAddresses() {
    try {
        const localAddresses = JSON.parse(localStorage.getItem("jkwiSavedAddresses") || "[]");
        savedAddresses = Array.isArray(localAddresses) ? localAddresses : [];
    } catch (error) {
        savedAddresses = [];
    }

    const token = localStorage.getItem("jkwiToken") || sessionStorage.getItem("jkwiToken");
    if (!token) {
        return;
    }

    try {
        const response = await fetch("/api/users/saved-addresses", {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            savedAddresses = [...savedAddresses, ...(data.addresses || [])];
        }
    } catch (error) {
        console.warn("Saved addresses unavailable:", error);
    }
}

function initGooglePlaces() {
    if (!window.google || !google.maps || !google.maps.places) {
        return;
    }

    googleAutocompleteService = new google.maps.places.AutocompleteService();
    const map = document.createElement("div");
    googlePlacesService = new google.maps.places.PlacesService(map);
}

function loadGooglePlaces() {
    const key = window.JKWI_GOOGLE_MAPS_API_KEY;
    if (!key || key === "YOUR_KEY" || document.getElementById("googlePlacesScript")) {
        return;
    }

    window.initGooglePlaces = initGooglePlaces;
    const script = document.createElement("script");
    script.id = "googlePlacesScript";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

function showGoogleSuggestions(query) {
    if (!googleAutocompleteService || query.length < 3) {
        return;
    }

    googleAutocompleteService.getPlacePredictions({
        input: query,
        componentRestrictions: { country: "za" },
        types: ["address"]
    }, predictions => {
        if (!predictions) {
            hideAddressSuggestions();
            return;
        }

        showAddressSuggestions(predictions.map(prediction => ({
            label: prediction.description,
            onSelect: () => selectGooglePlace(prediction.place_id)
        })));
    });
}

function selectGooglePlace(placeId) {
    googlePlacesService.getDetails({ placeId, fields: ["address_components", "formatted_address"] }, place => {
        const components = {};
        (place.address_components || []).forEach(component => {
            component.types.forEach(type => { components[type] = component.long_name; });
        });

        fillAddress({
            addressLine1: [components.street_number, components.route].filter(Boolean).join(" ") || place.formatted_address,
            addressLine2: "",
            city: components.locality || components.postal_town || components.sublocality || "",
            province: components.administrative_area_level_1 || "",
            postalCode: components.postal_code || ""
        });
    });
}

addressLine1Input.addEventListener("focus", () => {
    if (!addressLine1Input.value.trim() && savedAddresses.length) {
        showSavedAddresses();
    }
});

provinceInput.addEventListener("change", () => {
    populateCities(provinceInput.value);
    updateSubmitState();
});

cityInput.addEventListener("change", () => {
    const selected = cityInput.options[cityInput.selectedIndex];
    if (selected && selected.dataset.postalCode) {
        postalCodeInput.value = selected.dataset.postalCode;
    }
    updateSubmitState();
});

addressLine1Input.addEventListener("input", () => {
    hideAddressSuggestions();
    window.clearTimeout(googleDebounceTimer);
    const query = addressLine1Input.value.trim();
    if (!query) {
        if (savedAddresses.length) {
            showSavedAddresses();
        }
        return;
    }
    googleDebounceTimer = window.setTimeout(() => showGoogleSuggestions(query), 300);
    updateSubmitState();
});

document.addEventListener("click", event => {
    if (!event.target.closest(".address-autocomplete")) {
        hideAddressSuggestions();
    }
});

async function verifyIdNumber(idNumber) {
    idVerification = { value: idNumber, valid: false, pending: true };
    idNumberError.textContent = "Checking with Home Affairs...";
    idNumberError.className = "field-error loading";
    idDetails.textContent = "";
    updateSubmitState();

    try {
        const response = await fetch("/api/users/verify-id", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idNumber })
        });
        const data = await response.json();

        if (idVerification.value !== idNumber) {
            return;
        }

        idVerification = {
            value: idNumber,
            valid: response.ok && data.valid === true,
            pending: false
        };

        if (!idVerification.valid) {
            idNumberError.textContent = data.message || "ID number not found on Home Affairs database";
            idNumberError.className = "field-error";
            return;
        }

        idNumberError.textContent = "Verified with Home Affairs";
        idNumberError.className = "field-error valid";
        idDetails.textContent = `DOB: ${data.details.dateOfBirth} | ${data.details.gender} | ${data.details.citizenship}`;
    } catch (error) {
        idVerification = { value: idNumber, valid: false, pending: false };
        idNumberError.textContent = "Home Affairs verification service is unavailable. Please try again.";
        idNumberError.className = "field-error";
    } finally {
        updateSubmitState();
    }
}

function updateSubmitState() {
    const phone = document.getElementById("phone");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const phoneValue = phone.value.replace(/[\s-]/g, "");
    const valid = requiredFields.every(field => field.value.trim() !== "") &&
        email.checkValidity() &&
        saPhonePattern.test(phoneValue) &&
        postalCodePattern.test(document.getElementById("postalCode").value) &&
        password.value.length >= 8 &&
        password.value === confirmPassword.value &&
        idVerification.value === idNumberInput.value &&
        idVerification.valid &&
        !idVerification.pending;

    document.getElementById("phoneError").textContent = phone.value && !saPhonePattern.test(phoneValue)
        ? "Enter a valid SA number, e.g. 0821234567."
        : "";
    document.getElementById("passwordError").textContent = password.value && password.value.length < 8
        ? "Password must contain at least 8 characters."
        : "";
    document.getElementById("confirmPasswordError").textContent = confirmPassword.value && password.value !== confirmPassword.value
        ? "Passwords do not match."
        : "";
    registerButton.disabled = !valid;
    return valid;
}

idNumberInput.addEventListener("input", () => {
    idNumberInput.value = idNumberInput.value.replace(/\D/g, "").slice(0, 13);
    idVerification = { value: idNumberInput.value, valid: false, pending: false };
    idNumberError.textContent = "";
    idDetails.textContent = "";
    updateSubmitState();
});

idNumberInput.addEventListener("blur", () => {
    const details = offlineSaIdCheck(idNumberInput.value);
    if (!details) {
        idVerification = { value: idNumberInput.value, valid: false, pending: false };
        idNumberError.textContent = "ID number not found on Home Affairs database";
        updateSubmitState();
        return;
    }

    verifyIdNumber(idNumberInput.value);
});

requiredFields.forEach(field => field.addEventListener("input", updateSubmitState));
form.addEventListener("change", updateSubmitState);

form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!updateSubmitState()) {
        showMessage("Please correct the highlighted fields and verify your ID.", "error");
        return;
    }

    registerButton.disabled = true;
    registerButton.textContent = "Creating Account...";

    const value = id => document.getElementById(id).value.trim();
    const payload = {
        firstName: value("firstName"),
        lastName: value("lastName"),
        idNumber: value("idNumber"),
        email: value("email").toLowerCase(),
        phone: value("phone"),
        addressLine1: value("addressLine1"),
        addressLine2: value("addressLine2"),
        city: value("city"),
        province: value("province"),
        postalCode: value("postalCode"),
        password: document.getElementById("password").value,
        confirmPassword: document.getElementById("confirmPassword").value,
        accountType: "customer"
    };

    try {
        const response = await fetch("/api/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.message || "Registration failed.");
        }

        sessionStorage.setItem("jkwiRegistrationEmail", payload.email);
        sessionStorage.setItem("jkwiPendingUser", JSON.stringify(data.user));
        const saved = JSON.parse(localStorage.getItem("jkwiSavedAddresses") || "[]");
        saved.push({
            label: payload.addressLine1,
            addressLine1: payload.addressLine1,
            addressLine2: payload.addressLine2,
            city: payload.city,
            province: payload.province,
            postalCode: payload.postalCode
        });
        localStorage.setItem("jkwiSavedAddresses", JSON.stringify(saved.slice(-5)));
        showMessage("Account created successfully. Redirecting...", "success");
        setTimeout(() => {
            window.location.href = `/VerifyEmail?email=${encodeURIComponent(payload.email)}`;
        }, 1000);
    } catch (error) {
        showMessage(error.message || "Unable to create account.", "error");
        registerButton.disabled = false;
        registerButton.textContent = "Create Account";
    }
});

function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
}

updateSubmitState();
populateCities("");
loadSavedAddresses();
loadGooglePlaces();
