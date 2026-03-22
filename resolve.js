const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/layouts/SideBar.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// The `s` flag allows `.` to match newlines in JS regex.
const regex = /<<<<<<< HEAD\r?\n(.*?)\r?\n=======\r?\n(.*?)>>>>>>> 047c0ab946eb2b9f2a784ff156ac0f4ed56fe6e9\r?\n?/gs;

content = content.replace(regex, (match, head, theirs) => {
    head = head.trim();
    theirs = theirs.trim();
    
    if (head.includes('tourId') && !theirs) {
        return head + '\n';
    }
    if (head.includes('sidebar.transactions') && theirs.includes('sidebar.transactions')) {
        return head + '\n';
    }
    if (theirs.includes('sidebar-toggle-btn')) {
        return theirs + '\n';
    }
    if (head.includes('navItems.slice(0, 3)') && theirs.includes('navItems')) {
        return theirs + '\n';
    }
    console.log("UNKNOWN CONFLICT:", head, theirs);
    return match;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Conflicts resolved successfully with Node.');
