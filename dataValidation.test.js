const fs = require('fs');
const path = require('path');

// Function to calculate age based on the year of birth
const calculateAge = (birthYear) => 2025 - parseInt(birthYear, 10);

// Read the data.json file
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
    test('Each student should have classes taught by their associated teacher', () => {
        const students = data.filter(person => person.employeeType === 'student');
        const staff = data.filter(person => person.employeeType === 'staff' && person.idautoPersonDeptDescrs === 'Teacher');
    
        const studentsWithInvalidClasses = students.filter(student => {
            const teacherIds = Array.isArray(student.idautoPersonTeachers)
                ? student.idautoPersonTeachers.map(t => t.split(',')[0].split('=')[1]) // Extract teacher IDs
                : [student.idautoPersonTeachers?.split(',')[0]?.split('=')[1]].filter(Boolean); // Single teacher fallback
    
            const teachers = staff.filter(teacher => teacherIds.includes(teacher.idautoID));
    
            // Collect all classes taught by the student's associated teachers
            const classesTaught = teachers.reduce((classes, teacher) => {
                return classes.concat(teacher.idautoPersonExt1 || []);
            }, []);
    
            return student.idautoPersonExt1.some(studentClass => !classesTaught.includes(studentClass));
        });
    
        if (studentsWithInvalidClasses.length > 0) {
            console.error(
                'Students with invalid classes:',
                studentsWithInvalidClasses.map(student => ({
                    name: student.displayName,
                    studentClasses: student.idautoPersonExt1,
                    teacherClasses: staff
                        .filter(teacher => (student.idautoPersonTeachers || []).includes(teacher.idautoID))
                        .map(teacher => ({
                            name: teacher.displayName,
                            classes: teacher.idautoPersonExt1,
                        })),
                }))
            );
        }
    
        expect(studentsWithInvalidClasses).toHaveLength(0);
    });
    
    test('Students should be aged appropriately for their grades', () => {
        const students = data.filter(person => person.employeeType === 'student');
        const gradeAgeMapping = {
            PK: [3, 5],
            K: [5, 6],
            "1": [6, 7],
            "2": [7, 8],
            "3": [8, 9],
            "4": [9, 10],
            "5": [10, 11],
            "6": [11, 12],
            "7": [12, 13],
            "8": [13, 14],
            "9": [14, 15],
            "10": [15, 16],
            "11": [16, 17],
            "12": [17, 18],
        };

        const studentsOutOfRange = students.filter(student => {
            const birthYear = student.idautoPersonBirthdate.slice(0, 4);
            const age = calculateAge(birthYear);
            const grade = student.idautoPersonGradeLevel;
            const [minAge, maxAge] = gradeAgeMapping[grade] || [0, 0];
            return age < minAge || age > maxAge;
        });

        if (studentsOutOfRange.length > 0) {
            console.error('Students out of age range:', studentsOutOfRange.map(s => s.displayName));
        }

        expect(studentsOutOfRange).toHaveLength(0);
    });
});
