const fs = require('fs');
const path = require('path');

// Load the data
const dataPath = path.join(__dirname, 'data.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(rawData);


const studentsWithoutTeachers = data.filter(person => 
    person.employeeType === 'student' && !person.idautoPersonTeachers
);


const gradeLevelGrouping = studentsWithoutTeachers.reduce((acc, student) => {
    const grade = student.idautoPersonGradeLevel || 'Unknown';
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
}, {});


const classGrouping = studentsWithoutTeachers.reduce((acc, student) => {
    (student.idautoPersonExt1 || []).forEach(cls => {
        acc[cls] = (acc[cls] || 0) + 1;
    });
    return acc;
}, {});

const locationGrouping = studentsWithoutTeachers.reduce((acc, student) => {
    const location = student.l || 'Unknown';
    acc[location] = acc[location] || { total: 0, grades: {}, classes: {} };
    acc[location].total += 1;

    const grade = student.idautoPersonGradeLevel || 'Unknown';
    acc[location].grades[grade] = (acc[location].grades[grade] || 0) + 1;


    (student.idautoPersonExt1 || []).forEach(cls => {
        acc[location].classes[cls] = (acc[location].classes[cls] || 0) + 1;
    });

    return acc;
}, {});


console.log('Grade Level Distribution:', gradeLevelGrouping);
console.log('Class Distribution:', classGrouping);
console.log('Location Distribution:', locationGrouping);
