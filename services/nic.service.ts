export const nicService = {
    /**
     * Parse Sri Lankan NIC to extract DOB, Gender, and Age.
     * Supports Old (9 digits + V/X) and New (12 digits) formats.
     */
    parseNIC: (nic: string) => {
        const cleanNIC = nic.toUpperCase().trim();
        let year = 0;
        let dayOfYear = 0;
        let gender: "Male" | "Female" = "Male";

        if (/^(\d{2})(\d{3})(\d{4})[VX]$/.test(cleanNIC)) {
            // Old NIC format: 856234567V
            year = parseInt("19" + cleanNIC.substring(0, 2));
            dayOfYear = parseInt(cleanNIC.substring(2, 5));
        } else if (/^(\d{4})(\d{3})(\d{5})$/.test(cleanNIC)) {
            // New NIC format: 198562345678
            year = parseInt(cleanNIC.substring(0, 4));
            dayOfYear = parseInt(cleanNIC.substring(4, 7));
        } else {
            return null;
        }

        if (dayOfYear > 500) {
            gender = "Female";
            dayOfYear -= 500;
        }

        // Days validation (approximate)
        if (dayOfYear < 1 || dayOfYear > 366) return null;

        // Calculate Date of Birth
        // We use UTC to avoid timezone shifts when formatting to YYYY-MM-DD
        const dob = new Date(Date.UTC(year, 0, dayOfYear));
        const dobString = dob.toISOString().split("T")[0];

        // Calculate Age
        const today = new Date();
        let age = today.getFullYear() - year;

        // Adjust age if birthday hasn't happened yet this year
        const birthdayCurrentYear = new Date(today.getFullYear(), dob.getUTCMonth(), dob.getUTCDate());
        if (today < birthdayCurrentYear) {
            age--;
        }

        return {
            dob: dobString,
            gender,
            age
        };
    },

    /**
     * Validate if gender derived from NIC matches selected customer type.
     */
    validateTypeGender: (type: string, gender: string): { valid: boolean; message?: string } => {
        if (type === "Loan Customer" && gender !== "Female") {
            return { valid: false, message: "Loan Customers must be Female according to NIC." };
        }
        return { valid: true };
    }
};
