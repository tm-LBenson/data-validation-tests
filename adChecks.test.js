const { extractData } = require("./logUtils"); // Assuming your utility functions are stored here

describe("Organizational Units Tests", () => {
  let ouData = [];

  beforeAll(() => {
    const data = extractData("data.txt");
    ouData = data.ouData;
  });

  test("Each OU DN contains specific OU segments", () => {
    ouData.forEach((ou) => {
      expect(ou["@dn"]).toMatch(
        /OU=.*,OU=Training,OU=Accounts,DC=ADLAB,DC=LOCAL/,
      );
    });
  });

  test('Each OU entry should have "top" and "organizationalUnit" in objectClass', () => {
    ouData.forEach((ou) => {
      expect(ou.objectClass).toContain("top");
      expect(ou.objectClass).toContain("organizationalUnit");
    });
  });

  test("Each OU DN should adhere to specific naming conventions", () => {
    ouData.forEach((ou) => {
      expect(ou["@dn"]).toMatch(/OU=[a-zA-Z0-9]+,/); // Ensures that OU part consists of alphanumeric characters
    });
  });
});

describe("User Data Tests", () => {
  let userData = [];

  beforeAll(() => {
    const data = extractData("data.txt");
    userData = data.userData;
  });

  test("User DNs are structured correctly", () => {
    userData.forEach((user) => {
      expect(user["@dn"]).toMatch(
        /CN=.*,OU=.*,OU=.*,OU=Training,OU=Accounts,DC=ADLAB,DC=LOCAL/,
      );
    });
  });

  test("All user attributes are correctly formatted", () => {
    userData.forEach((user) => {
      expect(user.displayName).toMatch(/[A-Z][a-z]+ [A-Z][a-z]+/); // Assumes names are capitalized properly
      expect(user.employeeNumber).toMatch(/[a-zA-Z0-9]+/); // Alphanumeric employee numbers
      expect(user.sAMAccountName).toMatch(/[a-zA-Z0-9]+/); // Alphanumeric SAM account names
      if (user.idautoPersonBirthdate) {
        expect(new Date(user.idautoPersonBirthdate).toString()).not.toBe(
          "Invalid Date",
        ); // Valid date check
      }
    });
  });

  test("All users have at least one defined role", () => {
    userData.forEach((user) => {
      expect(user.employeeType).toBeDefined();
      expect(["staff", "student"]).toContain(user.employeeType);
    });
  });

  test("Birthdate should not be in the future", () => {
    const currentDate = new Date();
    userData.forEach((user) => {
      if (user.idautoPersonBirthdate) {
        expect(new Date(user.idautoPersonBirthdate)).toBeLessThanOrEqual(
          currentDate,
        );
      }
    });
  });

  test("User data should include necessary flags and descriptors", () => {
    userData.forEach((user) => {
      expect(user.idautoPersonClaimFlag).toMatch(/TRUE|FALSE/);
      expect(user.idautoPersonDeptDescr).toBeDefined();
    });
  });
});
