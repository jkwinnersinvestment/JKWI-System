const DEFAULT_TIMEOUT_MS = 10000;

/**
 * @interface IIdVerificationService
 * @method Verify
 * @param {string} idNumber
 * @returns {Promise<{valid: boolean, unavailable: boolean, details?: object}>}
 */
class IIdVerificationService {
    async Verify() {
        throw new Error("Verify must be implemented by an ID verification service.");
    }
}

class IHomeAffairsService {
    async IsIdRegistered() {
        throw new Error("IsIdRegistered must be implemented by a Home Affairs service.");
    }
}

function offlineSaIdCheck(idNumber) {
    if (!/^\d{13}$/.test(idNumber)) {
        return { valid: false, reason: "ID must contain exactly 13 digits." };
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

    const dateValid = date.getFullYear() === fullYear &&
        date.getMonth() === month - 1 &&
        date.getDate() === day;
    const checksumValid = (checksum + Number(idNumber[12])) % 10 === 0;
    const citizenshipDigitValid = idNumber[10] === "0" || idNumber[10] === "1";

    if (!dateValid || !checksumValid || !citizenshipDigitValid) {
        return { valid: false, reason: "ID failed offline SA validation." };
    }

    return {
        valid: true,
        details: {
            dateOfBirth: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${fullYear}`,
            gender: Number(idNumber.slice(6, 10)) >= 5000 ? "Male" : "Female",
            citizenship: idNumber[10] === "0" ? "South African citizen" : "Permanent resident"
        }
    };
}

class DhaLiveCheckService extends IIdVerificationService {
    constructor({ endpoint, apiKey, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
        super();
        this.endpoint = endpoint;
        this.apiKey = apiKey;
        this.timeoutMs = timeoutMs;
    }

    async Verify(idNumber) {
        const offlineResult = offlineSaIdCheck(idNumber);
        if (!offlineResult.valid) {
            return { ...offlineResult, unavailable: false };
        }

        if (!this.endpoint || !this.apiKey) {
            return {
                valid: false,
                unavailable: true,
                details: offlineResult.details,
                message: "Home Affairs verification service is not configured."
            };
        }

        for (let attempt = 1; attempt <= 2; attempt += 1) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

            try {
                const response = await fetch(this.endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": this.apiKey
                    },
                    body: JSON.stringify({ idNumber }),
                    signal: controller.signal
                });

                if (!response.ok) {
                    return { valid: false, unavailable: false, details: offlineResult.details };
                }

                const result = await response.json();
                return {
                    valid: result.valid === true,
                    unavailable: false,
                    details: result.details || {
                        dateOfBirth: result.dateOfBirth || result.dob,
                        gender: result.gender
                    }
                };
            } catch (error) {
                if (attempt === 2) {
                    console.warn("Live DHA check unavailable; falling back to Layer 1 only.");
                    return {
                        valid: false,
                        unavailable: true,
                        details: offlineResult.details,
                        message: "Live DHA check unavailable. Please try again."
                    };
                }
            } finally {
                clearTimeout(timeout);
            }
        }
    }

    async IsIdRegistered(idNumber) {
        const result = await this.Verify(idNumber);
        return result.valid === true;
    }
}

class IdVerificationService extends DhaLiveCheckService {}

const idVerificationService = new IdVerificationService({
    endpoint: process.env.HOME_AFFAIRS_API_URL ||
        process.env.DHA_API_URL ||
        `${(process.env.HOME_AFFAIRS_BASE_URL || process.env.DHA_BASE_URL || "https://api.YOUR_PROVIDER.co.za").replace(/\/$/, "")}/id/verify`,
    apiKey: process.env.HOME_AFFAIRS_API_KEY || process.env.DHA_API_KEY || process.env.SA_ID_VERIFICATION_API_KEY,
    timeoutMs: Number(process.env.HOME_AFFAIRS_TIMEOUT_MS || process.env.DHA_TIMEOUT_MS || 10000)
});

module.exports = {
    IIdVerificationService,
    IHomeAffairsService,
    IdVerificationService,
    DhaLiveCheckService,
    offlineSaIdCheck,
    idVerificationService
};
