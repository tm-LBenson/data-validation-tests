const fs = require('fs');
const path = require('path');


const calculateAge = (birthYear) => 2025 - parseInt(birthYear, 10);


const dataPath = path.join(__dirname, 'data.json');
let data;

beforeAll(() => {
    const rawData = fs.readFileSync(dataPath, 'utf8');
    data = JSON.parse(rawData);
});

describe('Data Validation Suite', () => {
    test('File should contain valid data', () => {
        expect(data).toBeInstanceOf(Array);
    });

    test('There should be 375 students', () => {
        const students = data.filter(person => person.employeeType === 'student');
        expect(students.length).toBe(375);
    });

    test('There should be 125 staff members', () => {
        const staff = data.filter(person => person.employeeType === 'staff');
        expect(staff.length).toBe(125);
    });

    test('Each school should have exactly one principal', () => {
        const principalsBySchool = data
            .filter(person => person.employeeType === 'staff' && person.idautoPersonDeptDescrs === 'Principal')
            .reduce((acc, principal) => {
                acc[principal.l] = (acc[principal.l] || 0) + 1;
                return acc;
            }, {});

        Object.entries(principalsBySchool).forEach(([school, count]) => {
            expect(count).toBe(1);
        });
        expect(Object.keys(principalsBySchool).length).toBe(3); // There should be exactly 3 schools
    });

    test('There should be 3 schools based on the "l" field', () => {
        const schools = new Set(data.map(person => person.l));
        expect(schools.size).toBe(3);
    });

    test('Each email should be correctly formatted', () => {
        const invalidEmails = data.filter(person => {
            const expectedEmail = `${person.idautoPersonSAMAccountName}@lbenson.trainingexample.org`;
            return person.mail !== expectedEmail;
        });

        if (invalidEmails.length > 0) {
            console.error('Invalid emails:', invalidEmails.map(person => ({
                name: person.displayName,
                expected: `${person.idautoPersonSAMAccountName}@lbenson.trainingexample.org`,
                actual: person.mail
            })));
        }

        expect(invalidEmails).toHaveLength(0);
    });

    test('Each teacher should have at least 3 classes assigned', () => {
        const teachers = data.filter(person => person.employeeType === 'staff' && person.idautoPersonDeptDescrs === 'Teacher');
        const teachersWithoutClasses = teachers.filter(teacher => {
            return !Array.isArray(teacher.idautoPersonExt1) || teacher.idautoPersonExt1.length < 3;
        });

        if (teachersWithoutClasses.length > 0) {
            console.error(
                'Teachers without enough classes:',
                teachersWithoutClasses.map(teacher => ({
                    name: teacher.displayName,
                    assignedClasses: teacher.idautoPersonExt1 || []
                }))
            );
        }

        expect(teachersWithoutClasses).toHaveLength(0);
    });

    test('Each student should have at least 1 associated teacher', () => {
        const students = data.filter(person => person.employeeType === 'student');
        const studentsWithoutTeachers = students.filter(student => !student.idautoPersonTeachers);

        if (studentsWithoutTeachers.length > 0) {
            console.error(
                'Students without associated teachers:',
                studentsWithoutTeachers.map(student => student.displayName)
            );
        }

        expect(studentsWithoutTeachers).toHaveLength(0);
    });

    test('Each teacher should have multiple students', () => {
        const teachers = data.filter(person => person.employeeType === 'staff' && person.idautoPersonDeptDescrs === 'Teacher');
        const teachersWithoutStudents = teachers.filter(teacher => {
            return !Array.isArray(teacher.idautoPersonStudents) || teacher.idautoPersonStudents.length < 2;
        });

        if (teachersWithoutStudents.length > 0) {
            console.error(
                'Teachers without enough students:',
                teachersWithoutStudents.map(teacher => ({
                    name: teacher.displayName,
                    students: teacher.idautoPersonStudents || []
                }))
            );
        }

        expect(teachersWithoutStudents).toHaveLength(0);
    });

    test('Staff members should be aged between 30 and 50', () => {
        const staff = data.filter(person => person.employeeType === 'staff');
        const staffOutOfRange = staff.filter(person => {
            const birthYear = person.idautoPersonBirthdate.slice(0, 4);
            const age = calculateAge(birthYear);
            return age < 30 || age > 50;
        });

        if (staffOutOfRange.length > 0) {
            console.error('Staff members out of age range:', staffOutOfRange.map(s => s.displayName));
        }

        expect(staffOutOfRange).toHaveLength(0);
    });
});
